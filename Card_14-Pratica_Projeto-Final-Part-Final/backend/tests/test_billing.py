from http import HTTPStatus
from uuid import uuid4

import pytest
from sqlalchemy import select

from organiza_ia_api import ai, billing_service
from organiza_ia_api.models import INITIAL_TOKEN_BALANCE, User
from organiza_ia_api.routers import chat
from organiza_ia_api.routers.billing import RECHARGE_PACKAGES

REPLY_INPUT_TOKENS = 300
REPLY_OUTPUT_TOKENS = 200
INTERACTION_COST = REPLY_INPUT_TOKENS + REPLY_OUTPUT_TOKENS
RECHARGE_AMOUNT = RECHARGE_PACKAGES[0]


@pytest.fixture
def fake_reply(make_fake_reply):
    make_fake_reply(REPLY_INPUT_TOKENS, REPLY_OUTPUT_TOKENS)


def _set_balance(session, email, balance):
    user = session.scalar(select(User).where(User.email == email))
    user.token_balance = balance
    session.add(user)
    session.commit()


def _send_message(client, auth_headers, content='Oi'):
    return client.post(
        '/api/chat/messages', json={'content': content}, headers=auth_headers
    )


# ---------------------------------------------------------------------------
# GET /api/billing
# ---------------------------------------------------------------------------


def test_billing_requires_auth(client):
    assert client.get('/api/billing').status_code == HTTPStatus.UNAUTHORIZED


def test_new_account_starts_with_initial_balance(client, auth_headers):
    response = client.get('/api/billing', headers=auth_headers)

    assert response.status_code == HTTPStatus.OK
    body = response.json()
    assert body['balance'] == INITIAL_TOKEN_BALANCE
    assert body['transactions'] == []


def test_chat_debits_balance_and_records_transaction(
    client, auth_headers, fake_reply
):
    response = _send_message(client, auth_headers)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json()['balance'] == (
        INITIAL_TOKEN_BALANCE - INTERACTION_COST
    )

    billing = client.get('/api/billing', headers=auth_headers).json()
    assert billing['balance'] == INITIAL_TOKEN_BALANCE - INTERACTION_COST
    (transaction,) = billing['transactions']
    assert transaction['type'] == 'debit'
    assert transaction['amount'] == INTERACTION_COST
    assert transaction['balanceAfter'] == (
        INITIAL_TOKEN_BALANCE - INTERACTION_COST
    )


def test_transactions_ordered_newest_first_with_pagination(
    client, auth_headers, fake_reply
):
    _send_message(client, auth_headers)
    client.post(
        '/api/billing/recharge',
        json={'amount': RECHARGE_AMOUNT},
        headers=auth_headers,
    )

    body = client.get('/api/billing?limit=1', headers=auth_headers).json()
    assert [t['type'] for t in body['transactions']] == ['recharge']

    body = client.get(
        '/api/billing?limit=1&offset=1', headers=auth_headers
    ).json()
    assert [t['type'] for t in body['transactions']] == ['debit']


def test_billing_isolated_by_user(client, auth_headers, fake_reply):
    _send_message(client, auth_headers)

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

    body = client.get('/api/billing', headers=other_headers).json()

    assert body['balance'] == INITIAL_TOKEN_BALANCE
    assert body['transactions'] == []


# ---------------------------------------------------------------------------
# Bloqueio por saldo insuficiente
# ---------------------------------------------------------------------------


def test_chat_blocked_when_balance_is_zero(
    client, auth_headers, registered_user, session, fake_reply
):
    _set_balance(session, registered_user['payload']['email'], 0)

    response = _send_message(client, auth_headers)

    assert response.status_code == HTTPStatus.PAYMENT_REQUIRED
    assert response.json()['message'] == chat.BALANCE_EMPTY_MESSAGE

    history = client.get('/api/chat/messages', headers=auth_headers)
    assert history.json()['messages'] == []


def test_last_interaction_clamps_balance_at_zero(
    client, auth_headers, registered_user, session, fake_reply
):
    _set_balance(session, registered_user['payload']['email'], 10)

    response = _send_message(client, auth_headers)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json()['balance'] == 0

    blocked = _send_message(client, auth_headers)
    assert blocked.status_code == HTTPStatus.PAYMENT_REQUIRED


def test_failed_ai_call_does_not_debit(client, auth_headers, monkeypatch):
    async def _fails(history, execute_tool=None):
        raise ai.AiServiceError

    monkeypatch.setattr(chat.ai, 'generate_reply', _fails)
    _send_message(client, auth_headers)

    billing = client.get('/api/billing', headers=auth_headers).json()
    assert billing['balance'] == INITIAL_TOKEN_BALANCE
    assert billing['transactions'] == []


# ---------------------------------------------------------------------------
# POST /api/billing/recharge
# ---------------------------------------------------------------------------


def test_recharge_requires_auth(client):
    response = client.post('/api/billing/recharge', json={'amount': 1000})

    assert response.status_code == HTTPStatus.UNAUTHORIZED


@pytest.mark.parametrize('amount', RECHARGE_PACKAGES)
def test_recharge_adds_balance_and_records_transaction(
    client, auth_headers, amount
):
    response = client.post(
        '/api/billing/recharge',
        json={'amount': amount},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.CREATED
    body = response.json()
    assert body['balance'] == INITIAL_TOKEN_BALANCE + amount
    (transaction,) = body['transactions']
    assert transaction['type'] == 'recharge'
    assert transaction['amount'] == amount
    assert transaction['balanceAfter'] == INITIAL_TOKEN_BALANCE + amount


@pytest.mark.parametrize('amount', [0, -1000, 999, 123456])
def test_recharge_rejects_invalid_amounts(client, auth_headers, amount):
    response = client.post(
        '/api/billing/recharge',
        json={'amount': amount},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert 'Pacotes disponíveis' in response.json()['message']


def test_recharge_unblocks_chat(
    client, auth_headers, registered_user, session, fake_reply
):
    _set_balance(session, registered_user['payload']['email'], 0)
    assert (
        _send_message(client, auth_headers).status_code
        == HTTPStatus.PAYMENT_REQUIRED
    )

    client.post(
        '/api/billing/recharge',
        json={'amount': RECHARGE_AMOUNT},
        headers=auth_headers,
    )

    response = _send_message(client, auth_headers)
    assert response.status_code == HTTPStatus.CREATED
    assert response.json()['balance'] == RECHARGE_AMOUNT - INTERACTION_COST


# ---------------------------------------------------------------------------
# billing_service
# ---------------------------------------------------------------------------


def test_debit_tokens_unknown_user_raises(session):
    with pytest.raises(ValueError, match='não encontrado'):
        billing_service.debit_tokens(session, uuid4(), 10)


def test_credit_tokens_unknown_user_raises(session):
    with pytest.raises(ValueError, match='não encontrado'):
        billing_service.credit_tokens(session, uuid4(), 10)
