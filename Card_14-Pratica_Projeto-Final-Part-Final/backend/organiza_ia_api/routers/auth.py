from datetime import timedelta
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.models import User, utcnow
from organiza_ia_api.schemas import (
    AuthResponse,
    LoginRequest,
    Message,
    RegisterRequest,
    SessionPublic,
)
from organiza_ia_api.security import (
    DUMMY_PASSWORD_HASH,
    create_session_token,
    get_optional_current_user,
    get_password_hash,
    set_session_cookie,
    verify_password,
)
from organiza_ia_api.settings import get_settings

router = APIRouter(prefix='/api/auth', tags=['auth'])

EMAIL_TAKEN_MESSAGE = 'Já existe uma conta cadastrada com esse e-mail.'
INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos.'

MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_DURATION = timedelta(minutes=15)
LOGIN_LOCKED_MESSAGE = (
    'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
)


def _build_session(user: User) -> SessionPublic:
    return SessionPublic(userId=str(user.id), name=user.name, email=user.email)


@router.post(
    '/register', status_code=HTTPStatus.CREATED, response_model=AuthResponse
)
def register(
    data: RegisterRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> AuthResponse:
    normalized_email = data.email.lower()
    existing_user = session.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT, detail=EMAIL_TAKEN_MESSAGE
        )

    user = User(
        name=data.name,
        email=normalized_email,
        password_hash=get_password_hash(data.password),
    )

    session.add(user)

    try:
        session.commit()
    except IntegrityError:
        # Outro request criou o mesmo e-mail entre a checagem e o INSERT.
        session.rollback()
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT, detail=EMAIL_TAKEN_MESSAGE
        )

    session.refresh(user)

    access_token = create_session_token(user)
    set_session_cookie(response, access_token)

    return AuthResponse(
        session=_build_session(user), access_token=access_token
    )


@router.post('/login', status_code=HTTPStatus.OK, response_model=AuthResponse)
def login(
    data: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
) -> AuthResponse:
    normalized_email = data.email.lower()
    user = session.scalar(select(User).where(User.email == normalized_email))

    if (
        user
        and user.login_locked_until
        and user.login_locked_until > utcnow()
    ):
        raise HTTPException(
            status_code=HTTPStatus.TOO_MANY_REQUESTS,
            detail=LOGIN_LOCKED_MESSAGE,
        )

    # Verifica contra o hash morto quando o usuário não existe, para o
    # tempo de resposta não denunciar se o e-mail está cadastrado.
    password_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    password_is_valid = verify_password(data.password, password_hash)

    if not user or not password_is_valid:
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
                user.login_locked_until = utcnow() + LOGIN_LOCKOUT_DURATION
                user.failed_login_attempts = 0
            session.add(user)
            session.commit()

        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail=INVALID_CREDENTIALS_MESSAGE,
        )

    if user.failed_login_attempts or user.login_locked_until:
        user.failed_login_attempts = 0
        user.login_locked_until = None
        session.add(user)
        session.commit()

    access_token = create_session_token(user)
    set_session_cookie(response, access_token)

    return AuthResponse(
        session=_build_session(user), access_token=access_token
    )


@router.get(
    '/session',
    status_code=HTTPStatus.OK,
    response_model=AuthResponse,
)
def read_session(
    current_user: User | None = Depends(get_optional_current_user),
) -> AuthResponse:
    if not current_user:
        return AuthResponse(session=None)

    return AuthResponse(session=_build_session(current_user))


@router.post('/logout', status_code=HTTPStatus.OK, response_model=Message)
def logout(response: Response) -> Message:
    settings = get_settings()
    response.delete_cookie(key=settings.ACCESS_TOKEN_COOKIE_NAME)

    return Message(message='Sessão encerrada.')
