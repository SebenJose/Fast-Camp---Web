import asyncio
import json
from datetime import timedelta
from http import HTTPStatus
from uuid import UUID

import httpx
import pytest

from organiza_ia_api import ai
from organiza_ia_api.models import ChatMessage, utcnow
from organiza_ia_api.routers import chat
from organiza_ia_api.settings import get_settings

FAKE_INPUT_TOKENS = 42
FAKE_OUTPUT_TOKENS = 17
USAGE_INPUT_TOKENS = 10
USAGE_OUTPUT_TOKENS = 5


@pytest.fixture
def fake_reply(make_fake_reply):
    return make_fake_reply(FAKE_INPUT_TOKENS, FAKE_OUTPUT_TOKENS)


@pytest.fixture
def ai_configured(monkeypatch):
    monkeypatch.setenv('AI_API_KEY', 'chave-de-teste')
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def _mocked_ai_client(monkeypatch, handler):
    original_client = httpx.AsyncClient

    def factory(**kwargs):
        return original_client(transport=httpx.MockTransport(handler))

    monkeypatch.setattr(ai.httpx, 'AsyncClient', factory)


def _completion_response(
    content='Olá! Vamos planejar sua semana.',
    usage={
        'prompt_tokens': USAGE_INPUT_TOKENS,
        'completion_tokens': USAGE_OUTPUT_TOKENS,
    },
):
    body = {'choices': [{'message': {'content': content}}]}
    if usage is not None:
        body['usage'] = usage
    return body


# ---------------------------------------------------------------------------
# POST /api/chat/messages
# ---------------------------------------------------------------------------


def test_send_message_requires_auth(client):
    response = client.post('/api/chat/messages', json={'content': 'Oi'})

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_send_message_persists_and_returns_pair(
    client, auth_headers, fake_reply
):
    response = client.post(
        '/api/chat/messages',
        json={'content': 'Organize minha semana'},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    messages = response.json()['messages']
    assert [m['role'] for m in messages] == ['user', 'assistant']
    assert messages[0]['content'] == 'Organize minha semana'
    assert messages[1]['content'] == 'Resposta da IA.'
    assert messages[1]['inputTokens'] == FAKE_INPUT_TOKENS
    assert messages[1]['outputTokens'] == FAKE_OUTPUT_TOKENS


def test_send_message_strips_content(client, auth_headers, fake_reply):
    response = client.post(
        '/api/chat/messages',
        json={'content': '  Planeje meu dia  '},
        headers=auth_headers,
    )

    assert response.json()['messages'][0]['content'] == 'Planeje meu dia'


def test_send_message_sends_history_to_llm(client, auth_headers, fake_reply):
    client.post(
        '/api/chat/messages',
        json={'content': 'Primeira mensagem'},
        headers=auth_headers,
    )
    client.post(
        '/api/chat/messages',
        json={'content': 'Segunda mensagem'},
        headers=auth_headers,
    )

    second_call = fake_reply[1]
    assert [m['role'] for m in second_call] == [
        'system',
        'user',
        'assistant',
        'user',
    ]
    assert 'Intervalo visível do dia' in second_call[0]['content']
    assert second_call[1]['content'] == 'Primeira mensagem'
    assert second_call[2]['content'] == 'Resposta da IA.'
    assert second_call[3]['content'] == 'Segunda mensagem'


def test_send_message_informs_user_day_range(client, auth_headers, fake_reply):
    client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'qualquer',
            'dayRange': {'startMinutes': 7 * 60, 'endMinutes': 22 * 60 + 30},
        },
        headers=auth_headers,
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    day_range_note = fake_reply[0][0]
    assert day_range_note['role'] == 'system'
    assert '07:00 às 22:30' in day_range_note['content']


