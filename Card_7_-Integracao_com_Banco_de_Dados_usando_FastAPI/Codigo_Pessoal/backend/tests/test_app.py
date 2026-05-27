from http import HTTPStatus

from fast_zero.models import User
from fast_zero.schemas import UserPublic
from fast_zero.security import create_access_token

SURVEY_PAYLOAD = {
    'readingDate': '2026-05-27T12:00:00',
    'theme': 'Tecnologia',
    'frequency': 'Diariamente',
}


def auth_header(email: str):
    token = create_access_token({'sub': email})

    return {'Authorization': f'Bearer {token}'}


def create_authenticated_user(session):
    user = User(
        username='Survey User',
        email='survey@example.com',
        password='stored-password',
    )
    session.add(user)
    session.commit()

    return user


def password_does_not_match(plain_password: str, hashed_password: str) -> bool:
    return False


def test_root_deve_retornar_ok_e_ola_mundo(client):

    response = client.get('/')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'Ola Mundo!'}


def test_create_user(client):

    response = client.post(
        '/users/',
        json={
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'secret',
        },
    )

    assert response.status_code == HTTPStatus.CREATED
    assert response.json() == {
        'id': 1,
        'email': 'alice@example.com',
        'username': 'alice',
    }


def test_read_users(client):
    response = client.get('/users')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'users': []}


def test_read_users_with_users(client, user):
    user_schema = UserPublic.model_validate(user).model_dump()
    response = client.get('/users')

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'users': [user_schema]}


def test_update_user(client, user, token):
    response = client.put(
        f'/users/{user.id}',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'username': 'bob',
            'email': 'bob@example.com',
            'password': 'secret',
            'id': user.id,
        },
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        'username': 'bob',
        'email': 'bob@example.com',
        'id': user.id,
    }


def test_delete_user(client, user, token):
    response = client.delete(
        f'/users/{user.id}',
        headers={'Authorization': f'Bearer {token}'},
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {'message': 'User deleted'}


def test_get_token(client, user):
    response = client.post(
        '/token',
        data={'username': user.email, 'password': user.clean_password},
    )

    token = response.json()
    assert response.status_code == HTTPStatus.OK
    assert token['token_type'] == 'Bearer'
    assert 'access_token' in token


def test_get_token_with_invalid_password_returns_unauthorized(
    client, session, monkeypatch
):
    user = create_authenticated_user(session)
    monkeypatch.setattr(
        'fast_zero.app.verify_password', password_does_not_match
    )

    response = client.post(
        '/token',
        data={'username': user.email, 'password': 'wrong-password'},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Incorrect email or password'}


def test_create_survey(client, session):
    user = create_authenticated_user(session)

    response = client.post(
        '/surveys/',
        headers=auth_header(user.email),
        json=SURVEY_PAYLOAD,
    )

    assert response.status_code == HTTPStatus.CREATED
    assert response.json() == {
        'id': 1,
        'readingDate': '2026-05-27T12:00:00',
        'theme': 'Tecnologia',
        'frequency': 'Diariamente',
    }


def test_create_survey_requires_authentication(client):
    response = client.post(
        '/surveys/',
        json=SURVEY_PAYLOAD,
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}


def test_read_surveys(client, session):
    user = create_authenticated_user(session)
    headers = auth_header(user.email)

    client.post(
        '/surveys/',
        headers=headers,
        json=SURVEY_PAYLOAD,
    )

    response = client.get(
        '/surveys/',
        headers=headers,
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        'surveys': [
            {
                'id': 1,
                'readingDate': '2026-05-27T12:00:00',
                'theme': 'Tecnologia',
                'frequency': 'Diariamente',
            }
        ]
    }


def test_read_surveys_requires_authentication(client):
    response = client.get('/surveys/')

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert response.json() == {'detail': 'Not authenticated'}
