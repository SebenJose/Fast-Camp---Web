import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import type { ScheduleEvent } from "../types/schedule";
import { getScheduleEventTimeLabel } from "../utils/schedule-time";

import { ScheduleEventCardDetails } from "./ScheduleEventCardDetails";

type ScheduleEventDialogProps = {
  event: ScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (eventId: string) => void;
  onToggleCompleted: (eventId: string) => void;
};

export function ScheduleEventDialog({
  event,
  open,
  onOpenChange,
  onDelete,
  onToggleCompleted,
}: ScheduleEventDialogProps) {
  if (!event) {
    return null;
  }

  const timeLabel = getScheduleEventTimeLabel(event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-app-border bg-opaque-black text-primary-title shadow-2xl shadow-black/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-title">
            {event.title}
          </DialogTitle>
          <DialogDescription className="font-medium text-secundary-title">
            {timeLabel}
          </DialogDescription>
        </DialogHeader>

        <ScheduleEventCardDetails
          event={event}
          timeLabel={timeLabel}
          onDelete={() => onDelete(event.id)}
          onToggleCompleted={() => onToggleCompleted(event.id)}
        />
      </DialogContent>
    </Dialog>
  );
}
