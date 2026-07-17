from http import HTTPStatus

from organiza_ia_api.routers.auth import MAX_LOGIN_ATTEMPTS
from organiza_ia_api.schemas import (
    MAX_EMAIL_LENGTH,
    MAX_NAME_LENGTH,
    MAX_PASSWORD_LENGTH,
)


def test_register_success(client, user_payload):
    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.CREATED
    body = response.json()
    assert body['session']['name'] == user_payload['name']
    assert body['session']['email'] == user_payload['email']
    assert body['access_token']
    assert 'access_token' in response.cookies


def test_register_duplicate_email(client, registered_user):
    response = client.post(
        '/api/auth/register', json=registered_user['payload']
    )

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json()['message'] == (
        'Já existe uma conta cadastrada com esse e-mail.'
    )


def test_register_password_mismatch(client, user_payload):
    user_payload['passwordConfirmation'] = 'outra-senha'

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'As senhas precisam ser iguais.'


def test_register_password_too_short(client, user_payload):
    user_payload['password'] = '123'
    user_payload['passwordConfirmation'] = '123'

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'A senha precisa ter pelo menos 6 caracteres.'
    )


def test_register_race_duplicate_email_returns_conflict(
    client, registered_user, user_payload, session, monkeypatch
):
    # Simula a corrida: o e-mail já existe, mas o SELECT de checagem é
    # forçado a devolver None (como se a outra conta tivesse sido criada
    # entre a checagem e o INSERT). A unique constraint barra o INSERT e o
    # endpoint precisa responder 409, não 500.
    monkeypatch.setattr(session, 'scalar', lambda *args, **kwargs: None)

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json()['message'] == (
        'Já existe uma conta cadastrada com esse e-mail.'
    )


def test_register_password_too_long(client, user_payload):
    user_payload['password'] = 'x' * (MAX_PASSWORD_LENGTH + 1)
    user_payload['passwordConfirmation'] = user_payload['password']

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        f'A senha pode ter no máximo {MAX_PASSWORD_LENGTH} caracteres.'
    )


def test_register_name_too_long(client, user_payload):
    user_payload['name'] = 'x' * (MAX_NAME_LENGTH + 1)

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        f'O nome pode ter no máximo {MAX_NAME_LENGTH} caracteres.'
    )


def test_register_email_too_long(client, user_payload):
    user_payload['email'] = 'x' * MAX_EMAIL_LENGTH + '@example.com'

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        f'O e-mail pode ter no máximo {MAX_EMAIL_LENGTH} caracteres.'
    )


def test_login_password_too_long(client):
    response = client.post(
        '/api/auth/login',
        json={
            'email': 'maria@example.com',
            'password': 'x' * (MAX_PASSWORD_LENGTH + 1),
        },
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        f'A senha pode ter no máximo {MAX_PASSWORD_LENGTH} caracteres.'
    )


def test_register_name_too_short(client, user_payload):
    user_payload['name'] = 'A'

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Informe seu nome.'


def test_register_name_only_whitespace(client, user_payload):
    user_payload['name'] = '   '

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Informe seu nome.'


def test_register_name_is_trimmed_before_saving(client, user_payload):
    user_payload['name'] = '  Maria  '

    response = client.post('/api/auth/register', json=user_payload)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json()['session']['name'] == 'Maria'


def test_login_success_sets_cookie(client, registered_user):
    response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': registered_user['payload']['password'],
        },
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['access_token']
    assert (
        response.json()['session']['email']
        == registered_user['payload']['email']
    )
    assert 'access_token' in response.cookies


def test_login_wrong_password(client, registered_user):
    response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': 'senha-errada',
        },
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()['message'] == 'E-mail ou senha inválidos.'


def test_login_unknown_email(client):
    response = client.post(
        '/api/auth/login',
        json={'email': 'ninguem@example.com', 'password': 'qualquer123'},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json()['message'] == 'E-mail ou senha inválidos.'


def test_login_locks_after_too_many_failed_attempts(client, registered_user):
    for _ in range(MAX_LOGIN_ATTEMPTS):
        response = client.post(
            '/api/auth/login',
            json={
                'email': registered_user['payload']['email'],
                'password': 'senha-errada',
            },
        )
        assert response.status_code == HTTPStatus.UNAUTHORIZED

    response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': registered_user['payload']['password'],
        },
    )

    assert response.status_code == HTTPStatus.TOO_MANY_REQUESTS


def test_login_success_resets_failed_attempts(client, registered_user):
    client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': 'senha-errada',
        },
    )

    response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': registered_user['payload']['password'],
        },
    )

    assert response.status_code == HTTPStatus.OK


def test_session_via_cookie(client, registered_user):
    # registered_user já fez o registro nesse mesmo client, então o
    # cookie httpOnly setado na resposta já está no jar do client.
    response = client.get('/api/auth/session')

    assert response.status_code == HTTPStatus.OK
    assert (
        response.json()['session']['email']
        == (registered_user['payload']['email'])
    )


def test_session_via_bearer_header(client, registered_user):
    client.cookies.clear()

    response = client.get(
        '/api/auth/session',
        headers={'Authorization': f'Bearer {registered_user["access_token"]}'},
    )

    assert response.status_code == HTTPStatus.OK
    assert (
        response.json()['session']['email']
        == registered_user['payload']['email']
    )


def test_session_without_auth_returns_null(client):
    response = client.get('/api/auth/session')

    assert response.status_code == HTTPStatus.OK
    assert response.json()['session'] is None


def test_logout_clears_cookie(client, registered_user):
    response = client.post('/api/auth/logout')

    assert response.status_code == HTTPStatus.OK
    assert response.json()['message'] == 'Sessão encerrada.'

    session_response = client.get('/api/auth/session')
    assert session_response.json()['session'] is None
