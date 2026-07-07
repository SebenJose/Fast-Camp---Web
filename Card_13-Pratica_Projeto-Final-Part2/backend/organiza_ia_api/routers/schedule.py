from http import HTTPStatus
from typing import NamedTuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from organiza_ia_api.database import get_session
from organiza_ia_api.models import Schedule, ScheduleEvent, User
from organiza_ia_api.schemas import (
    CreateScheduleEventRequest,
    ScheduleDayRange,
    ScheduleEventPublic,
    SchedulePublic,
    ScheduleResponse,
    ToggleEventRequest,
    UpdateDayRangeRequest,
    time_to_minutes,
)
from organiza_ia_api.security import get_current_user

router = APIRouter(prefix='/api/schedule', tags=['schedule'])


class _Period(NamedTuple):
    id: str
    start_minutes: int
    end_minutes: int


# Períodos fixos que espelham os do frontend. A ordem define tanto a
# atribuição de período ao criar eventos quanto as chaves do response.
_PERIODS: tuple[_Period, ...] = (
    _Period('morning', 6 * 60, 12 * 60),
    _Period('lunch', 12 * 60, 13 * 60),
    _Period('afternoon', 13 * 60, 18 * 60),
    _Period('night', 18 * 60, 22 * 60),
)


def _get_period_id(start_minutes: int) -> str | None:
    for period in _PERIODS:
        if period.start_minutes <= start_minutes < period.end_minutes:
            return period.id
    return None


def _get_or_create_schedule(session: Session, user_id: UUID) -> Schedule:
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


def _build_schedule_public(
    session: Session, schedule: Schedule
) -> SchedulePublic:
    events = session.scalars(
        select(ScheduleEvent)
        .where(ScheduleEvent.schedule_id == schedule.id)
        .order_by(ScheduleEvent.start_minutes)
    ).all()

    events_by_period: dict[str, list[ScheduleEventPublic]] = {
        period.id: [] for period in _PERIODS
    }
    for event in events:
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


def _get_owned_event(
    session: Session, schedule: Schedule, event_id: UUID
) -> ScheduleEvent:
    event = session.scalar(
        select(ScheduleEvent).where(
            ScheduleEvent.id == event_id,
            ScheduleEvent.schedule_id == schedule.id,
        )
    )

    if not event:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Card não encontrado.',
        )

    return event


@router.get('', status_code=HTTPStatus.OK, response_model=ScheduleResponse)
def get_schedule(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = _get_or_create_schedule(session, current_user.id)
    return ScheduleResponse(schedule=_build_schedule_public(session, schedule))


@router.patch(
    '/day-range', status_code=HTTPStatus.OK, response_model=ScheduleResponse
)
def update_day_range(
    data: UpdateDayRangeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = _get_or_create_schedule(session, current_user.id)
    schedule.day_range_start_minutes = data.dayRange.startMinutes
    schedule.day_range_end_minutes = data.dayRange.endMinutes
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    return ScheduleResponse(schedule=_build_schedule_public(session, schedule))


@router.post(
    '/events', status_code=HTTPStatus.CREATED, response_model=ScheduleResponse
)
def create_event(
    data: CreateScheduleEventRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = _get_or_create_schedule(session, current_user.id)

    start_minutes = time_to_minutes(data.event.startTime)
    end_minutes = time_to_minutes(data.event.endTime)

    if (
        start_minutes < schedule.day_range_start_minutes
        or end_minutes > schedule.day_range_end_minutes
    ):
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Esse horário está fora do intervalo visível do dia.',
        )

    period_id = _get_period_id(start_minutes)
    if not period_id:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=(
                'Esse horário está fora dos períodos da agenda '
                '(06:00 às 22:00).'
            ),
        )

    event = ScheduleEvent(
        schedule_id=schedule.id,
        period_id=period_id,
        title=data.event.title,
        start_minutes=start_minutes,
        end_minutes=end_minutes,
        tone=data.event.tone,
    )
    session.add(event)
    session.commit()

    return ScheduleResponse(schedule=_build_schedule_public(session, schedule))


@router.delete(
    '/events/{event_id}',
    status_code=HTTPStatus.OK,
    response_model=ScheduleResponse,
)
def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = _get_or_create_schedule(session, current_user.id)
    event = _get_owned_event(session, schedule, event_id)

    session.delete(event)
    session.commit()

    return ScheduleResponse(schedule=_build_schedule_public(session, schedule))


@router.patch(
    '/events/{event_id}/completed',
    status_code=HTTPStatus.OK,
    response_model=ScheduleResponse,
)
def toggle_event_completed(
    event_id: UUID,
    data: ToggleEventRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = _get_or_create_schedule(session, current_user.id)
    event = _get_owned_event(session, schedule, event_id)

    event.completed = not event.completed
    session.add(event)
    session.commit()

    return ScheduleResponse(schedule=_build_schedule_public(session, schedule))
