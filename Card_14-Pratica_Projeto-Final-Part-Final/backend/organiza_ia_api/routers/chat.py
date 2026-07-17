import asyncio
from datetime import timedelta
from http import HTTPStatus
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from organiza_ia_api import ai, billing_service, schedule_service
from organiza_ia_api.database import get_session
from organiza_ia_api.models import ChatMessage, Schedule, User, utcnow
from organiza_ia_api.schemas import (
    SCHEDULE_TIME_PATTERN,
    ChatMessagePublic,
    ChatMessagesResponse,
    ScheduleDayRange,
    ScheduleEventFormValues,
    SendChatMessageRequest,
    time_to_minutes,
    utc_isoformat,
)
from organiza_ia_api.security import get_current_user
from organiza_ia_api.settings import get_settings

router = APIRouter(prefix='/api/chat', tags=['chat'])

HISTORY_CONTEXT_LIMIT = 20

# Cada mensagem dispara chamadas reais à LLM (custo/quota); o teto por
# janela barra rajadas de script sem atrapalhar quem digita.
RATE_LIMIT_MAX_MESSAGES = 10
RATE_LIMIT_WINDOW = timedelta(minutes=1)

AI_NOT_CONFIGURED_MESSAGE = (
    'O serviço de IA ainda não está configurado no servidor.'
)
AI_UNAVAILABLE_MESSAGE = (
    'Não foi possível obter a resposta da IA agora. '
    'Tente novamente em instantes.'
)
BALANCE_EMPTY_MESSAGE = (
    'Seu saldo de tokens acabou. Recarregue para continuar conversando.'
)
RATE_LIMITED_MESSAGE = (
    'Muitas mensagens em pouco tempo. '
    'Aguarde um instante antes de enviar de novo.'
)


def _to_public(message: ChatMessage) -> ChatMessagePublic:
    return ChatMessagePublic(
        id=str(message.id),
        role=message.role,
        content=message.content,
        createdAt=utc_isoformat(message.created_at),
        inputTokens=message.input_tokens,
        outputTokens=message.output_tokens,
    )


def _minutes_to_time(minutes: int) -> str:
    return f'{minutes // 60:02d}:{minutes % 60:02d}'


def _parse_event_id(value: Any) -> UUID | None:
    try:
        return UUID(str(value))
    except (TypeError, ValueError):
        return None


def _first_validation_message(error: ValidationError) -> str:
    message: str = error.errors()[0]['msg']
    return message.removeprefix('Value error, ')


def _tool_create_event(
    session: Session, schedule: Schedule, arguments: dict[str, Any]
) -> dict[str, Any]:
    try:
        values = ScheduleEventFormValues(
            title=str(arguments.get('title') or ''),
            startTime=str(arguments.get('startTime') or ''),
            endTime=str(arguments.get('endTime') or ''),
            tone=str(arguments.get('tone') or 'sky'),
        )
        event = schedule_service.create_schedule_event(
            session, schedule, values
        )
    except ValidationError as error:
        return {'error': _first_validation_message(error)}
    except schedule_service.ScheduleEventError as error:
        return {'error': error.message}

    # flush (sem commit): o card só é gravado de fato junto com as
    # mensagens e o débito, no commit final do envio.
    session.flush()

    return {
        'ok': True,
        'event': {
            'title': event.title,
            'startTime': values.startTime,
            'endTime': values.endTime,
            'period': event.period_id,
        },
    }


def _tool_list_events(
    session: Session, schedule: Schedule, arguments: dict[str, Any]
) -> dict[str, Any]:
    return schedule_service.build_schedule_public(
        session, schedule
    ).model_dump()


def _tool_update_event(
    session: Session, schedule: Schedule, arguments: dict[str, Any]
) -> dict[str, Any]:
    event_id = _parse_event_id(arguments.get('eventId'))
    if event_id is None:
        return {'error': 'Informe o id do card a editar.'}

    event = schedule_service.find_owned_event(session, schedule, event_id)
    if not event:
        return {'error': 'Card não encontrado.'}

    # Campos omitidos mantêm o valor atual do card.
    title = arguments.get('title')
    start_time = arguments.get('startTime')
    end_time = arguments.get('endTime')
    tone = arguments.get('tone')
    try:
        values = ScheduleEventFormValues(
            title=str(event.title if title is None else title),
            startTime=str(
                _minutes_to_time(event.start_minutes)
                if start_time is None
                else start_time
            ),
            endTime=str(
                _minutes_to_time(event.end_minutes)
                if end_time is None
                else end_time
            ),
            tone=str(tone or event.tone or 'sky'),
        )
        schedule_service.update_schedule_event(
            session, schedule, event, values
        )
    except ValidationError as error:
        return {'error': _first_validation_message(error)}
    except schedule_service.ScheduleEventError as error:
        return {'error': error.message}

    session.flush()

    return {
        'ok': True,
        'event': {
            'id': str(event.id),
            'title': event.title,
            'startTime': values.startTime,
            'endTime': values.endTime,
            'period': event.period_id,
        },
    }


def _tool_delete_event(
    session: Session, schedule: Schedule, arguments: dict[str, Any]
) -> dict[str, Any]:
    event_id = _parse_event_id(arguments.get('eventId'))
    if event_id is None:
        return {'error': 'Informe o id do card a excluir.'}

    event = schedule_service.find_owned_event(session, schedule, event_id)
    if not event:
        return {'error': 'Card não encontrado.'}

    title = event.title
    session.delete(event)
    session.flush()

    return {'ok': True, 'deleted': {'id': str(event_id), 'title': title}}


