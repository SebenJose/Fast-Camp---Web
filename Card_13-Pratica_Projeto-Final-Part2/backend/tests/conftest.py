import os

# Antes de importar a aplicação: o Settings exige DATABASE_URL e
# SECRET_KEY, e sem esses defaults a suíte só rodaria com um .env presente.
os.environ.setdefault('DATABASE_URL', 'sqlite://')
os.environ.setdefault('SECRET_KEY', 'chave-de-teste-nao-usar-em-producao')

from collections.abc import Iterator  # noqa: E402
from typing import Any  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from organiza_ia_api.app import app  # noqa: E402
from organiza_ia_api.database import get_session  # noqa: E402
from organiza_ia_api.models import table_registry  # noqa: E402


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine(
        'sqlite:///:memory:',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    table_registry.metadata.create_all(engine)

    with Session(engine) as session:
        yield session

    table_registry.metadata.drop_all(engine)


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    def get_session_override() -> Session:
        return session

    app.dependency_overrides[get_session] = get_session_override

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def user_payload() -> dict[str, str]:
    return {
        'name': 'Maria Teste',
        'email': 'maria@example.com',
        'password': 'senha123',
        'passwordConfirmation': 'senha123',
    }


@pytest.fixture
def registered_user(
    client: TestClient, user_payload: dict[str, str]
) -> dict[str, Any]:
    response = client.post('/api/auth/register', json=user_payload)
    body = response.json()

    return {
        'payload': user_payload,
        'session': body['session'],
        'access_token': body['access_token'],
    }


@pytest.fixture
def auth_headers(registered_user: dict[str, Any]) -> dict[str, str]:
    return {'Authorization': f'Bearer {registered_user["access_token"]}'}
