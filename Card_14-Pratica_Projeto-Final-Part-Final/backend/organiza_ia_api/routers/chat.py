from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from organiza_ia_api import ai
from organiza_ia_api.database import get_session
from organiza_ia_api.models import ChatMessage, User
from organiza_ia_api.schemas import (
    ChatMessagePublic,
    ChatMessagesResponse,
    SendChatMessageRequest,
)
from organiza_ia_api.security import get_current_user

router = APIRouter(prefix='/api/chat', tags=['chat'])

# Quantas mensagens recentes vão como contexto para a LLM a cada envio.
HISTORY_CONTEXT_LIMIT = 20

AI_NOT_CONFIGURED_MESSAGE = (
    'O serviço de IA ainda não está configurado no servidor.'
)
AI_UNAVAILABLE_MESSAGE = (
    'Não foi possível obter a resposta da IA agora. '
    'Tente novamente em instantes.'
)


def _to_public(message: ChatMessage) -> ChatMessagePublic:
    return ChatMessagePublic(
        id=str(message.id),
        role=message.role,
        content=message.content,
        createdAt=f'{message.created_at.isoformat()}Z',
        inputTokens=message.input_tokens,
        outputTokens=message.output_tokens,
    )


def _load_recent_messages(
    session: Session, user_id, limit: int, offset: int = 0
) -> list[ChatMessage]:
    rows = session.scalars(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    return list(reversed(rows))


@router.get(
    '/messages', status_code=HTTPStatus.OK, response_model=ChatMessagesResponse
)
def list_messages(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ChatMessagesResponse:
    messages = _load_recent_messages(session, current_user.id, limit, offset)

    return ChatMessagesResponse(
        messages=[_to_public(message) for message in messages]
    )


@router.post(
    '/messages',
    status_code=HTTPStatus.CREATED,
    response_model=ChatMessagesResponse,
)
async def send_message(
    data: SendChatMessageRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ChatMessagesResponse:
    history = _load_recent_messages(
        session, current_user.id, HISTORY_CONTEXT_LIMIT
    )
    payload = [
        {'role': message.role, 'content': message.content}
        for message in history
    ]
    payload.append({'role': 'user', 'content': data.content})

    try:
        reply = await ai.generate_reply(payload)
    except ai.AiNotConfiguredError:
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=AI_NOT_CONFIGURED_MESSAGE,
        )
    except ai.AiServiceError:
        raise HTTPException(
            status_code=HTTPStatus.BAD_GATEWAY,
            detail=AI_UNAVAILABLE_MESSAGE,
        )

    user_message = ChatMessage(
        user_id=current_user.id, role='user', content=data.content
    )
    assistant_message = ChatMessage(
        user_id=current_user.id,
        role='assistant',
        content=reply.content,
        input_tokens=reply.input_tokens,
        output_tokens=reply.output_tokens,
    )

    session.add(user_message)
    session.add(assistant_message)
    session.commit()
    session.refresh(user_message)
    session.refresh(assistant_message)

    return ChatMessagesResponse(
        messages=[_to_public(user_message), _to_public(assistant_message)]
    )