def _tool_set_day_range(
    session: Session, schedule: Schedule, arguments: dict[str, Any]
) -> dict[str, Any]:
    start = str(arguments.get('startTime') or '')
    end = str(arguments.get('endTime') or '')
    if not (
        SCHEDULE_TIME_PATTERN.match(start) and SCHEDULE_TIME_PATTERN.match(end)
    ):
        return {'error': 'Informe os horários no formato HH:mm.'}

    try:
        day_range = ScheduleDayRange(
            startMinutes=time_to_minutes(start),
            endMinutes=time_to_minutes(end),
        )
    except ValidationError as error:
        return {'error': _first_validation_message(error)}

    schedule.day_range_start_minutes = day_range.startMinutes
    schedule.day_range_end_minutes = day_range.endMinutes
    session.add(schedule)
    session.flush()

    return {'ok': True, 'dayRange': {'startTime': start, 'endTime': end}}


_TOOL_HANDLERS = {
    'create_schedule_event': _tool_create_event,
    'list_schedule_events': _tool_list_events,
    'update_schedule_event': _tool_update_event,
    'delete_schedule_event': _tool_delete_event,
    'set_day_range': _tool_set_day_range,
}


def _build_tool_executor(
    session: Session, schedule: Schedule
) -> ai.ToolExecutor:
    def execute_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        handler = _TOOL_HANDLERS.get(name)
        if not handler:
            return {'error': 'Ferramenta desconhecida.'}

        return handler(session, schedule, arguments)

    return execute_tool


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


def _prepare_conversation(
    session: Session, user_id, content: str
) -> tuple[Schedule, list[dict[str, Any]], ChatMessagePublic]:
    schedule = schedule_service.get_or_create_schedule(session, user_id)

    balance = session.scalar(
        select(User.token_balance).where(User.id == user_id)
    )

    if balance <= 0:
        session.rollback()
        raise HTTPException(
            status_code=HTTPStatus.PAYMENT_REQUIRED,
            detail=BALANCE_EMPTY_MESSAGE,
        )

    recent_messages = session.scalar(
        select(func.count())
        .select_from(ChatMessage)
        .where(
            ChatMessage.user_id == user_id,
            ChatMessage.role == 'user',
            ChatMessage.created_at >= utcnow() - RATE_LIMIT_WINDOW,
        )
    )
    if recent_messages >= RATE_LIMIT_MAX_MESSAGES:
        session.rollback()
        raise HTTPException(
            status_code=HTTPStatus.TOO_MANY_REQUESTS,
            detail=RATE_LIMITED_MESSAGE,
        )

    history = _load_recent_messages(session, user_id, HISTORY_CONTEXT_LIMIT)
    day_range_note = (
        'Intervalo visível do dia deste usuário: '
        f'{_minutes_to_time(schedule.day_range_start_minutes)} às '
        f'{_minutes_to_time(schedule.day_range_end_minutes)}.'
    )
    payload = [{'role': 'system', 'content': day_range_note}]
    payload.extend(
        {'role': message.role, 'content': message.content}
        for message in history
    )
    payload.append({'role': 'user', 'content': content})

    user_message = ChatMessage(user_id=user_id, role='user', content=content)
    session.add(user_message)
    session.flush()

    return schedule, payload, _to_public(user_message)


def _persist_reply(
    session: Session, user_id, reply: ai.AiReply
) -> tuple[ChatMessagePublic, int]:
    assistant_message = ChatMessage(
        user_id=user_id,
        role='assistant',
        content=reply.content,
        input_tokens=reply.input_tokens,
        output_tokens=reply.output_tokens,
    )
    session.add(assistant_message)

    cost = reply.input_tokens + reply.output_tokens
    balance = billing_service.debit_tokens(session, user_id, cost)

    session.flush()
    assistant_public = _to_public(assistant_message)
    session.commit()

    return assistant_public, balance


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
    schedule, payload, user_public = await asyncio.to_thread(
        _prepare_conversation, session, current_user.id, data.content
    )

    try:
        reply = await asyncio.wait_for(
            ai.generate_reply(
                payload, _build_tool_executor(session, schedule)
            ),
            timeout=get_settings().AI_TOTAL_TIMEOUT_SECONDS,
        )
    except TimeoutError:
        await asyncio.to_thread(session.rollback)
        raise HTTPException(
            status_code=HTTPStatus.BAD_GATEWAY,
            detail=AI_UNAVAILABLE_MESSAGE,
        )
    except ai.AiNotConfiguredError:
        await asyncio.to_thread(session.rollback)
        raise HTTPException(
            status_code=HTTPStatus.SERVICE_UNAVAILABLE,
            detail=AI_NOT_CONFIGURED_MESSAGE,
        )
    except ai.AiServiceError:
        await asyncio.to_thread(session.rollback)
        raise HTTPException(
            status_code=HTTPStatus.BAD_GATEWAY,
            detail=AI_UNAVAILABLE_MESSAGE,
        )

    assistant_public, balance = await asyncio.to_thread(
        _persist_reply, session, current_user.id, reply
    )

    return ChatMessagesResponse(
        messages=[user_public, assistant_public],
        balance=balance,
        scheduleUpdated=reply.tools_executed,
    )
