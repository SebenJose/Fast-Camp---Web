import type { SchedulePeriod } from "../types/schedule";
import {
  getPositionedScheduleEvents,
  getScheduleTimePosition,
  getScheduleTimelineHeight,
} from "../utils/schedule-positioning";

import { ScheduleEventCard } from "./ScheduleEventCard";

type ScheduleTimelineProps = {
  period: SchedulePeriod;
  currentDate: Date;
  onOpenEvent: (eventId: string) => void;
};

export function ScheduleTimeline({
  period,
  currentDate,
  onOpenEvent,
}: ScheduleTimelineProps) {
  const positionedEvents = getPositionedScheduleEvents(period.events, period);
  const laneCount = positionedEvents.length
    ? positionedEvents.reduce(
        (maxLane, positionedEvent) => Math.max(maxLane, positionedEvent.lane),
        0,
      ) + 1
    : 1;
  const timelineHeight = getScheduleTimelineHeight(laneCount);

  return (
    <div className="min-w-0 overflow-x-auto pb-1">
      <div
        className="relative min-w-2xl"
        style={{ height: `${timelineHeight}px` }}
      >
        <div className="absolute inset-x-0 top-4">
          {period.rangeLabels.map((rangeLabel, index) => (
            <span
              key={rangeLabel.label}
              className="absolute text-xs font-bold text-app-muted data-[edge=end]:-translate-x-full"
              data-edge={index === period.rangeLabels.length - 1 ? "end" : null}
              style={{
                left: `${getScheduleTimePosition(rangeLabel.minutes, period)}%`,
              }}
            >
              {rangeLabel.label}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 top-8 h-px bg-app-border" />

        <div className="absolute inset-x-0 bottom-0 top-8">
          {period.rangeLabels.map((rangeLabel) => (
            <span
              key={rangeLabel.label}
              className="absolute bottom-0 top-0 border-l border-app-border/70"
              style={{
                left: `${getScheduleTimePosition(rangeLabel.minutes, period)}%`,
              }}
            />
          ))}
        </div>

        {positionedEvents.map(({ event, lane }) => (
          <ScheduleEventCard
            key={event.id}
            event={event}
            period={period}
            currentDate={currentDate}
            lane={lane}
            onOpenChange={onOpenEvent}
          />
        ))}
      </div>
    </div>
  );
}
