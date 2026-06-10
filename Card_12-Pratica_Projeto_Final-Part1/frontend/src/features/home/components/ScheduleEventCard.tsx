import { CircleCheck } from "lucide-react";

import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import { SCHEDULE_EVENT_TONE_CLASS_NAMES } from "../constants/schedule";
import type { ScheduleEvent, SchedulePeriod } from "../types/schedule";
import {
  getScheduleEventPosition,
  getScheduleEventTimeLabel,
} from "../utils/schedule-time";

import { ScheduleEventCardDetails } from "./ScheduleEventCardDetails";

type ScheduleEventCardProps = {
  event: ScheduleEvent;
  period: SchedulePeriod;
  lane: number;
  isOpen: boolean;
  onOpenChange: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onToggleCompleted: (eventId: string) => void;
};

export function ScheduleEventCard({
  event,
  period,
  lane,
  isOpen,
  onOpenChange,
  onDelete,
  onToggleCompleted,
}: ScheduleEventCardProps) {
  const eventStyle = getScheduleEventPosition(event, period, lane);
  const eventTone = event.tone ?? "slate";
  const eventTimeLabel = getScheduleEventTimeLabel(event);

  return (
    <Card
      className={cn(
        "absolute z-10 gap-0 rounded-xl border px-3 py-2 text-left text-xs shadow-lg shadow-black/20 ring-0 transition-all",
        SCHEDULE_EVENT_TONE_CLASS_NAMES[eventTone],
        event.completed &&
          "border-schedule-completed-border opacity-75 shadow-schedule-completed-border/20",
        isOpen && "z-20 min-w-56 shadow-xl",
      )}
      style={eventStyle}
    >
      <button
        type="button"
        className="w-full text-left outline-none"
        onClick={() => onOpenChange(event.id)}
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {event.completed ? (
            <CircleCheck
              size={14}
              className="shrink-0 text-schedule-completed-icon"
              aria-label="Concluído"
            />
          ) : null}

          <span
            className={cn(
              "truncate font-semibold",
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

      {isOpen ? (
        <ScheduleEventCardDetails
          event={event}
          timeLabel={eventTimeLabel}
          onDelete={() => onDelete(event.id)}
          onToggleCompleted={() => onToggleCompleted(event.id)}
        />
      ) : null}
    </Card>
  );
}
