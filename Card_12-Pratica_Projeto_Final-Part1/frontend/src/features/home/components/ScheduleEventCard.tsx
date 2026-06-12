import { CircleCheck, CircleX } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import { SCHEDULE_EVENT_TONE_CLASS_NAMES } from "../constants/schedule";
import type { ScheduleEvent, SchedulePeriod } from "../types/schedule";
import {
  getScheduleEventPosition,
  getScheduleEventTimeLabel,
  isScheduleEventMissed,
} from "../utils/schedule-time";

type ScheduleEventCardProps = {
  event: ScheduleEvent;
  period: SchedulePeriod;
  currentDate: Date;
  lane: number;
  onOpenChange: (eventId: string) => void;
};

export function ScheduleEventCard({
  event,
  period,
  currentDate,
  lane,
  onOpenChange,
}: ScheduleEventCardProps) {
  const eventStyle = getScheduleEventPosition(event, period, lane);
  const eventTone = event.tone ?? "slate";
  const eventTimeLabel = getScheduleEventTimeLabel(event);
  const isMissed = isScheduleEventMissed(event, currentDate);

  return (
    <Card
      className={cn(
        "absolute z-10 min-w-0 gap-0 overflow-hidden rounded-xl border px-3 py-2 text-left text-xs shadow-lg shadow-black/20 ring-0 transition-all",
        SCHEDULE_EVENT_TONE_CLASS_NAMES[eventTone],
        event.completed &&
          "border-schedule-completed-border opacity-75 shadow-schedule-completed-border/20",
        isMissed &&
          "border-schedule-missed-border opacity-80 shadow-schedule-missed-border/20",
      )}
      style={eventStyle}
    >
      <button
        type="button"
        className="w-full text-left outline-none"
        onClick={() => onOpenChange(event.id)}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {event.completed ? (
            <CircleCheck
              size={14}
              className="shrink-0 text-schedule-completed-icon"
              aria-label="Concluído"
            />
          ) : null}

          {isMissed ? (
            <CircleX
              size={14}
              className="shrink-0 text-schedule-missed-icon"
              aria-label="Não feito"
            />
          ) : null}

          <span
            className={cn(
              "min-w-0 flex-1 truncate font-semibold",
              event.completed && "line-through",
            )}
          >
            {event.title}
          </span>
        </span>
        <p className="mt-0.5 truncate font-semibold opacity-70">
          {eventTimeLabel}
        </p>
      </button>
    </Card>
  );
}
