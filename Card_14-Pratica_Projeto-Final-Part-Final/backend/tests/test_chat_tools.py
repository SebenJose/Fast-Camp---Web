import asyncio
import json
from http import HTTPStatus

import httpx
import pytest

from organiza_ia_api import ai
from organiza_ia_api.routers import chat
from organiza_ia_api.settings import get_settings

TOOL_USAGE = {'prompt_tokens': 100, 'completion_tokens': 30}
FINAL_USAGE = {'prompt_tokens': 150, 'completion_tokens': 20}
EXPECTED_INPUT_TOKENS = 250
EXPECTED_OUTPUT_TOKENS = 50
FIRST_REQUEST_MESSAGE_COUNT = 2


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


def _tool_call_response(name, arguments, usage=TOOL_USAGE):
    return {
        'choices': [
            {
                'message': {
                    'content': None,
                    'tool_calls': [
                        {
                            'id': 'call-1',
                            'type': 'function',
                            'function': {
                                'name': name,
                                'arguments': json.dumps(arguments),
                            },
                        }
                    ],
                }
            }
        ],
        'usage': usage,
    }


def _text_response(content='Pronto! Card criado.', usage=FINAL_USAGE):
    return {
        'choices': [{'message': {'content': content}}],
        'usage': usage,
    }


# ---------------------------------------------------------------------------
# ai.generate_reply com ferramentas
# ---------------------------------------------------------------------------


def test_tool_call_round_then_final_text(ai_configured, monkeypatch):
    executed = []
    requests = []

    def handler(request):
        body = json.loads(request.content)
        requests.append(body)
        if len(requests) == 1:
            return httpx.Response(
                HTTPStatus.OK,
                json=_tool_call_response(
                    'create_schedule_event',
                    {
                        'title': 'Estudar',
                        'startTime': '09:00',
                        'endTime': '10:00',
                    },
                ),
            )
        return httpx.Response(HTTPStatus.OK, json=_text_response())

    def execute_tool(name, arguments):
        executed.append((name, arguments))
        return {'ok': True}

    _mocked_ai_client(monkeypatch, handler)

    reply = asyncio.run(
        ai.generate_reply(
            [{'role': 'user', 'content': 'Marque estudo às 9'}],
            execute_tool,
        )
    )

    assert executed == [
        (
            'create_schedule_event',
            {'title': 'Estudar', 'startTime': '09:00', 'endTime': '10:00'},
        )
    ]
    assert reply.content == 'Pronto! Card criado.'
    assert reply.input_tokens == EXPECTED_INPUT_TOKENS
    assert reply.output_tokens == EXPECTED_OUTPUT_TOKENS

    assert 'tools' in requests[0]
    second_roles = [m['role'] for m in requests[1]['messages']]
    assert second_roles[-1] == 'tool'
    assert json.loads(requests[1]['messages'][-1]['content']) == {'ok': True}


def test_tool_loop_forces_text_on_last_round(ai_configured, monkeypatch):
    requests = []

    def handler(request):
        body = json.loads(request.content)
        requests.append(body)
        if body.get('tool_choice') == 'none':
            return httpx.Response(HTTPStatus.OK, json=_text_response())
        return httpx.Response(
            HTTPStatus.OK,
            json=_tool_call_response('list_schedule_events', {}),
        )

    _mocked_ai_client(monkeypatch, handler)

    reply = asyncio.run(
        ai.generate_reply(
            [{'role': 'user', 'content': 'Oi'}],
            lambda name, arguments: {'ok': True},
        )
    )

    assert reply.content == 'Pronto! Card criado.'
    assert len(requests) == ai.MAX_TOOL_ROUNDS + 1
    assert requests[-1]['tool_choice'] == 'none'


