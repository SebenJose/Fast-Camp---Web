from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Any, Mapping
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import Depends, HTTPException, Response
from fastapi.security import (
    APIKeyCookie,
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jwt import decode, encode
from jwt.exceptions import PyJWTError
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.models import User
from organiza_ia_api.settings import get_settings

pwd_context = PasswordHash.recommended()

cookie_scheme = APIKeyCookie(
    name=get_settings().ACCESS_TOKEN_COOKIE_NAME, auto_error=False
)
bearer_scheme = HTTPBearer(auto_error=False)

# Hash "morto": verificado quando o usuário não existe, para o tempo de
# resposta não revelar quais e-mails estão cadastrados (timing attack).
DUMMY_PASSWORD_HASH = PasswordHash.recommended().hash(
    'organiza-ia-dummy-hash-for-timing-safety'
)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Mapping[str, str]) -> str:
    settings = get_settings()
    now = datetime.now(tz=ZoneInfo('UTC'))
    to_encode: dict[str, str | datetime] = dict(data)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire, 'iat': now})
    return encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _password_version(user: User) -> str:
    return (
        user.password_changed_at.isoformat()
        if user.password_changed_at
        else ''
    )


def create_session_token(user: User) -> str:
    # O claim "pwv" congela a data da última troca de senha: quando ela
    # muda no banco, todo token anterior deixa de bater na comparação e
    # todas as sessões abertas caem.
    return create_access_token(
        data={'sub': str(user.id), 'pwv': _password_version(user)}
    )


def set_session_cookie(response: Response, access_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite='lax',
        secure=settings.COOKIE_SECURE,
    )


def _decode_token_payload(token: str) -> dict[str, Any] | None:
    try:
        settings = get_settings()
        return decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except PyJWTError:
        return None


def _extract_token(
    cookie_token: str | None,
    bearer: HTTPAuthorizationCredentials | None,
) -> str | None:
    # O header Authorization explícito vence sobre um cookie ambiente, que
    # pode estar desatualizado ou pertencer a outra sessão de testes.
    if bearer:
        return bearer.credentials

    return cookie_token


def _user_from_token(session: Session, token: str) -> User | None:
    payload = _decode_token_payload(token)

    if not payload:
        return None

    try:
        # TypeError: payload sem "sub"; ValueError: "sub" não é UUID.
        user_id = UUID(payload.get('sub'))
    except (TypeError, ValueError):
        return None

    user = session.scalar(select(User).where(User.id == user_id))

    if not user:
        return None

    if payload.get('pwv', '') != _password_version(user):
        return None

    return user


def get_current_user(
    session: Session = Depends(get_session),
    cookie_token: str | None = Depends(cookie_scheme),
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> User:
    token = _extract_token(cookie_token, bearer)
    user = _user_from_token(session, token) if token else None

    if not user:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Sessão inválida ou expirada.',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    return user


def get_optional_current_user(
    session: Session = Depends(get_session),
    cookie_token: str | None = Depends(cookie_scheme),
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> User | None:
    token = _extract_token(cookie_token, bearer)

    if not token:
        return None

    return _user_from_token(session, token)