def test_send_message_rate_limited(client, auth_headers, fake_reply):
    for index in range(chat.RATE_LIMIT_MAX_MESSAGES):
        response = client.post(
            '/api/chat/messages',
            json={'content': f'Mensagem {index}'},
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.CREATED

    response = client.post(
        '/api/chat/messages',
        json={'content': 'Uma a mais'},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.TOO_MANY_REQUESTS
    assert response.json()['message'] == chat.RATE_LIMITED_MESSAGE


def test_rate_limit_ignores_messages_outside_window(
    client, auth_headers, registered_user, session, fake_reply
):
    old_created_at = utcnow() - chat.RATE_LIMIT_WINDOW - timedelta(minutes=1)
    for index in range(chat.RATE_LIMIT_MAX_MESSAGES):
        message = ChatMessage(
            user_id=UUID(registered_user['session']['userId']),
            role='user',
            content=f'Antiga {index}',
        )
        message.created_at = old_created_at
        session.add(message)
    session.commit()

    response = client.post(
        '/api/chat/messages', json={'content': 'Nova'}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.CREATED


def test_send_message_rejects_empty_content(client, auth_headers, fake_reply):
    response = client.post(
        '/api/chat/messages', json={'content': '   '}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json() == {'message': 'Escreva uma mensagem para enviar.'}


def test_send_message_rejects_too_long_content(
    client, auth_headers, fake_reply
):
    response = client.post(
        '/api/chat/messages',
        json={'content': 'a' * 2001},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


def test_send_message_when_ai_not_configured(
    client, auth_headers, monkeypatch
):
    async def _not_configured(history, execute_tool=None):
        raise ai.AiNotConfiguredError

    monkeypatch.setattr(chat.ai, 'generate_reply', _not_configured)

    response = client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE
    assert response.json()['message'] == chat.AI_NOT_CONFIGURED_MESSAGE


def test_send_message_when_ai_fails(client, auth_headers, monkeypatch):
    async def _fails(history, execute_tool=None):
        raise ai.AiServiceError

    monkeypatch.setattr(chat.ai, 'generate_reply', _fails)

    response = client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.BAD_GATEWAY
    assert response.json()['message'] == chat.AI_UNAVAILABLE_MESSAGE


def test_send_message_failure_persists_nothing(
    client, auth_headers, monkeypatch
):
    async def _fails(history, execute_tool=None):
        raise ai.AiServiceError

    monkeypatch.setattr(chat.ai, 'generate_reply', _fails)
    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    history = client.get('/api/chat/messages', headers=auth_headers)
    assert history.json()['messages'] == []


# ---------------------------------------------------------------------------
# GET /api/chat/messages
# ---------------------------------------------------------------------------


def test_list_messages_requires_auth(client):
    response = client.get('/api/chat/messages')

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_list_messages_empty(client, auth_headers):
    response = client.get('/api/chat/messages', headers=auth_headers)

    assert response.status_code == HTTPStatus.OK
    assert response.json()['messages'] == []


def test_list_messages_returns_chronological_history(
    client, auth_headers, fake_reply
):
    client.post(
        '/api/chat/messages', json={'content': 'Um'}, headers=auth_headers
    )
    client.post(
        '/api/chat/messages', json={'content': 'Dois'}, headers=auth_headers
    )

    response = client.get('/api/chat/messages', headers=auth_headers)

    contents = [m['content'] for m in response.json()['messages']]
    assert contents == ['Um', 'Resposta da IA.', 'Dois', 'Resposta da IA.']


def test_list_messages_pagination(client, auth_headers, fake_reply):
    for content in ['Um', 'Dois', 'Três']:
        client.post(
            '/api/chat/messages',
            json={'content': content},
            headers=auth_headers,
        )

    response = client.get(
        '/api/chat/messages?limit=2&offset=2', headers=auth_headers
    )

    contents = [m['content'] for m in response.json()['messages']]
    assert contents == ['Dois', 'Resposta da IA.']


def test_list_messages_isolated_by_user(client, auth_headers, fake_reply):
    client.post(
        '/api/chat/messages', json={'content': 'Só meu'}, headers=auth_headers
    )

    other = client.post(
        '/api/auth/register',
        json={
            'name': 'Outra Pessoa',
            'email': 'outra@example.com',
            'password': 'senha123',
            'passwordConfirmation': 'senha123',
        },
    ).json()
    other_headers = {'Authorization': f'Bearer {other["access_token"]}'}

    response = client.get('/api/chat/messages', headers=other_headers)

    assert response.json()['messages'] == []


# ---------------------------------------------------------------------------
# ai.generate_reply
# ---------------------------------------------------------------------------


def test_generate_reply_without_key_raises_not_configured(monkeypatch):
    monkeypatch.delenv('AI_API_KEY', raising=False)
    get_settings.cache_clear()

    with pytest.raises(ai.AiNotConfiguredError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))

    get_settings.cache_clear()


def test_generate_reply_success(ai_configured, monkeypatch):
    seen = {}

    def handler(request):
        seen['url'] = str(request.url)
        seen['auth'] = request.headers['Authorization']
        seen['body'] = json.loads(request.content)
        return httpx.Response(HTTPStatus.OK, json=_completion_response())

    _mocked_ai_client(monkeypatch, handler)

    reply = asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))

    assert reply.content == 'Olá! Vamos planejar sua semana.'
    assert reply.input_tokens == USAGE_INPUT_TOKENS
    assert reply.output_tokens == USAGE_OUTPUT_TOKENS
    assert seen['url'].endswith('/chat/completions')
    assert seen['auth'] == 'Bearer chave-de-teste'
    assert seen['body']['messages'][0]['role'] == 'system'
    assert seen['body']['messages'][0]['content'] == ai.SYSTEM_PROMPT
    assert seen['body']['messages'][1] == {'role': 'user', 'content': 'Oi'}


def test_generate_reply_without_usage_defaults_to_zero(
    ai_configured, monkeypatch
):
    def handler(request):
        return httpx.Response(
            HTTPStatus.OK, json=_completion_response(usage=None)
        )

    _mocked_ai_client(monkeypatch, handler)

    reply = asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))

    assert reply.input_tokens == 0
    assert reply.output_tokens == 0