def test_tool_call_with_invalid_arguments_returns_error_to_model(
    ai_configured, monkeypatch
):
    tool_results = []

    def handler(request):
        body = json.loads(request.content)
        for message in body['messages']:
            if message.get('role') == 'tool':
                tool_results.append(json.loads(message['content']))
        if len(body['messages']) == FIRST_REQUEST_MESSAGE_COUNT:
            response = _tool_call_response('create_schedule_event', {})
            response['choices'][0]['message']['tool_calls'][0]['function'][
                'arguments'
            ] = 'não é json'
            return httpx.Response(HTTPStatus.OK, json=response)
        return httpx.Response(HTTPStatus.OK, json=_text_response())

    _mocked_ai_client(monkeypatch, handler)

    asyncio.run(
        ai.generate_reply(
            [{'role': 'user', 'content': 'Oi'}],
            lambda name, arguments: {'ok': True},
        )
    )

    assert tool_results == [
        {'error': 'Argumentos inválidos para a ferramenta.'}
    ]


def test_no_model_fallback_after_tool_execution(ai_configured, monkeypatch):
    monkeypatch.setenv('AI_MODEL', 'modelo-a,modelo-b')
    get_settings.cache_clear()
    models_called = []

    def handler(request):
        body = json.loads(request.content)
        models_called.append(body['model'])
        if any(m.get('role') == 'tool' for m in body['messages']):
            return httpx.Response(HTTPStatus.INTERNAL_SERVER_ERROR)
        return httpx.Response(
            HTTPStatus.OK,
            json=_tool_call_response('list_schedule_events', {}),
        )

    _mocked_ai_client(monkeypatch, handler)

    with pytest.raises(ai.AiServiceError):
        asyncio.run(
            ai.generate_reply(
                [{'role': 'user', 'content': 'Oi'}],
                lambda name, arguments: {'ok': True},
            )
        )

    assert set(models_called) == {'modelo-a'}


# ---------------------------------------------------------------------------
# Executor das ferramentas via endpoint do chat
# ---------------------------------------------------------------------------


@pytest.fixture
def reply_using_tool(monkeypatch):
    """Simula um modelo que chama a ferramenta pedida e confirma em texto."""
    results = []

    def factory(name, arguments):
        async def _generate_reply(history, execute_tool=None):
            results.append(execute_tool(name, arguments))
            return ai.AiReply(
                content='Feito!', input_tokens=10, output_tokens=5
            )

        monkeypatch.setattr(chat.ai, 'generate_reply', _generate_reply)
        return results

    return factory


