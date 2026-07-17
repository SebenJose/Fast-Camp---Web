from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.models import User, utcnow
from organiza_ia_api.routers.auth import EMAIL_TAKEN_MESSAGE
from organiza_ia_api.schemas import UserPublic, UserUpdateRequest
from organiza_ia_api.security import (
    create_session_token,
    get_current_user,
    get_password_hash,
    set_session_cookie,
)

router = APIRouter(prefix='/api/users', tags=['users'])


@router.get('/me', status_code=HTTPStatus.OK, response_model=UserPublic)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch('/me', status_code=HTTPStatus.OK, response_model=UserPublic)
def update_current_user(
    data: UserUpdateRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> User:
    if data.email and data.email.lower() != current_user.email:
        normalized_email = data.email.lower()
        existing_user = session.scalar(
            select(User).where(User.email == normalized_email)
        )

        if existing_user:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT, detail=EMAIL_TAKEN_MESSAGE
            )

        current_user.email = normalized_email

    if data.name:
        current_user.name = data.name

    password_changed = False

    if data.password:
        current_user.password_hash = get_password_hash(data.password)
        current_user.password_changed_at = utcnow()
        password_changed = True

    session.add(current_user)

    try:
        session.commit()
    except IntegrityError:
        # Outro request registrou esse e-mail entre a checagem e o UPDATE.
        session.rollback()
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT, detail=EMAIL_TAKEN_MESSAGE
        )

    session.refresh(current_user)

    if password_changed:
        # Reemite a sessão de quem trocou a senha; todas as outras sessões
        # caem porque os tokens antigos carregam o "pwv" anterior.
        set_session_cookie(response, create_session_token(current_user))

    return current_user
