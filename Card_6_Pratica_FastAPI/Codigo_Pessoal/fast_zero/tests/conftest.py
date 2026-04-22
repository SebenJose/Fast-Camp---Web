import pytest
from fastapi.testclient import TestClient

from fast_zero.app import app, database


@pytest.fixture
def client():
    database.clear()
    return TestClient(app)


@pytest.fixture
def user(client):
    data = {
        'username': 'alice',
        'email': 'alice@example.com',
        'password': 'secret',
    }
    response = client.post('/users/', json=data)
    return response.json()
