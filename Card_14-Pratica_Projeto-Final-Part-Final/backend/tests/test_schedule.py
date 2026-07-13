from http import HTTPStatus

import pytest
from fastapi.testclient import TestClient

from organiza_ia_api.app import app


@pytest.fixture
def event_payload():
    return {
        'userId': 'qualquer',
        'event': {
            'title': 'Reunião',
            'startTime': '09:00',
            'endTime': '09:30',
            'tone': 'sky',
        },
    }


def _create_event(client, auth_headers, payload=None):
    if payload is None:
        payload = {
            'userId': 'qualquer',
            'event': {
                'title': 'Reunião',
                'startTime': '09:00',
                'endTime': '09:30',
                'tone': 'sky',
            },
        }
    return client.post(
        '/api/schedule/events', json=payload, headers=auth_headers
    )


def _get_first_event(client, auth_headers, period='morning'):
    schedule = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]
    return schedule['eventsByPeriodId'][period][0]


# ---------------------------------------------------------------------------
# GET /api/schedule
# ---------------------------------------------------------------------------


def test_get_schedule_requires_auth(client):
    assert client.get('/api/schedule').status_code == HTTPStatus.UNAUTHORIZED


def test_get_schedule_creates_default_on_first_call(client, auth_headers):
    response = client.get('/api/schedule', headers=auth_headers)

    assert response.status_code == HTTPStatus.OK
    day_range = response.json()['schedule']['dayRange']
    assert day_range['startMinutes'] == 6 * 60
    assert day_range['endMinutes'] == 22 * 60


def test_get_schedule_returns_all_period_keys(client, auth_headers):
    periods = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]['eventsByPeriodId']
    assert set(periods.keys()) == {'morning', 'lunch', 'afternoon', 'night'}


def test_get_schedule_is_idempotent(client, auth_headers):
    r1 = client.get('/api/schedule', headers=auth_headers).json()
    r2 = client.get('/api/schedule', headers=auth_headers).json()
    assert r1 == r2


def test_get_schedule_survives_concurrent_creation_race(
    client, auth_headers, session, monkeypatch
):
    # Simula a corrida: a agenda já existe, mas o SELECT do get-or-create
    # é forçado a devolver None; o INSERT duplicado estoura a unique de
    # user_id e o endpoint precisa reusar a agenda existente (sem 500).
    baseline = client.get('/api/schedule', headers=auth_headers).json()

    schedule_lookup_call = 2  # 1ª chamada: usuário do token; 2ª: agenda
    real_scalar = session.scalar
    calls = []

    def scalar_missing_schedule_once(*args, **kwargs):
        calls.append(args)
        if len(calls) == schedule_lookup_call:
            return None
        return real_scalar(*args, **kwargs)

    monkeypatch.setattr(session, 'scalar', scalar_missing_schedule_once)

    response = client.get('/api/schedule', headers=auth_headers)

    assert response.status_code == HTTPStatus.OK
    assert response.json()['schedule'] == baseline['schedule']


def test_get_schedule_race_with_rolled_back_winner_returns_500(
    client, auth_headers, session, monkeypatch
):
    # Variante da corrida acima em que a transação vencedora sofreu
    # rollback: o re-SELECT pós-IntegrityError também não encontra agenda
    # e o erro original precisa se propagar (500 do handler genérico) em
    # vez de devolver None no lugar de um Schedule.
    client.get('/api/schedule', headers=auth_headers)  # agenda passa a existir

    schedule_lookup_calls = {2, 3}  # 1ª: usuário do token; 2ª e 3ª: agenda
    real_scalar = session.scalar
    calls = []

    def scalar_missing_schedule(*args, **kwargs):
        calls.append(args)
        if len(calls) in schedule_lookup_calls:
            return None
        return real_scalar(*args, **kwargs)

    monkeypatch.setattr(session, 'scalar', scalar_missing_schedule)

    with TestClient(app, raise_server_exceptions=False) as broken_client:
        response = broken_client.get('/api/schedule', headers=auth_headers)

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json() == {'message': 'Erro interno no servidor.'}


# ---------------------------------------------------------------------------
# PATCH /api/schedule/day-range
# ---------------------------------------------------------------------------


