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
  disabled?: boolean;
  isDeleting?: boolean;
  isToggling?: boolean;
};

export function ScheduleEventDialog({
  event,
  open,
  onOpenChange,
  onDelete,
  onToggleCompleted,
  disabled = false,
  isDeleting = false,
  isToggling = false,
}: ScheduleEventDialogProps) {
  if (!event) {
    return null;
  }

  const timeLabel = getScheduleEventTimeLabel(event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-app-border bg-opaque-black text-primary-title shadow-2xl shadow-black/40 sm:max-w-md">
        <DialogHeader className="min-w-0">
          <DialogTitle className="wrap-break-word text-xl font-semibold text-primary-title">
            {event.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Card agendado para {timeLabel}
          </DialogDescription>
        </DialogHeader>

        <ScheduleEventCardDetails
          event={event}
          timeLabel={timeLabel}
          onDelete={() => onDelete(event.id)}
          onToggleCompleted={() => onToggleCompleted(event.id)}
          disabled={disabled}
          isDeleting={isDeleting}
          isToggling={isToggling}
        />
      </DialogContent>
    </Dialog>
  );
}
