import secrets
from datetime import timedelta
from http import HTTPStatus

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.mail import send_password_reset_code
from organiza_ia_api.models import PasswordResetToken, User, utcnow
from organiza_ia_api.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResetRequest,
    ForgotPasswordVerifyRequest,
    Message,
)
from organiza_ia_api.security import (
    DUMMY_PASSWORD_HASH,
    get_password_hash,
    verify_password,
)
from organiza_ia_api.settings import get_settings

router = APIRouter(
    prefix='/api/auth/forgot-password', tags=['forgot-password']
)

# O código tem só 6 dígitos: sem teto de tentativas o endpoint vira alvo
# de força bruta dentro da janela de expiração.
MAX_RESET_ATTEMPTS = 5

# Sem rate limit, um atacante inunda a caixa de entrada da vítima e ganha
# 5 tentativas novas de força bruta a cada código emitido.
MAX_RESET_REQUESTS_PER_WINDOW = 3
RESET_REQUEST_WINDOW = timedelta(minutes=15)

# Retenção maior que a janela do rate limit: a contagem de requests
# recentes usa as linhas dessa tabela.
RESET_TOKEN_RETENTION = timedelta(hours=1)


def _generate_code() -> str:
    return f'{secrets.randbelow(1_000_000):06d}'


def _cleanup_expired_tokens(session: Session) -> None:
    session.execute(
        delete(PasswordResetToken).where(
            PasswordResetToken.expires_at < utcnow() - RESET_TOKEN_RETENTION
        )
    )


def _recent_request_count(session: Session, user: User) -> int:
    return session.scalar(
        select(func.count())
        .select_from(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at > utcnow() - RESET_REQUEST_WINDOW,
        )
    )


def _latest_valid_token(
    session: Session, user: User
) -> PasswordResetToken | None:
    return session.scalar(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > utcnow(),
        )
        .order_by(PasswordResetToken.created_at.desc())
    )


def _invalid_code_exception() -> HTTPException:
    return HTTPException(
        status_code=HTTPStatus.BAD_REQUEST,
        detail='Código inválido ou expirado.',
    )


def _reject_unknown_email(code: str) -> HTTPException:
    # Verifica contra o hash morto para o tempo de resposta não denunciar
    # se o e-mail está cadastrado.
    verify_password(code, DUMMY_PASSWORD_HASH)
    return _invalid_code_exception()


def _consume_valid_reset_token(
    session: Session, user: User, code: str
) -> PasswordResetToken:
    reset_token = _latest_valid_token(session, user)

    if not reset_token:
        verify_password(code, DUMMY_PASSWORD_HASH)
        raise _invalid_code_exception()

    if reset_token.attempts >= MAX_RESET_ATTEMPTS:
        reset_token.used_at = utcnow()
        session.add(reset_token)
        session.commit()
        raise _invalid_code_exception()

    if not verify_password(code, reset_token.code_hash):
        reset_token.attempts += 1
        session.add(reset_token)
        session.commit()
        raise _invalid_code_exception()

    return reset_token


@router.post('/request', status_code=HTTPStatus.OK, response_model=Message)
def request_password_reset(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
) -> Message:
    user = session.scalar(select(User).where(User.email == data.email.lower()))

    generic_message = Message(
        message='Se o e-mail existir, enviamos um código de recuperação.'
    )

    _cleanup_expired_tokens(session)

    if not user:
        # Hash morto: gasta o mesmo tempo do caminho de usuário existente.
        get_password_hash(_generate_code())
        session.commit()
        return generic_message

    if _recent_request_count(session, user) >= MAX_RESET_REQUESTS_PER_WINDOW:
        # Mesma resposta genérica do caminho normal: um 429 aqui contaria
        # a um atacante quais e-mails existem.
        get_password_hash(_generate_code())
        session.commit()
        return generic_message

    # Um único código ativo por vez. Marca como usado (em vez de apagar)
    # para a linha continuar contando no rate limit.
    session.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
        .values(used_at=utcnow())
    )

    settings = get_settings()
    code = _generate_code()
    reset_token = PasswordResetToken(
        user_id=user.id,
        code_hash=get_password_hash(code),
        expires_at=utcnow()
        + timedelta(minutes=settings.PASSWORD_RESET_CODE_EXPIRE_MINUTES),
    )

    session.add(reset_token)
    session.commit()

    background_tasks.add_task(send_password_reset_code, user.email, code)

    return generic_message


@router.post('/verify', status_code=HTTPStatus.OK, response_model=Message)
def verify_password_reset_code(
    data: ForgotPasswordVerifyRequest, session: Session = Depends(get_session)
) -> Message:
    user = session.scalar(select(User).where(User.email == data.email.lower()))

    if not user:
        raise _reject_unknown_email(data.code)

    _consume_valid_reset_token(session, user, data.code)

    return Message(message='Código válido.')


@router.post('/reset', status_code=HTTPStatus.OK, response_model=Message)
def reset_password(
    data: ForgotPasswordResetRequest, session: Session = Depends(get_session)
) -> Message:
    user = session.scalar(select(User).where(User.email == data.email.lower()))

    if not user:
        raise _reject_unknown_email(data.code)

    reset_token = _consume_valid_reset_token(session, user, data.code)

    user.password_hash = get_password_hash(data.password)
    # Derruba todas as sessões abertas da conta (ver claim "pwv").
    user.password_changed_at = utcnow()
    reset_token.used_at = utcnow()

    session.add_all([user, reset_token])
    session.commit()

    return Message(message='Senha redefinida com sucesso.')
