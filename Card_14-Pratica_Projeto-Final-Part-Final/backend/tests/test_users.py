from http import HTTPStatus


def test_read_current_user(client, registered_user, auth_headers):
    response = client.get('/api/users/me', headers=auth_headers)

    assert response.status_code == HTTPStatus.OK
    body = response.json()
    assert body['email'] == registered_user['payload']['email']
    assert 'password' not in body
    assert 'password_hash' not in body


def test_read_current_user_without_auth(client):
    response = client.get('/api/users/me')

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_update_name(client, auth_headers):
    response = client.patch(
        '/api/users/me', json={'name': 'Novo Nome'}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['name'] == 'Novo Nome'


def test_update_email_conflict(client, registered_user, auth_headers):
    other_payload = {
        'name': 'Outra Pessoa',
        'email': 'outra@example.com',
        'password': 'senha123',
        'passwordConfirmation': 'senha123',
    }
    client.post('/api/auth/register', json=other_payload)

    response = client.patch(
        '/api/users/me',
        json={'email': other_payload['email']},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json()['message'] == (
        'Já existe uma conta cadastrada com esse e-mail.'
    )


def test_update_email_success(client, registered_user, auth_headers):
    new_email = 'novo-email@example.com'

    response = client.patch(
        '/api/users/me', json={'email': new_email}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['email'] == new_email

    # Confirma que o e-mail novo foi persistido de verdade (não só
    # devolvido na resposta): login com o e-mail antigo falha, e com o
    # novo funciona.
    old_email_login = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': registered_user['payload']['password'],
        },
    )
    assert old_email_login.status_code == HTTPStatus.UNAUTHORIZED

    new_email_login = client.post(
        '/api/auth/login',
        json={
            'email': new_email,
            'password': registered_user['payload']['password'],
        },
    )
    assert new_email_login.status_code == HTTPStatus.OK


def test_update_password(client, registered_user, auth_headers):
    response = client.patch(
        '/api/users/me',
        json={
            'password': 'senhaNova123',
            'passwordConfirmation': 'senhaNova123',
        },
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.OK

    login_response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': 'senhaNova123',
        },
    )
    assert login_response.status_code == HTTPStatus.OK


def test_update_password_drops_other_sessions(
    client, registered_user, auth_headers
):
    # Segunda sessão da mesma conta (outro "dispositivo").
    other_login = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': registered_user['payload']['password'],
        },
    )
    other_token = other_login.json()['access_token']

    response = client.patch(
        '/api/users/me',
        json={
            'password': 'senhaNova123',
            'passwordConfirmation': 'senhaNova123',
        },
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.OK
    # Quem trocou a senha recebe um cookie de sessão novo...
    assert 'access_token' in response.cookies

    # ...e continua logado (o client guarda o cookie novo no jar).
    assert client.get('/api/users/me').status_code == HTTPStatus.OK

    # Todas as outras sessões (tokens emitidos antes da troca) caem.
    dropped = client.get(
        '/api/users/me',
        headers={'Authorization': f'Bearer {other_token}'},
    )
    assert dropped.status_code == HTTPStatus.UNAUTHORIZED


def test_update_email_race_returns_conflict(
    client, registered_user, auth_headers, session, monkeypatch
):
    # Simula a corrida: o e-mail alvo já pertence a outra conta, mas o
    # SELECT de checagem de conflito é forçado a devolver None; a unique
    # constraint barra o UPDATE e o endpoint responde 409, não 500.
    other_payload = {
        'name': 'Outra Pessoa',
        'email': 'outra@example.com',
        'password': 'senha123',
        'passwordConfirmation': 'senha123',
    }
    client.post('/api/auth/register', json=other_payload)

    conflict_check_call = 2  # 1ª chamada: usuário do token; 2ª: conflito
    real_scalar = session.scalar
    calls = []

    def scalar_skipping_conflict_check(*args, **kwargs):
        calls.append(args)
        if len(calls) == conflict_check_call:
            return None
        return real_scalar(*args, **kwargs)

    monkeypatch.setattr(session, 'scalar', scalar_skipping_conflict_check)

    response = client.patch(
        '/api/users/me',
        json={'email': other_payload['email']},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json()['message'] == (
        'Já existe uma conta cadastrada com esse e-mail.'
    )


def test_update_password_without_confirmation(client, auth_headers):
    response = client.patch(
        '/api/users/me',
        json={'password': 'senhaNova123'},
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Informe a senha e a confirmação juntas para alterá-la.'
    )


def test_update_name_too_short(client, auth_headers):
    response = client.patch(
        '/api/users/me', json={'name': 'A'}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Informe seu nome.'


def test_update_name_is_trimmed(client, auth_headers):
    response = client.patch(
        '/api/users/me', json={'name': '  Novo Nome  '}, headers=auth_headers
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['name'] == 'Novo Nome'
