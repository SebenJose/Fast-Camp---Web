from datetime import datetime, timedelta, timezone, tzinfo
from http import HTTPStatus
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.models import (
    ChatMessage,
    Schedule,
    ScheduleEvent,
    User,
    utcnow,
)
from organiza_ia_api.schemas import (
    DailyInteractionPoint,
    MetricsPublic,
    MetricsResponse,
    WeeklyTaskPoint,
    WeeklyTokensPublic,
)
from organiza_ia_api.security import get_current_user
from organiza_ia_api.settings import get_settings

router = APIRouter(prefix='/api/metrics', tags=['metrics'])

WEEKDAY_LABELS = ('Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb')

# Mensagens com intervalo até este teto contam como uma mesma sessão de
# uso da IA; o "tempo ativo" é a soma desses intervalos.
AI_SESSION_MAX_GAP = timedelta(minutes=5)

AI_TIME_WINDOW = timedelta(days=30)


def _metrics_zone() -> tzinfo:
    try:
        return ZoneInfo(get_settings().METRICS_TIMEZONE)
    except ZoneInfoNotFoundError:
        return timezone.utc


def _to_local(moment: datetime, zone: tzinfo) -> datetime:
    return moment.replace(tzinfo=timezone.utc).astimezone(zone)


def _week_start_utc(now_local: datetime) -> datetime:
    days_since_sunday = (now_local.weekday() + 1) % 7
    start_local = now_local.replace(
        hour=0, minute=0, second=0, microsecond=0
    ) - timedelta(days=days_since_sunday)
    return start_local.astimezone(timezone.utc).replace(tzinfo=None)


def _weekday_index(local_moment: datetime) -> int:
    return (local_moment.weekday() + 1) % 7


def _compute_ai_minutes(timestamps: list[datetime]) -> int:
    total = timedelta()

    for previous, current in zip(timestamps, timestamps[1:]):
        gap = current - previous
        if gap <= AI_SESSION_MAX_GAP:
            total += gap

    return int(total.total_seconds() // 60)


@router.get('', status_code=HTTPStatus.OK, response_model=MetricsResponse)
def get_metrics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> MetricsResponse:
    zone = _metrics_zone()
    week_start = _week_start_utc(_to_local(utcnow(), zone))
    owns_message = ChatMessage.user_id == current_user.id

    total_messages = session.scalar(
        select(func.count()).select_from(ChatMessage).where(owns_message)
    )
    total_tokens = session.scalar(
        select(
            func.coalesce(
                func.sum(ChatMessage.input_tokens + ChatMessage.output_tokens),
                0,
            )
        ).where(owns_message)
    )
    completed_tasks = session.scalar(
        select(func.count())
        .select_from(ScheduleEvent)
        .join(Schedule, ScheduleEvent.schedule_id == Schedule.id)
        .where(Schedule.user_id == current_user.id, ScheduleEvent.completed)
    )

    timestamps = session.scalars(
        select(ChatMessage.created_at)
        .where(
            owns_message,
            ChatMessage.created_at >= utcnow() - AI_TIME_WINDOW,
        )
        .order_by(ChatMessage.created_at)
    ).all()

    weekly_tokens_used = 0
    interactions_by_day = [0] * 7
    weekly_messages = session.execute(
        select(
            ChatMessage.created_at,
            ChatMessage.role,
            ChatMessage.input_tokens + ChatMessage.output_tokens,
        ).where(owns_message, ChatMessage.created_at >= week_start)
    ).all()

    for created_at, role, tokens in weekly_messages:
        weekly_tokens_used += tokens
        if role == 'user':
            day = _weekday_index(_to_local(created_at, zone))
            interactions_by_day[day] += 1

    completed_by_day = [0] * 7
    pending_by_day = [0] * 7
    weekly_events = session.execute(
        select(
            ScheduleEvent.created_at,
            ScheduleEvent.completed,
            ScheduleEvent.completed_at,
        )
        .join(Schedule, ScheduleEvent.schedule_id == Schedule.id)
        .where(
            Schedule.user_id == current_user.id,
            or_(
                ScheduleEvent.created_at >= week_start,
                ScheduleEvent.completed_at >= week_start,
            ),
        )
    ).all()

    for created_at, completed, completed_at in weekly_events:
        if completed:
            moment = completed_at or created_at
            if moment >= week_start:
                day = _weekday_index(_to_local(moment, zone))
                completed_by_day[day] += 1
        elif created_at >= week_start:
            day = _weekday_index(_to_local(created_at, zone))
            pending_by_day[day] += 1

    return MetricsResponse(
        metrics=MetricsPublic(
            totalMessages=total_messages,
            totalTokens=total_tokens,
            completedTasks=completed_tasks,
            aiTimeMinutes=_compute_ai_minutes(list(timestamps)),
            weeklyTokens=WeeklyTokensPublic(
                used=weekly_tokens_used,
                limit=get_settings().TOKEN_WEEKLY_LIMIT,
            ),
            weeklyTasks=[
                WeeklyTaskPoint(
                    day=WEEKDAY_LABELS[day],
                    completed=completed_by_day[day],
                    pending=pending_by_day[day],
                )
                for day in range(7)
            ],
            dailyInteractions=[
                DailyInteractionPoint(
                    day=WEEKDAY_LABELS[day],
                    interactions=interactions_by_day[day],
                )
                for day in range(7)
            ],
        )
    )
