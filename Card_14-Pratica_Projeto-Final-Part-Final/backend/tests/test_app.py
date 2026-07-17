from http import HTTPStatus

from fastapi.testclient import TestClient

from organiza_ia_api.app import MAX_REQUEST_BODY_BYTES, app
from organiza_ia_api.database import get_session
from organiza_ia_api.schemas import MAX_USER_ID_LENGTH


def test_read_root(client):
    response = client.get('/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'Organiza.IA API no ar.'}


def test_unknown_route_returns_message_contract(client):
    # 404 de roteamento (rota que não existe): levantado pelo Starlette
    # como StarletteHTTPException, não pela subclasse fastapi.HTTPException
    # usada pelos routers - precisa cair no mesmo handler para manter o
    # contrato {"message": ...} em português.
    response = client.get('/rota-que-nao-existe')

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json() == {'message': 'Rota não encontrada.'}


def test_wrong_method_returns_message_contract(client):
    # 405 de roteamento (verbo errado numa rota que existe): mesmo caso do
    # teste acima, só que levantado pelo matching de método do Router.
    response = client.get('/api/auth/login')

    assert response.status_code == HTTPStatus.METHOD_NOT_ALLOWED
    assert response.json() == {'message': 'Método não permitido.'}


def test_unhandled_exception_returns_generic_message():
    # Uma exceção não prevista (aqui, forçada via dependency_override) não
    # pode escapar para o handler padrão do Starlette, que devolve texto
    # puro e quebra o contrato JSON {"message": ...} de toda a API.
    def broken_session():
        raise RuntimeError('falha simulada de infraestrutura')
        yield  # pragma: no cover - nunca executa, mantém a assinatura de gerador

    app.dependency_overrides[get_session] = broken_session

    try:
        with TestClient(app, raise_server_exceptions=False) as broken_client:
            response = broken_client.get('/api/auth/session')
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json() == {'message': 'Erro interno no servidor.'}


def test_rejects_request_body_larger_than_max(client):
    response = client.post(
        '/api/auth/login',
        content=b'x' * (MAX_REQUEST_BODY_BYTES + 1),
        headers={'Content-Type': 'application/json'},
    )

    assert response.status_code == HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    assert response.json()['message'] == (
        'O corpo da requisição excede o tamanho máximo permitido.'
    )


def test_rejects_oversized_body_without_content_length_header(client):
    def stream():
        yield b'x' * (MAX_REQUEST_BODY_BYTES + 1)

    response = client.post(
        '/api/auth/login',
        content=stream(),
        headers={'Content-Type': 'application/json'},
    )

    assert response.status_code == HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    assert response.json()['message'] == (
        'O corpo da requisição excede o tamanho máximo permitido.'
    )


# Erros gerados pelo próprio Pydantic (campo faltando, tipo errado, e-mail
# inválido...) vêm em inglês; o exception handler precisa traduzi-los para
# o contrato de erro continuar 100% em português.


def test_validation_missing_field_message_in_portuguese(client):
    response = client.post('/api/auth/login', json={'email': 'a@b.com'})

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Preencha todos os campos obrigatórios.'
    )


def test_validation_invalid_email_message_in_portuguese(client):
    response = client.post(
        '/api/auth/login',
        json={'email': 'nao-e-um-email', 'password': 'senha123'},
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Informe um e-mail válido.'


def test_validation_too_long_field_message_in_portuguese(client, auth_headers):
    response = client.patch(
        '/api/schedule/day-range',
        json={
            'userId': 'x' * (MAX_USER_ID_LENGTH + 1),
            'dayRange': {'startMinutes': 8 * 60, 'endMinutes': 20 * 60},
        },
        headers=auth_headers,
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == (
        'Um dos campos enviados excede o tamanho máximo permitido.'
    )


def test_validation_unknown_error_uses_generic_fallback(client):
    # Tipo errado (lista no lugar de string): erro "string_type" do
    # Pydantic, que não tem tradução específica e cai no fallback.
    response = client.post(
        '/api/auth/login',
        json={'email': ['nao-e-string'], 'password': 'senha123'},
    )

    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert response.json()['message'] == 'Dados inválidos.'
