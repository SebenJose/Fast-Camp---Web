from datetime import timedelta
from http import HTTPStatus

from sqlalchemy import func, select

from organiza_ia_api.models import PasswordResetToken, User, utcnow
from organiza_ia_api.routers import password_reset
from organiza_ia_api.schemas import RESET_CODE_PATTERN

RESET_CODE = '654321'


def test_generate_code_returns_six_digit_numeric_string():
    # Sem monkeypatch: exercita a implementação real de _generate_code,
    # que os outros testes substituem por um valor fixo para determinismo.
    # Reusa o mesmo padrão que o schema usa pra validar o código recebido
    # do cliente, garantindo que o gerador produz algo que a própria API
    # aceitaria.
    code = password_reset._generate_code()

    assert RESET_CODE_PATTERN.match(code)


def _request_reset_code(client, monkeypatch, email):
    monkeypatch.setattr(password_reset, '_generate_code', lambda: RESET_CODE)
    return client.post(
        '/api/auth/forgot-password/request', json={'email': email}
    )


def test_request_reset_generic_message_for_existing_email(
    client, monkeypatch, registered_user
):
    response = _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['message'] == (
        'Se o e-mail existir, enviamos um código de recuperação.'
    )


def test_request_reset_same_generic_message_for_unknown_email(
    client, monkeypatch, registered_user
):
    known_response = _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )
    unknown_response = _request_reset_code(
        client, monkeypatch, 'ninguem@example.com'
    )

    assert known_response.status_code == unknown_response.status_code
    assert known_response.json() == unknown_response.json()


def test_request_reset_rate_limit_keeps_generic_message(
    client, monkeypatch, registered_user, session
):
    email = registered_user['payload']['email']

    for _ in range(password_reset.MAX_RESET_REQUESTS_PER_WINDOW):
        _request_reset_code(client, monkeypatch, email)

    response = _request_reset_code(client, monkeypatch, email)

    # A resposta é idêntica à normal (um 429 aqui revelaria quais e-mails
    # existem), mas nenhum código novo é emitido.
    assert response.status_code == HTTPStatus.OK
    assert response.json()['message'] == (
        'Se o e-mail existir, enviamos um código de recuperação.'
    )

    token_count = session.scalar(
        select(func.count()).select_from(PasswordResetToken)
    )
    assert token_count == password_reset.MAX_RESET_REQUESTS_PER_WINDOW


def test_new_request_invalidates_previous_code(
    client, monkeypatch, registered_user
):
    email = registered_user['payload']['email']

    monkeypatch.setattr(password_reset, '_generate_code', lambda: '111111')
    client.post('/api/auth/forgot-password/request', json={'email': email})

    monkeypatch.setattr(password_reset, '_generate_code', lambda: '222222')
    client.post('/api/auth/forgot-password/request', json={'email': email})

    old_code = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': email, 'code': '111111'},
    )
    assert old_code.status_code == HTTPStatus.BAD_REQUEST

    current_code = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': email, 'code': '222222'},
    )
    assert current_code.status_code == HTTPStatus.OK


def test_request_cleans_up_tokens_past_retention(
    client, monkeypatch, registered_user, session
):
    user = session.scalar(select(User))
    stale_token = PasswordResetToken(
        user_id=user.id,
        code_hash='hash-antigo',
        expires_at=utcnow()
        - password_reset.RESET_TOKEN_RETENTION
        - timedelta(minutes=1),
    )
    session.add(stale_token)
    session.commit()

    _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )

    remaining = session.scalars(select(PasswordResetToken)).all()
    assert len(remaining) == 1
    assert remaining[0].code_hash != 'hash-antigo'


def test_verify_wrong_code(client, monkeypatch, registered_user):
    _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )

    response = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': registered_user['payload']['email'], 'code': '000000'},
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == 'Código inválido ou expirado.'


