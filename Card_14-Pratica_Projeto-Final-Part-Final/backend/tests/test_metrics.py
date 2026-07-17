from datetime import timedelta
from http import HTTPStatus
from uuid import UUID

import pytest

from organiza_ia_api.models import ChatMessage, utcnow
from organiza_ia_api.routers.metrics import WEEKDAY_LABELS
from organiza_ia_api.settings import get_settings

WEEK_DAYS = 7
INTERACTION_COUNT = 2
PREVIOUS_WEEK_TOKENS = 50
REPLY_INPUT_TOKENS = 30
REPLY_OUTPUT_TOKENS = 20
TOKENS_PER_INTERACTION = REPLY_INPUT_TOKENS + REPLY_OUTPUT_TOKENS


@pytest.fixture
def fake_reply(make_fake_reply):
    make_fake_reply(REPLY_INPUT_TOKENS, REPLY_OUTPUT_TOKENS)


def _get_metrics(client, auth_headers):
    response = client.get('/api/metrics', headers=auth_headers)
    assert response.status_code == HTTPStatus.OK
    return response.json()['metrics']


def test_metrics_requires_auth(client):
    assert client.get('/api/metrics').status_code == HTTPStatus.UNAUTHORIZED


def test_metrics_empty_user(client, auth_headers):
    metrics = _get_metrics(client, auth_headers)

    assert metrics['totalMessages'] == 0
    assert metrics['totalTokens'] == 0
    assert metrics['completedTasks'] == 0
    assert metrics['aiTimeMinutes'] == 0
    assert metrics['weeklyTokens']['used'] == 0
    assert metrics['weeklyTokens']['limit'] > 0
    assert [p['day'] for p in metrics['weeklyTasks']] == list(WEEKDAY_LABELS)
    assert all(
        p['completed'] == 0 and p['pending'] == 0
        for p in metrics['weeklyTasks']
    )
    assert all(p['interactions'] == 0 for p in metrics['dailyInteractions'])


def test_metrics_falls_back_to_utc_for_unknown_timezone(
    client, auth_headers, monkeypatch
):
    monkeypatch.setenv('METRICS_TIMEZONE', 'Zona/Invalida')
    get_settings.cache_clear()

    try:
        metrics = _get_metrics(client, auth_headers)
    finally:
        get_settings.cache_clear()

    assert [p['day'] for p in metrics['weeklyTasks']] == list(WEEKDAY_LABELS)


def test_metrics_counts_messages_and_tokens(client, auth_headers, fake_reply):
    for content in ['Um', 'Dois']:
        client.post(
            '/api/chat/messages',
            json={'content': content},
            headers=auth_headers,
        )

    metrics = _get_metrics(client, auth_headers)

    assert metrics['totalMessages'] == INTERACTION_COUNT * 2
    assert metrics['totalTokens'] == (
        INTERACTION_COUNT * TOKENS_PER_INTERACTION
    )
    assert metrics['weeklyTokens']['used'] == (
        INTERACTION_COUNT * TOKENS_PER_INTERACTION
    )
    assert (
        sum(p['interactions'] for p in metrics['dailyInteractions'])
        == INTERACTION_COUNT
    )


def test_metrics_counts_schedule_tasks(client, auth_headers):
    for title in ['Feita', 'Pendente']:
        client.post(
            '/api/schedule/events',
            json={
                'userId': 'qualquer',
                'event': {
                    'title': title,
                    'startTime': '09:00',
                    'endTime': '09:30',
                    'tone': 'sky',
                },
            },
            headers=auth_headers,
        )

    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    first_event = schedule['eventsByPeriodId']['morning'][0]
    client.patch(
        f'/api/schedule/events/{first_event["id"]}/completed',
        json={'userId': 'qualquer'},
        headers=auth_headers,
    )

    metrics = _get_metrics(client, auth_headers)

    assert metrics['completedTasks'] == 1
    assert sum(p['completed'] for p in metrics['weeklyTasks']) == 1
    assert sum(p['pending'] for p in metrics['weeklyTasks']) == 1


def _insert_message(session, user_id, created_at, tokens=0, role='user'):
    message = ChatMessage(
        user_id=UUID(user_id),
        role=role,
        content='mensagem',
        input_tokens=tokens,
        output_tokens=0,
    )
    message.created_at = created_at
    session.add(message)
    session.commit()


def test_metrics_ai_time_sums_short_gaps_only(
    client, auth_headers, registered_user, session
):
    user_id = registered_user['session']['userId']
    base = utcnow() - timedelta(hours=1)

    _insert_message(session, user_id, base)
    _insert_message(session, user_id, base + timedelta(minutes=2))
    _insert_message(session, user_id, base + timedelta(minutes=4))
    # gap de 30min encerra a sessão e não conta
    _insert_message(session, user_id, base + timedelta(minutes=34))
    _insert_message(session, user_id, base + timedelta(minutes=37))

    metrics = _get_metrics(client, auth_headers)

    assert metrics['aiTimeMinutes'] == 4 + 3


def test_metrics_weekly_excludes_previous_week(
    client, auth_headers, registered_user, session
):
    user_id = registered_user['session']['userId']
    # 8 dias atrás cai sempre na semana anterior, qualquer que seja o dia
    last_week = utcnow() - timedelta(days=8)

    _insert_message(session, user_id, last_week, tokens=PREVIOUS_WEEK_TOKENS)

    metrics = _get_metrics(client, auth_headers)

    assert metrics['totalMessages'] == 1
    assert metrics['totalTokens'] == PREVIOUS_WEEK_TOKENS
    assert metrics['weeklyTokens']['used'] == 0
    assert all(p['interactions'] == 0 for p in metrics['dailyInteractions'])


def test_metrics_isolated_by_user(client, auth_headers, fake_reply):
    client.post(
        '/api/chat/messages', json={'content': 'Meu'}, headers=auth_headers
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

    metrics = _get_metrics(client, other_headers)

    assert metrics['totalMessages'] == 0
    assert metrics['totalTokens'] == 0