def test_update_day_range_requires_auth(client):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 480, 'endMinutes': 1200},
        },
    )
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_update_day_range_success(client, auth_headers):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 480, 'endMinutes': 1200},
        },
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.OK
    day_range = response.json()['schedule']['dayRange']
    assert day_range['startMinutes'] == 8 * 60
    assert day_range['endMinutes'] == 20 * 60


def test_update_day_range_persists(client, auth_headers):
    client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 480, 'endMinutes': 1200},
        },
        headers=auth_headers,
    )
    day_range = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]['dayRange']
    assert day_range['startMinutes'] == 8 * 60


def test_narrowing_day_range_hides_events_outside_it(
    client, auth_headers, event_payload
):
    client.post(
        '/api/schedule/events', json=event_payload, headers=auth_headers
    )

    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 6 * 60, 'endMinutes': 8 * 60},
        },
        headers=auth_headers,
    )

    events = response.json()['schedule']['eventsByPeriodId']
    assert all(len(period_events) == 0 for period_events in events.values())


def test_update_day_range_end_before_start(client, auth_headers):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 900, 'endMinutes': 480},
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'O fim do dia precisa ser depois do começo.'
    )


def test_update_day_range_negative_minutes(client, auth_headers):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': -1, 'endMinutes': 1200},
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Dados inválidos.'


def test_update_day_range_minutes_above_max(client, auth_headers):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 480, 'endMinutes': 1440},
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Dados inválidos.'


# ---------------------------------------------------------------------------
# POST /api/schedule/events
# ---------------------------------------------------------------------------


def test_create_event_requires_auth(client, event_payload):
    assert (
        client.post('/api/schedule/events', json=event_payload).status_code
        == HTTPStatus.UNAUTHORIZED
    )


def test_create_event_success(client, auth_headers, event_payload):
    response = _create_event(client, auth_headers, event_payload)

    assert response.status_code == HTTPStatus.CREATED
    morning = response.json()['schedule']['eventsByPeriodId']['morning']
    assert len(morning) == 1
    event = morning[0]
    assert event['title'] == 'Reunião'
    assert event['startMinutes'] == 9 * 60
    assert event['endMinutes'] == 9 * 60 + 30
    assert event['completed'] is False
    assert 'id' in event


@pytest.mark.parametrize(
    ('start_time', 'end_time', 'expected_period'),
    [
        ('07:00', '07:30', 'morning'),
        ('12:00', '12:30', 'lunch'),
        ('14:00', '14:30', 'afternoon'),
        ('19:00', '19:30', 'night'),
    ],
)
def test_create_event_assigns_correct_period(
    client, auth_headers, start_time, end_time, expected_period
):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': f'Card {start_time}',
                'startTime': start_time,
                'endTime': end_time,
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.CREATED
    events = response.json()['schedule']['eventsByPeriodId'][expected_period]
    assert len(events) == 1


def test_create_event_outside_day_range(client, auth_headers):
    # 23:00 está fora do dayRange padrão (06:00–22:00)
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'Tarde da noite',
                'startTime': '23:00',
                'endTime': '23:30',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == (
        'Esse horário está fora do intervalo visível do dia.'
    )


def test_create_event_outside_any_period(client, auth_headers):
    # Estreita o dayRange para antes de qualquer período (04:00–05:00)
    client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'q',
            'dayRange': {'startMinutes': 240, 'endMinutes': 300},
        },
        headers=auth_headers,
    )
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'Madrugada',
                'startTime': '04:00',
                'endTime': '04:30',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == (
        'Esse horário está fora dos períodos da agenda (06:00 às 22:00).'
    )


def test_create_event_end_before_start(client, auth_headers):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'Card',
                'startTime': '10:00',
                'endTime': '09:00',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'O fim do card precisa ser depois do início.'
    )


def test_create_event_invalid_tone(client, auth_headers):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'Card',
                'startTime': '09:00',
                'endTime': '09:30',
                'tone': 'purple',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Tom inválido. Use: amber, mint, rose, sky, slate.'
    )


def test_create_event_empty_title(client, auth_headers):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': '   ',
                'startTime': '09:00',
                'endTime': '09:30',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Informe um título para criar o card.'
    )


