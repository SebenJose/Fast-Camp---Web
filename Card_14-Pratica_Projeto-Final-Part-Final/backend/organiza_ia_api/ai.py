import logging
from dataclasses import dataclass

import httpx

from organiza_ia_api.settings import get_settings

logger = logging.getLogger('organiza_ia_api')

# Restringe o agente ao contexto de planejamento para conter o consumo
# de tokens; para liberar assuntos gerais, basta ajustar este prompt.
SYSTEM_PROMPT = (
    'Você é o Organiza.IA, um assistente de produtividade e planejamento '
    'semanal. Ajude apenas com: organização de rotina e agenda, '
    'planejamento de dias e semanas, criação e priorização de tarefas, '
    'hábitos e gestão de tempo. Se o usuário pedir qualquer coisa fora '
    'desse contexto, responda apenas que você não tem acesso a esse tipo '
    'de informação e se coloque à disposição para ajudar com o '
    'planejamento da semana. Responda sempre em português do Brasil, de '
    'forma curta e objetiva, em texto simples, sem tabelas nem '
    'formatação markdown.'
)


class AiServiceError(Exception):
    pass


class AiNotConfiguredError(AiServiceError):
    pass


@dataclass
class AiReply:
    content: str
    input_tokens: int
    output_tokens: int


async def _request_completion(
    client: httpx.AsyncClient, model: str, history: list[dict[str, str]]
) -> AiReply:
    settings = get_settings()

    response = await client.post(
        f'{settings.AI_BASE_URL}/chat/completions',
        headers={'Authorization': f'Bearer {settings.AI_API_KEY}'},
        json={
            'model': model,
            'messages': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                *history,
            ],
            'max_tokens': settings.AI_MAX_OUTPUT_TOKENS,
        },
    )
    response.raise_for_status()
    data = response.json()
    content = data['choices'][0]['message']['content']

    if not isinstance(content, str) or not content.strip():
        raise AiServiceError

    usage = data.get('usage') or {}

    return AiReply(
        content=content.strip(),
        input_tokens=int(usage.get('prompt_tokens') or 0),
        output_tokens=int(usage.get('completion_tokens') or 0),
    )


async def generate_reply(history: list[dict[str, str]]) -> AiReply:
    settings = get_settings()

    if not settings.AI_API_KEY:
        raise AiNotConfiguredError

    # AI_MODEL aceita uma lista separada por vírgula: modelos gratuitos
    # vivem rate-limited, então cada um funciona como fallback do anterior.
    models = [
        model.strip()
        for model in settings.AI_MODEL.split(',')
        if model.strip()
    ]

    if not models:
        raise AiNotConfiguredError

    async with httpx.AsyncClient(
        timeout=settings.AI_TIMEOUT_SECONDS
    ) as client:
        for model in models:
            try:
                return await _request_completion(client, model, history)
            except (
                httpx.HTTPError,
                KeyError,
                IndexError,
                TypeError,
                ValueError,
                AiServiceError,
            ) as error:
                logger.warning(
                    'Falha na chamada da LLM (%s): %r', model, error
                )
                last_error = error

    raise AiServiceError from last_error