def test_chat_tool_creates_event_in_schedule(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'create_schedule_event',
        {
            'title': 'Estudar FastAPI',
            'startTime': '09:00',
            'endTime': '10:00',
            'tone': 'mint',
        },
    )

    response = client.post(
        '/api/chat/messages',
        json={'content': 'Marque estudo de FastAPI das 9 às 10'},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    assert results[0]['ok'] is True
    assert results[0]['event']['period'] == 'morning'

    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    (event,) = schedule['eventsByPeriodId']['morning']
    assert event['title'] == 'Estudar FastAPI'
    assert event['tone'] == 'mint'


def test_chat_tool_rejects_invalid_time(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'create_schedule_event',
        {'title': 'Estudar', 'startTime': 'nove horas', 'endTime': '10:00'},
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Informe um horário no formato HH:mm.'}


def test_chat_tool_rejects_out_of_range_time(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'create_schedule_event',
        {'title': 'Madrugada', 'startTime': '02:00', 'endTime': '03:00'},
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert 'error' in results[0]


def test_chat_tool_lists_schedule(client, auth_headers, reply_using_tool):
    client.post(
        '/api/schedule/events',
        json={
            'userId': 'qualquer',
            'event': {
                'title': 'Reunião',
                'startTime': '14:00',
                'endTime': '15:00',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )

    results = reply_using_tool('list_schedule_events', {})

    client.post(
        '/api/chat/messages',
        json={'content': 'O que tenho hoje?'},
        headers=auth_headers,
    )

    titles = [
        event['title'] for event in results[0]['eventsByPeriodId']['afternoon']
    ]
    assert titles == ['Reunião']


def test_chat_tool_unknown_name(client, auth_headers, reply_using_tool):
    results = reply_using_tool('apagar_tudo', {})

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Ferramenta desconhecida.'}


def _create_event(client, auth_headers, **overrides):
    event = {
        'title': 'Reunião',
        'startTime': '14:00',
        'endTime': '15:00',
        'tone': 'sky',
        **overrides,
    }
    client.post(
        '/api/schedule/events',
        json={'userId': 'qualquer', 'event': event},
        headers=auth_headers,
    )
    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    for events in schedule['eventsByPeriodId'].values():
        for stored in events:
            if stored['title'] == event['title']:
                return stored['id']
    raise AssertionError('evento não encontrado após criação')


def test_chat_tool_updates_event(client, auth_headers, reply_using_tool):
    event_id = _create_event(client, auth_headers)

    # Só o horário muda; título e cor devem permanecer.
    results = reply_using_tool(
        'update_schedule_event',
        {'eventId': event_id, 'startTime': '16:00', 'endTime': '17:00'},
    )

    client.post(
        '/api/chat/messages',
        json={'content': 'Mude a reunião para as 16h'},
        headers=auth_headers,
    )

    assert results[0]['ok'] is True
    assert results[0]['event']['period'] == 'afternoon'

    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    (event,) = schedule['eventsByPeriodId']['afternoon']
    assert event['title'] == 'Reunião'
    assert event['tone'] == 'sky'
    assert event['startMinutes'] == 16 * 60


def test_chat_tool_update_rejects_unknown_id(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'update_schedule_event',
        {'eventId': '00000000-0000-0000-0000-000000000000', 'title': 'Novo'},
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Card não encontrado.'}


def test_chat_tool_update_rejects_invalid_id(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'update_schedule_event', {'eventId': 'não-é-uuid', 'title': 'Novo'}
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Informe o id do card a editar.'}


def test_chat_tool_deletes_event(client, auth_headers, reply_using_tool):
    event_id = _create_event(client, auth_headers)

    results = reply_using_tool('delete_schedule_event', {'eventId': event_id})

    client.post(
        '/api/chat/messages',
        json={'content': 'Remova a reunião'},
        headers=auth_headers,
    )

    assert results[0]['ok'] is True
    assert results[0]['deleted']['title'] == 'Reunião'

    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    assert schedule['eventsByPeriodId']['afternoon'] == []


def test_chat_tool_delete_rejects_unknown_id(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'delete_schedule_event',
        {'eventId': '00000000-0000-0000-0000-000000000000'},
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Card não encontrado.'}


def test_chat_tool_sets_day_range(client, auth_headers, reply_using_tool):
    results = reply_using_tool(
        'set_day_range', {'startTime': '07:00', 'endTime': '23:00'}
    )

    client.post(
        '/api/chat/messages',
        json={'content': 'Comece meu dia às 7 e termine às 23'},
        headers=auth_headers,
    )

    assert results[0]['ok'] is True

    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    assert schedule['dayRange'] == {
        'startMinutes': 7 * 60,
        'endMinutes': 23 * 60,
    }


def test_chat_tool_set_day_range_rejects_invalid_time(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'set_day_range', {'startTime': 'sete', 'endTime': '23:00'}
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {'error': 'Informe os horários no formato HH:mm.'}


def test_chat_tool_set_day_range_rejects_end_before_start(
    client, auth_headers, reply_using_tool
):
    results = reply_using_tool(
        'set_day_range', {'startTime': '20:00', 'endTime': '08:00'}
    )

    client.post(
        '/api/chat/messages', json={'content': 'Oi'}, headers=auth_headers
    )

    assert results[0] == {
        'error': 'O fim do dia precisa ser depois do começo.'
    }