def test_create_event_title_too_long(client, auth_headers):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'x' * 101,
                'startTime': '09:00',
                'endTime': '09:30',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'O título pode ter no máximo 100 caracteres.'
    )


def test_create_event_invalid_time_format(client, auth_headers):
    response = client.post(
        '/api/schedule/events',
        json={
            'userId': 'q',
            'event': {
                'title': 'Card',
                'startTime': '9:00',
                'endTime': '9:30',
                'tone': 'sky',
            },
        },
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Informe um horário no formato HH:mm.'
    )


# ---------------------------------------------------------------------------
# DELETE /api/schedule/events/{event_id}
# ---------------------------------------------------------------------------


def test_delete_event_requires_auth(client, auth_headers):
    _create_event(client, auth_headers)
    event_id = _get_first_event(client, auth_headers)['id']

    client.cookies.clear()
    assert (
        client.delete(f'/api/schedule/events/{event_id}').status_code
        == HTTPStatus.UNAUTHORIZED
    )


def test_delete_event_success(client, auth_headers):
    _create_event(client, auth_headers)
    event_id = _get_first_event(client, auth_headers)['id']

    response = client.delete(
        f'/api/schedule/events/{event_id}', headers=auth_headers
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['schedule']['eventsByPeriodId']['morning'] == []


def test_delete_event_not_found(client, auth_headers):
    response = client.delete(
        '/api/schedule/events/00000000-0000-0000-0000-000000000000',
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()['message'] == 'Card não encontrado.'


def test_delete_event_invalid_uuid(client, auth_headers):
    response = client.delete(
        '/api/schedule/events/nao-e-uuid', headers=auth_headers
    )
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Dados inválidos.'


def test_delete_event_does_not_affect_other_events(client, auth_headers):
    _create_event(client, auth_headers)
    _create_event(
        client,
        auth_headers,
        {
            'userId': 'q',
            'event': {
                'title': 'Segundo card',
                'startTime': '10:00',
                'endTime': '10:30',
                'tone': 'rose',
            },
        },
    )
    event_id = _get_first_event(client, auth_headers)['id']

    client.delete(f'/api/schedule/events/{event_id}', headers=auth_headers)
    morning = client.get('/api/schedule', headers=auth_headers).json()[
        'schedule'
    ]['eventsByPeriodId']['morning']
    assert len(morning) == 1
    assert morning[0]['title'] == 'Segundo card'


# ---------------------------------------------------------------------------
# PATCH /api/schedule/events/{event_id}/completed
# ---------------------------------------------------------------------------


def test_toggle_completed_requires_auth(client, auth_headers):
    _create_event(client, auth_headers)
    event_id = _get_first_event(client, auth_headers)['id']

    client.cookies.clear()
    response = client.patch(
        f'/api/schedule/events/{event_id}/completed', json={'userId': 'q'}
    )
    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_toggle_completed_marks_as_done(client, auth_headers):
    _create_event(client, auth_headers)
    event_id = _get_first_event(client, auth_headers)['id']

    response = client.patch(
        f'/api/schedule/events/{event_id}/completed',
        json={'userId': 'q'},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.OK
    event = response.json()['schedule']['eventsByPeriodId']['morning'][0]
    assert event['completed'] is True


def test_toggle_completed_twice_reverts(client, auth_headers):
    _create_event(client, auth_headers)
    event_id = _get_first_event(client, auth_headers)['id']

    client.patch(
        f'/api/schedule/events/{event_id}/completed',
        json={'userId': 'q'},
        headers=auth_headers,
    )
    response = client.patch(
        f'/api/schedule/events/{event_id}/completed',
        json={'userId': 'q'},
        headers=auth_headers,
    )

    assert (
        response.json()['schedule']['eventsByPeriodId']['morning'][0][
            'completed'
        ]
        is False
    )


def test_toggle_completed_not_found(client, auth_headers):
    response = client.patch(
        '/api/schedule/events/00000000-0000-0000-0000-000000000000/completed',
        json={'userId': 'q'},
        headers=auth_headers,
    )
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()['message'] == 'Card não encontrado.'
