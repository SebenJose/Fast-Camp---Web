import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any, Callable

import httpx

from organiza_ia_api.settings import get_settings

logger = logging.getLogger('organiza_ia_api')

SYSTEM_PROMPT = (
    'Você é o Organiza.IA, um assistente de produtividade e planejamento '
    'semanal. Ajude apenas com: organização de rotina e agenda, '
    'planejamento de dias e semanas, criação e priorização de tarefas, '
    'hábitos e gestão de tempo. Você tem ferramentas para consultar, '
    'criar, editar e excluir cards na agenda diária do usuário — uma '
    'rotina única do dia, sem datas — e para ajustar o início e o fim '
    'do dia visível. A agenda é uma rotina recorrente: um card criado '
    'vale para todos os dias, não para uma data específica. Se o usuário '
    'pedir para marcar em um dia específico ou em "amanhã", explique que '
    'a agenda representa a rotina que se repete todo dia (não tem datas) '
    'e ofereça adicionar o bloco a essa rotina. Use as ferramentas '
    'sempre que o usuário pedir para marcar, criar, consultar, editar, '
    'remover compromissos ou mudar o horário do dia. Para editar ou '
    'excluir um card, primeiro chame list_schedule_events para achar o '
    'id do card pelo título e então chame a ferramenta com esse id. '
    'Nunca recuse um horário por conta própria: chame a ferramenta, que '
    'valida os limites do dia do usuário, e repasse o motivo se ela '
    'retornar erro. Só confirme uma ação depois que a ferramenta '
    'retornar sucesso. Se o '
    'usuário pedir qualquer coisa fora desse contexto, responda apenas '
    'que você '
    'não tem acesso a esse tipo de informação e se coloque à disposição '
    'para ajudar com o planejamento da semana. Responda sempre em '
    'português do Brasil, de forma curta e objetiva, em texto simples, '
    'sem tabelas nem formatação markdown.'
)

AGENDA_TOOLS = [
    {
        'type': 'function',
        'function': {
            'name': 'create_schedule_event',
            'description': (
                'Cria um card na agenda diária do usuário (rotina única '
                'do dia, sem datas). O início deve cair entre 06:00 e '
                '21:59; o fim deve respeitar o intervalo visível do dia '
                'do usuário. A ferramenta valida tudo e retorna erro '
                'explicativo quando o horário não é permitido.'
            ),
            'parameters': {
                'type': 'object',
                'properties': {
                    'title': {
                        'type': 'string',
                        'description': 'Título curto do card',
                    },
                    'startTime': {
                        'type': 'string',
                        'description': 'Início no formato HH:mm',
                    },
                    'endTime': {
                        'type': 'string',
                        'description': 'Fim no formato HH:mm',
                    },
                    'tone': {
                        'type': 'string',
                        'enum': ['slate', 'mint', 'sky', 'amber', 'rose'],
                        'description': 'Cor do card (opcional)',
                    },
                },
                'required': ['title', 'startTime', 'endTime'],
            },
        },
    },
    {
        'type': 'function',
        'function': {
            'name': 'list_schedule_events',
            'description': (
                'Lista os cards atuais da agenda diária do usuário, '
                'agrupados por período (morning, lunch, afternoon, night). '
                'Cada card traz seu id, necessário para editar ou excluir.'
            ),
            'parameters': {'type': 'object', 'properties': {}},
        },
    },
    {
        'type': 'function',
        'function': {
            'name': 'update_schedule_event',
            'description': (
                'Edita um card existente da agenda. Informe o eventId '
                '(obtido em list_schedule_events) e só os campos que mudam; '
                'os demais permanecem como estão. A ferramenta valida os '
                'horários e retorna erro explicativo quando não são '
                'permitidos.'
            ),
            'parameters': {
                'type': 'object',
                'properties': {
                    'eventId': {
                        'type': 'string',
                        'description': 'Id do card a editar',
                    },
                    'title': {
                        'type': 'string',
                        'description': 'Novo título (opcional)',
                    },
                    'startTime': {
                        'type': 'string',
                        'description': 'Novo início no formato HH:mm (opcional)',
                    },
                    'endTime': {
                        'type': 'string',
                        'description': 'Novo fim no formato HH:mm (opcional)',
                    },
                    'tone': {
                        'type': 'string',
                        'enum': ['slate', 'mint', 'sky', 'amber', 'rose'],
                        'description': 'Nova cor do card (opcional)',
                    },
                },
                'required': ['eventId'],
            },
        },
    },
    {
        'type': 'function',
        'function': {
            'name': 'delete_schedule_event',
            'description': (
                'Exclui um card da agenda. Informe o eventId obtido em '
                'list_schedule_events.'
            ),
            'parameters': {
                'type': 'object',
                'properties': {
                    'eventId': {
                        'type': 'string',
                        'description': 'Id do card a excluir',
                    },
                },
                'required': ['eventId'],
            },
        },
    },
    {
        'type': 'function',
        'function': {
            'name': 'set_day_range',
            'description': (
                'Ajusta o intervalo visível do dia do usuário (hora de '
                'início e de fim da agenda). O fim precisa ser depois do '
                'início. Cards fora do novo intervalo deixam de aparecer.'
            ),
            'parameters': {
                'type': 'object',
                'properties': {
                    'startTime': {
                        'type': 'string',
                        'description': 'Início do dia no formato HH:mm',
                    },
                    'endTime': {
                        'type': 'string',
                        'description': 'Fim do dia no formato HH:mm',
                    },
                },
                'required': ['startTime', 'endTime'],
            },
        },
    },
]

