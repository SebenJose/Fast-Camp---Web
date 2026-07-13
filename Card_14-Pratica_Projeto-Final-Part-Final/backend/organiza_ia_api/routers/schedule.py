from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from organiza_ia_api import schedule_service
from organiza_ia_api.database import get_session
from organiza_ia_api.models import Schedule, ScheduleEvent, User, utcnow
from organiza_ia_api.schemas import (
    CreateScheduleEventRequest,
    ScheduleResponse,
    ToggleEventRequest,
    UpdateDayRangeRequest,
)
from organiza_ia_api.security import get_current_user

router = APIRouter(prefix='/api/schedule', tags=['schedule'])


def _get_owned_event(
    session: Session, schedule: Schedule, event_id: UUID
) -> ScheduleEvent:
    event = schedule_service.find_owned_event(session, schedule, event_id)

    if not event:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Card não encontrado.',
        )

    return event


def _build_response(session: Session, schedule: Schedule) -> ScheduleResponse:
    return ScheduleResponse(
        schedule=schedule_service.build_schedule_public(session, schedule)
    )


@router.get('', status_code=HTTPStatus.OK, response_model=ScheduleResponse)
def get_schedule(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = schedule_service.get_or_create_schedule(
        session, current_user.id
    )
    return _build_response(session, schedule)


@router.patch(
    '/day-range', status_code=HTTPStatus.OK, response_model=ScheduleResponse
)
def update_day_range(
    data: UpdateDayRangeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = schedule_service.get_or_create_schedule(
        session, current_user.id
    )
    schedule.day_range_start_minutes = data.dayRange.startMinutes
    schedule.day_range_end_minutes = data.dayRange.endMinutes
    session.add(schedule)
    session.commit()
    session.refresh(schedule)
    return _build_response(session, schedule)


@router.post(
    '/events', status_code=HTTPStatus.CREATED, response_model=ScheduleResponse
)
def create_event(
    data: CreateScheduleEventRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ScheduleResponse:
    schedule = schedule_service.get_or_create_schedule(
        session, current_user.id
    )

    try:
        schedule_service.create_schedule_event(session, schedule, data.event)
    except schedule_service.ScheduleEventError as error:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST, detail=error.message
        )

    session.commit()

    return _build_response(session, schedule)


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
    schedule = schedule_service.get_or_create_schedule(
        session, current_user.id
    )
    event = _get_owned_event(session, schedule, event_id)

    session.delete(event)
    session.commit()

    return _build_response(session, schedule)


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
    schedule = schedule_service.get_or_create_schedule(
        session, current_user.id
    )
    event = _get_owned_event(session, schedule, event_id)

    event.completed = not event.completed
    event.completed_at = utcnow() if event.completed else None
    session.add(event)
    session.commit()

    return _build_response(session, schedule)
