import { Check, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import type { ScheduleEvent } from "../types/schedule";

type ScheduleEventCardDetailsProps = {
  event: ScheduleEvent;
  timeLabel: string;
  onDelete: () => void;
  onToggleCompleted: () => void;
};

export function ScheduleEventCardDetails({
  event,
  timeLabel,
  onDelete,
  onToggleCompleted,
}: ScheduleEventCardDetailsProps) {
  return (
    <div className="grid gap-4 border-t border-app-border pt-4">
      <div>
        <p className="text-[0.68rem] font-bold uppercase text-app-muted">
          Agendado
        </p>
        <p className="mt-1 text-sm font-semibold text-primary-title">
          {timeLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onToggleCompleted}
        >
          <Check size={14} aria-hidden="true" />
          {event.completed ? "Reabrir" : "Feito"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={onDelete}
        >
          <Trash2 size={14} aria-hidden="true" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