def test_verify_correct_code(client, monkeypatch, registered_user):
    _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )

    response = client.post(
        '/api/auth/forgot-password/verify',
        json={
            'email': registered_user['payload']['email'],
            'code': RESET_CODE,
        },
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['message'] == 'Código válido.'


def test_verify_malformed_code_is_rejected_by_schema(client, registered_user):
    response = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': registered_user['payload']['email'], 'code': 'abc'},
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Informe os 6 dígitos do código de verificação.'
    )


def test_verify_unknown_email_returns_generic_invalid_code_message(client):
    # E-mail que nunca foi cadastrado: precisa cair no mesmo erro genérico
    # de "código inválido" (não pode revelar que o e-mail não existe).
    response = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': 'ninguem@example.com', 'code': '123456'},
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == 'Código inválido ou expirado.'


def test_reset_password_with_correct_code(
    client, monkeypatch, registered_user
):
    _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )

    response = client.post(
        '/api/auth/forgot-password/reset',
        json={
            'email': registered_user['payload']['email'],
            'code': RESET_CODE,
            'password': 'senhaNova123',
            'passwordConfirmation': 'senhaNova123',
        },
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['message'] == 'Senha redefinida com sucesso.'

    login_response = client.post(
        '/api/auth/login',
        json={
            'email': registered_user['payload']['email'],
            'password': 'senhaNova123',
        },
    )
    assert login_response.status_code == HTTPStatus.OK


def test_reset_password_drops_active_sessions(
    client, monkeypatch, registered_user
):
    email = registered_user['payload']['email']
    old_token = registered_user['access_token']
    _request_reset_code(client, monkeypatch, email)

    client.post(
        '/api/auth/forgot-password/reset',
        json={
            'email': email,
            'code': RESET_CODE,
            'password': 'senhaNova123',
            'passwordConfirmation': 'senhaNova123',
        },
    )

    # Sessões abertas antes do reset (token e cookie antigos) caem.
    response = client.get(
        '/api/users/me',
        headers={'Authorization': f'Bearer {old_token}'},
    )
    assert response.status_code == HTTPStatus.UNAUTHORIZED

    client.cookies.clear()
    session_response = client.get('/api/auth/session')
    assert session_response.json()['session'] is None


def test_reset_password_code_cannot_be_reused(
    client, monkeypatch, registered_user
):
    _request_reset_code(
        client, monkeypatch, registered_user['payload']['email']
    )
    reset_payload = {
        'email': registered_user['payload']['email'],
        'code': RESET_CODE,
        'password': 'senhaNova123',
        'passwordConfirmation': 'senhaNova123',
    }
    first_response = client.post(
        '/api/auth/forgot-password/reset', json=reset_payload
    )
    assert first_response.status_code == HTTPStatus.OK

    second_response = client.post(
        '/api/auth/forgot-password/reset', json=reset_payload
    )

    assert second_response.status_code == HTTPStatus.BAD_REQUEST
    assert second_response.json()['message'] == (
        'Código inválido ou expirado.'
    )


def test_reset_blocks_after_max_attempts(client, monkeypatch, registered_user):
    email = registered_user['payload']['email']
    password = registered_user['payload']['password']
    _request_reset_code(client, monkeypatch, email)

    for _ in range(password_reset.MAX_RESET_ATTEMPTS):
        wrong_attempt = client.post(
            '/api/auth/forgot-password/verify',
            json={'email': email, 'code': '000000'},
        )
        assert wrong_attempt.status_code == HTTPStatus.BAD_REQUEST

    # Mesmo o código CERTO é rejeitado depois de estourar as tentativas.
    response = client.post(
        '/api/auth/forgot-password/verify',
        json={'email': email, 'code': RESET_CODE},
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == 'Código inválido ou expirado.'

    # E a senha original permanece intacta.
    login_response = client.post(
        '/api/auth/login', json={'email': email, 'password': password}
    )
    assert login_response.status_code == HTTPStatus.OK


def test_reset_unknown_email_returns_generic_invalid_code_message(client):
    response = client.post(
        '/api/auth/forgot-password/reset',
        json={
            'email': 'ninguem@example.com',
            'code': '123456',
            'password': 'senhaNova123',
            'passwordConfirmation': 'senhaNova123',
        },
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()['message'] == 'Código inválido ou expirado.'
