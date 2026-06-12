import type { CSSProperties } from "react";

import {
  SCHEDULE_EVENT_MIN_WIDTH_PERCENT,
  SCHEDULE_TIMELINE_BOTTOM_PADDING,
  SCHEDULE_TIMELINE_EVENT_TOP,
  SCHEDULE_TIMELINE_LANE_HEIGHT,
} from "../constants/schedule";
import type {
  PositionedScheduleEvent,
  ScheduleDayRange,
  ScheduleEvent,
  SchedulePeriod,
} from "../types/schedule";

export function getScheduleEventTimeLabel(event: ScheduleEvent) {
  return `${event.startTime} - ${event.endTime}`;
}

export function getMinutesFromTime(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
}

export function getMinutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function getTimeFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function sortScheduleEvents(events: ScheduleEvent[]) {
  return [...events].sort(
    (currentEvent, nextEvent) =>
      getMinutesFromTime(currentEvent.startTime) -
        getMinutesFromTime(nextEvent.startTime) ||
      getMinutesFromTime(currentEvent.endTime) -
        getMinutesFromTime(nextEvent.endTime),
  );
}

export function getScheduleRangeLabels(startMinutes: number, endMinutes: number) {
  const labels = [getTimeFromMinutes(startMinutes)];
  const labelStepMinutes = 120;
  const nextStep =
    Math.ceil(startMinutes / labelStepMinutes) * labelStepMinutes;

  for (
    let labelMinutes = nextStep;
    labelMinutes < endMinutes;
    labelMinutes += labelStepMinutes
  ) {
    if (labelMinutes > startMinutes) {
      labels.push(getTimeFromMinutes(labelMinutes));
    }
  }

  labels.push(getTimeFromMinutes(endMinutes));

  return Array.from(new Set(labels));
}

export function getVisibleSchedulePeriods(
  periods: SchedulePeriod[],
  dayRange: ScheduleDayRange,
) {
  const dayStart = getMinutesFromTime(dayRange.startTime);
  const dayEnd = getMinutesFromTime(dayRange.endTime);

  if (dayEnd <= dayStart || periods.length === 0) {
    return [];
  }

  const sortedPeriods = [...periods].sort(
    (currentPeriod, nextPeriod) =>
      currentPeriod.startHour - nextPeriod.startHour,
  );
  const firstPeriod = sortedPeriods[0];
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];

  if (dayEnd <= firstPeriod.startHour * 60) {
    return [
      getVisibleSchedulePeriod(firstPeriod, dayStart, dayEnd),
    ];
  }

  if (dayStart >= lastPeriod.endHour * 60) {
    return [
      getVisibleSchedulePeriod(lastPeriod, dayStart, dayEnd),
    ];
  }

  return sortedPeriods.flatMap((period, index) => {
    const periodStart = period.startHour * 60;
    const periodEnd = period.endHour * 60;
    const isFirstPeriod = index === 0;
    const isLastPeriod = index === sortedPeriods.length - 1;
    const visibleStart = isFirstPeriod
      ? Math.min(dayStart, periodEnd)
      : Math.max(periodStart, dayStart);
    const visibleEnd = isLastPeriod
      ? Math.max(dayEnd, periodStart)
      : Math.min(periodEnd, dayEnd);

    if (visibleEnd <= visibleStart) {
      return [];
    }

    return getVisibleSchedulePeriod(period, visibleStart, visibleEnd);
  });
}

function getVisibleSchedulePeriod(
  period: SchedulePeriod,
  visibleStart: number,
  visibleEnd: number,
) {
  return {
    ...period,
    startHour: visibleStart / 60,
    endHour: visibleEnd / 60,
    rangeLabels: getScheduleRangeLabels(visibleStart, visibleEnd),
    events: period.events.filter((event) =>
      isEventInsidePeriod(event, {
        startHour: visibleStart / 60,
        endHour: visibleEnd / 60,
      }),
    ),
  };
}

export function getPositionedScheduleEvents(
  events: ScheduleEvent[],
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
): PositionedScheduleEvent[] {
  const laneEndMinutes: number[] = [];

  return sortScheduleEvents(events).map((event) => {
    const eventStart = getMinutesFromTime(event.startTime);
    const eventEnd = getScheduleEventVisualEndMinutes(event, period);
    const availableLane = laneEndMinutes.findIndex(
      (laneEnd) => laneEnd <= eventStart,
    );
    const lane = availableLane >= 0 ? availableLane : laneEndMinutes.length;

    laneEndMinutes[lane] = eventEnd;

    return {
      event,
      lane,
    };
  });
}

export function getScheduleTimelineHeight(laneCount: number) {
  return (
    SCHEDULE_TIMELINE_EVENT_TOP +
    Math.max(laneCount, 1) * SCHEDULE_TIMELINE_LANE_HEIGHT +
    SCHEDULE_TIMELINE_BOTTOM_PADDING
  );
}

export function getScheduleTimePosition(
  time: string,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  const periodStart = period.startHour * 60;
  const periodEnd = period.endHour * 60;
  const periodDuration = periodEnd - periodStart;
  const timeMinutes = getMinutesFromTime(time);
  const position = ((timeMinutes - periodStart) / periodDuration) * 100;

  return Math.min(Math.max(position, 0), 100);
}

export function getScheduleEventPosition(
  event: ScheduleEvent,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
  lane = 0,
): CSSProperties {
  const left = getScheduleTimePosition(event.startTime, period);
  const width = getScheduleEventWidth(event, period);

  return {
    top: `${SCHEDULE_TIMELINE_EVENT_TOP + lane * SCHEDULE_TIMELINE_LANE_HEIGHT}px`,
    left: `${left}%`,
    width: `${width}%`,
  };
}

function getScheduleEventWidth(
  event: ScheduleEvent,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  const left = getScheduleTimePosition(event.startTime, period);
  const right = getScheduleTimePosition(event.endTime, period);
  const eventWidth = right - left;
  const remainingWidth = 100 - Math.max(left, 0);

  return Math.min(
    Math.max(eventWidth, SCHEDULE_EVENT_MIN_WIDTH_PERCENT),
    remainingWidth,
  );
}

function getScheduleEventVisualEndMinutes(
  event: ScheduleEvent,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  const eventStart = getMinutesFromTime(event.startTime);
  const eventEnd = getMinutesFromTime(event.endTime);
  const periodDuration = period.endHour * 60 - period.startHour * 60;
  const visualDuration =
    (periodDuration * getScheduleEventWidth(event, period)) / 100;

  return Math.max(eventEnd, eventStart + visualDuration);
}

export function isEventInsidePeriod(
  event: Pick<ScheduleEvent, "startTime" | "endTime">,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  const periodStart = period.startHour * 60;
  const periodEnd = period.endHour * 60;
  const eventStart = getMinutesFromTime(event.startTime);
  const eventEnd = getMinutesFromTime(event.endTime);

  return (
    eventEnd > eventStart &&
    eventStart >= periodStart &&
    eventEnd <= periodEnd
  );
}

export function getNextScheduleEvent(
  events: ScheduleEvent[],
  currentDate: Date,
) {
  const currentMinutes = getMinutesFromDate(currentDate);

  return sortScheduleEvents(events).find(
    (event) =>
      !event.completed && getMinutesFromTime(event.startTime) >= currentMinutes,
  );
}

export function isScheduleEventMissed(event: ScheduleEvent, currentDate: Date) {
  return (
    !event.completed &&
    getMinutesFromTime(event.endTime) < getMinutesFromDate(currentDate)
  );
}
