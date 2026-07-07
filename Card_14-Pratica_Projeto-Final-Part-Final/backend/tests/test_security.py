from http import HTTPStatus
from uuid import uuid4

from jwt import encode

from organiza_ia_api.security import create_access_token
from organiza_ia_api.settings import get_settings

# Testes de casos de token inválido que não são exercitados pelo fluxo
# normal de login/registro, mas que a dependency de autenticação precisa
# rejeitar (ou tratar como "sem sessão", no caso da auth opcional).


def test_protected_route_rejects_malformed_bearer_token(client):
    response = client.get(
        '/api/users/me',
        headers={'Authorization': 'Bearer isso-nao-e-um-jwt'},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_protected_route_rejects_token_with_non_uuid_subject(client):
    # Token assinado com a chave certa (então passa no decode do JWT), mas
    # com um "sub" que não é um UUID válido: exercita o ValueError isolado
    # do PyJWTError do teste acima.
    settings = get_settings()
    token = encode(
        {'sub': 'nao-e-um-uuid'},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    response = client.get(
        '/api/users/me', headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_protected_route_rejects_token_for_user_that_does_not_exist(client):
    # Token válido e bem formado (mesmo mecanismo do login real), mas para
    # um user_id que não existe no banco - simula uma conta apagada depois
    # do token ter sido emitido.
    token = create_access_token(data={'sub': str(uuid4())})

    response = client.get(
        '/api/users/me', headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED


def test_optional_auth_returns_null_session_for_malformed_token(client):
    response = client.get(
        '/api/auth/session',
        headers={'Authorization': 'Bearer isso-nao-e-um-jwt'},
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()['session'] is None
