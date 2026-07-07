import type { CSSProperties } from "react";

import {
  SCHEDULE_EVENT_MIN_WIDTH_PERCENT,
  SCHEDULE_TIMELINE_BOTTOM_PADDING,
  SCHEDULE_TIMELINE_EVENT_TOP,
  SCHEDULE_TIMELINE_LANE_HEIGHT,
} from "../constants/schedule";
import type {
  PositionedScheduleEvent,
  ScheduleEvent,
  SchedulePeriod,
} from "../types/schedule";

import {
  getMinutesFromHour,
  sortScheduleEvents,
} from "./schedule-time";

export function getPositionedScheduleEvents(
  events: ScheduleEvent[],
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
): PositionedScheduleEvent[] {
  const laneEndMinutes: number[] = [];

  return sortScheduleEvents(events).map((event) => {
    const eventStart = event.startMinutes;
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
  timeMinutes: number,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  const periodStart = getMinutesFromHour(period.startHour);
  const periodEnd = getMinutesFromHour(period.endHour);
  const periodDuration = periodEnd - periodStart;
  const position = ((timeMinutes - periodStart) / periodDuration) * 100;

  return Math.min(Math.max(position, 0), 100);
}

export function getScheduleEventPosition(
  event: ScheduleEvent,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
  lane = 0,
): CSSProperties {
  const left = getScheduleTimePosition(event.startMinutes, period);
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
  const left = getScheduleTimePosition(event.startMinutes, period);
  const right = getScheduleTimePosition(event.endMinutes, period);
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
  const periodDuration =
    getMinutesFromHour(period.endHour) - getMinutesFromHour(period.startHour);
  const visualDuration =
    (periodDuration * getScheduleEventWidth(event, period)) / 100;

  return Math.max(event.endMinutes, event.startMinutes + visualDuration);
}