def test_generate_reply_http_error(ai_configured, monkeypatch):
    def handler(request):
        return httpx.Response(
            HTTPStatus.INTERNAL_SERVER_ERROR, json={'error': 'quota'}
        )

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))


def test_generate_reply_network_error(ai_configured, monkeypatch):
    def handler(request):
        raise httpx.ConnectError('rede fora')

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))


def test_generate_reply_malformed_response(ai_configured, monkeypatch):
    def handler(request):
        return httpx.Response(HTTPStatus.OK, json={'inesperado': True})

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))


def test_generate_reply_empty_content(ai_configured, monkeypatch):
    def handler(request):
        return httpx.Response(
            HTTPStatus.OK, json=_completion_response(content='   ')
        )

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))


def test_generate_reply_without_models_raises_not_configured(
    ai_configured, monkeypatch
):
    monkeypatch.setenv('AI_MODEL', ' , ')
    get_settings.cache_clear()

    with pytest.raises(ai.AiNotConfiguredError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))


def test_generate_reply_falls_back_to_next_model(ai_configured, monkeypatch):
    monkeypatch.setenv('AI_MODEL', 'modelo-lotado, modelo-livre')
    get_settings.cache_clear()
    attempts = []

    def handler(request):
        model = json.loads(request.content)['model']
        attempts.append(model)
        if model == 'modelo-lotado':
            return httpx.Response(HTTPStatus.TOO_MANY_REQUESTS)
        return httpx.Response(HTTPStatus.OK, json=_completion_response())

    _mocked_ai_client(monkeypatch, handler)

    reply = asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))

    assert attempts == ['modelo-lotado', 'modelo-livre']
    assert reply.content == 'Olá! Vamos planejar sua semana.'


def test_generate_reply_fails_when_all_models_fail(ai_configured, monkeypatch):
    monkeypatch.setenv('AI_MODEL', 'modelo-a,modelo-b')
    get_settings.cache_clear()

    def handler(request):
        return httpx.Response(HTTPStatus.TOO_MANY_REQUESTS)

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(ai.generate_reply([{'role': 'user', 'content': 'Oi'}]))
