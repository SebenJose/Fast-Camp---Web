from typing import NamedTuple
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from organiza_ia_api.models import Schedule, ScheduleEvent
from organiza_ia_api.schemas import (
    ScheduleDayRange,
    ScheduleEventFormValues,
    ScheduleEventPublic,
    SchedulePublic,
    time_to_minutes,
)


class Period(NamedTuple):
    id: str
    start_minutes: int
    end_minutes: int


# Períodos fixos que espelham os do frontend. A ordem define tanto a
# atribuição de período ao criar eventos quanto as chaves do response.
PERIODS: tuple[Period, ...] = (
    Period('morning', 6 * 60, 12 * 60),
    Period('lunch', 12 * 60, 13 * 60),
    Period('afternoon', 13 * 60, 18 * 60),
    Period('night', 18 * 60, 22 * 60),
)


class ScheduleEventError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def get_period_id(start_minutes: int) -> str | None:
    for period in PERIODS:
        if period.start_minutes <= start_minutes < period.end_minutes:
            return period.id
    return None


def get_or_create_schedule(session: Session, user_id: UUID) -> Schedule:
    schedule = session.scalar(
        select(Schedule).where(Schedule.user_id == user_id)
    )

    if schedule:
        return schedule

    schedule = Schedule(user_id=user_id)
    session.add(schedule)

    try:
        session.commit()
        session.refresh(schedule)
    except IntegrityError:
        # Outro request do mesmo usuário criou a agenda entre o SELECT e o
        # INSERT (user_id é UNIQUE): usa a que já existe.
        session.rollback()
        schedule = session.scalar(
            select(Schedule).where(Schedule.user_id == user_id)
        )

        if not schedule:
            # A transação concorrente sofreu rollback depois de causar o
            # conflito: não há agenda para reaproveitar, então propaga o
            # erro original em vez de devolver None como se fosse Schedule.
            raise

    return schedule


def build_schedule_public(
    session: Session, schedule: Schedule
) -> SchedulePublic:
    events = session.scalars(
        select(ScheduleEvent)
        .where(ScheduleEvent.schedule_id == schedule.id)
        .order_by(ScheduleEvent.start_minutes)
    ).all()

    events_by_period: dict[str, list[ScheduleEventPublic]] = {
        period.id: [] for period in PERIODS
    }
    for event in events:
        if (
            event.start_minutes < schedule.day_range_start_minutes
            or event.end_minutes > schedule.day_range_end_minutes
        ):
            continue

        if event.period_id in events_by_period:
            events_by_period[event.period_id].append(
                ScheduleEventPublic(
                    id=str(event.id),
                    title=event.title,
                    tone=event.tone,
                    completed=event.completed,
                    startMinutes=event.start_minutes,
                    endMinutes=event.end_minutes,
                )
            )

    return SchedulePublic(
        dayRange=ScheduleDayRange(
            startMinutes=schedule.day_range_start_minutes,
            endMinutes=schedule.day_range_end_minutes,
        ),
        eventsByPeriodId=events_by_period,
    )


def find_owned_event(
    session: Session, schedule: Schedule, event_id: UUID
) -> ScheduleEvent | None:
    return session.scalar(
        select(ScheduleEvent).where(
            ScheduleEvent.id == event_id,
            ScheduleEvent.schedule_id == schedule.id,
        )
    )


def _resolve_period_id(
    schedule: Schedule, start_minutes: int, end_minutes: int
) -> str:
    if (
        start_minutes < schedule.day_range_start_minutes
        or end_minutes > schedule.day_range_end_minutes
    ):
        raise ScheduleEventError(
            'Esse horário está fora do intervalo visível do dia.'
        )

    period_id = get_period_id(start_minutes)
    if not period_id:
        raise ScheduleEventError(
            'Esse horário está fora dos períodos da agenda (06:00 às 22:00).'
        )

    return period_id


def create_schedule_event(
    session: Session, schedule: Schedule, event: ScheduleEventFormValues
) -> ScheduleEvent:
    """Valida e adiciona um evento à sessão, sem commit (fica com o caller)."""
    start_minutes = time_to_minutes(event.startTime)
    end_minutes = time_to_minutes(event.endTime)
    period_id = _resolve_period_id(schedule, start_minutes, end_minutes)

    new_event = ScheduleEvent(
        schedule_id=schedule.id,
        period_id=period_id,
        title=event.title,
        start_minutes=start_minutes,
        end_minutes=end_minutes,
        tone=event.tone,
    )
    session.add(new_event)

    return new_event


def update_schedule_event(
    session: Session,
    schedule: Schedule,
    event: ScheduleEvent,
    values: ScheduleEventFormValues,
) -> ScheduleEvent:
    """Valida e atualiza um evento na sessão, sem commit (fica com o caller)."""
    start_minutes = time_to_minutes(values.startTime)
    end_minutes = time_to_minutes(values.endTime)

    event.period_id = _resolve_period_id(schedule, start_minutes, end_minutes)
    event.title = values.title
    event.start_minutes = start_minutes
    event.end_minutes = end_minutes
    event.tone = values.tone
    session.add(event)

    return event