# Rodadas máximas de ferramentas por interação; na última o modelo é
# forçado a responder em texto para a conversa não ficar em loop.
MAX_TOOL_ROUNDS = 3

ToolExecutor = Callable[[str, dict[str, Any]], dict[str, Any]]


class AiServiceError(Exception):
    pass


class AiNotConfiguredError(AiServiceError):
    pass


@dataclass
class AiReply:
    content: str
    input_tokens: int
    output_tokens: int
    tools_executed: bool = False


async def _request_chat(
    client: httpx.AsyncClient,
    model: str,
    messages: list[dict[str, Any]],
    use_tools: bool,
    force_text: bool,
) -> tuple[dict[str, Any], int, int]:
    settings = get_settings()

    payload: dict[str, Any] = {
        'model': model,
        'messages': messages,
        'max_tokens': settings.AI_MAX_OUTPUT_TOKENS,
    }
    if use_tools:
        payload['tools'] = AGENDA_TOOLS
        if force_text:
            payload['tool_choice'] = 'none'

    response = await client.post(
        f'{settings.AI_BASE_URL}/chat/completions',
        headers={'Authorization': f'Bearer {settings.AI_API_KEY}'},
        json=payload,
    )
    response.raise_for_status()
    data = response.json()
    message = data['choices'][0]['message']
    usage = data.get('usage') or {}

    return (
        message,
        int(usage.get('prompt_tokens') or 0),
        int(usage.get('completion_tokens') or 0),
    )


def _execute_tool_call(
    execute_tool: ToolExecutor, call: dict[str, Any]
) -> dict[str, Any]:
    function = call.get('function') or {}
    name = str(function.get('name') or '')

    try:
        arguments = json.loads(function.get('arguments') or '{}')
    except (TypeError, ValueError):
        arguments = None

    if not isinstance(arguments, dict):
        return {'error': 'Argumentos inválidos para a ferramenta.'}

    return execute_tool(name, arguments)


async def _run_conversation(
    client: httpx.AsyncClient,
    model: str,
    history: list[dict[str, Any]],
    execute_tool: ToolExecutor | None,
    state: dict[str, bool],
) -> AiReply:
    messages: list[dict[str, Any]] = [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        *history,
    ]
    input_total = 0
    output_total = 0

    for round_index in range(MAX_TOOL_ROUNDS + 1):
        force_text = round_index == MAX_TOOL_ROUNDS
        message, input_tokens, output_tokens = await _request_chat(
            client, model, messages, execute_tool is not None, force_text
        )
        input_total += input_tokens
        output_total += output_tokens

        tool_calls = message.get('tool_calls') or []

        if execute_tool and tool_calls and not force_text:
            state['tools_executed'] = True
            messages.append({'role': 'assistant', **message})
            for call in tool_calls:
                result = await asyncio.to_thread(
                    _execute_tool_call, execute_tool, call
                )
                messages.append({
                    'role': 'tool',
                    'tool_call_id': str(call.get('id') or ''),
                    'content': json.dumps(result, ensure_ascii=False),
                })
            continue

        content = message.get('content')

        if not isinstance(content, str) or not content.strip():
            raise AiServiceError

        return AiReply(
            content=content.strip(),
            input_tokens=input_total,
            output_tokens=output_total,
        )


async def generate_reply(
    history: list[dict[str, Any]],
    execute_tool: ToolExecutor | None = None,
) -> AiReply:
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
            state = {'tools_executed': False}
            try:
                reply = await _run_conversation(
                    client, model, history, execute_tool, state
                )
                reply.tools_executed = state['tools_executed']
                return reply
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
                # Com efeitos colaterais já aplicados (cards criados),
                # repetir a conversa em outro modelo duplicaria as ações.
                if state['tools_executed']:
                    break

    raise AiServiceError from last_error
