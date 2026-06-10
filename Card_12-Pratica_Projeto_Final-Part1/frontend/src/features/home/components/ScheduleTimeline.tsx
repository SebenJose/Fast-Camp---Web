import type { SchedulePeriod } from "../types/schedule";
import {
  getPositionedScheduleEvents,
  getScheduleTimePosition,
  getScheduleTimelineHeight,
} from "../utils/schedule-time";

import { ScheduleEventCard } from "./ScheduleEventCard";

type ScheduleTimelineProps = {
  period: SchedulePeriod;
  openEventId: string | null;
  onOpenEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleEventCompleted: (eventId: string) => void;
};

export function ScheduleTimeline({
  period,
  openEventId,
  onOpenEvent,
  onDeleteEvent,
  onToggleEventCompleted,
}: ScheduleTimelineProps) {
  const positionedEvents = getPositionedScheduleEvents(period.events);
  const laneCount = positionedEvents.length
    ? Math.max(
        ...positionedEvents.map((positionedEvent) => positionedEvent.lane),
      ) + 1
    : 1;
  const timelineHeight = getScheduleTimelineHeight(laneCount);

  return (
    <div className="min-w-0 overflow-x-auto pb-1">
      <div
        className="relative min-w-[42rem]"
        style={{ height: `${timelineHeight}px` }}
      >
        <div className="absolute inset-x-0 top-4">
          {period.rangeLabels.map((label, index) => (
            <span
              key={label}
              className="absolute text-xs font-bold text-app-muted data-[edge=end]:-translate-x-full"
              data-edge={index === period.rangeLabels.length - 1 ? "end" : null}
              style={{ left: `${getScheduleTimePosition(label, period)}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 top-8 h-px bg-app-border" />

        <div className="absolute inset-x-0 bottom-0 top-8">
          {period.rangeLabels.map((label) => (
            <span
              key={label}
              className="absolute bottom-0 top-0 border-l border-app-border/70"
              style={{ left: `${getScheduleTimePosition(label, period)}%` }}
            />
          ))}
        </div>

        {positionedEvents.map(({ event, lane }) => (
          <ScheduleEventCard
            key={event.id}
            event={event}
            period={period}
            lane={lane}
            isOpen={openEventId === event.id}
            onOpenChange={onOpenEvent}
            onDelete={onDeleteEvent}
            onToggleCompleted={onToggleEventCompleted}
          />
        ))}
      </div>
    </div>
  );
}
