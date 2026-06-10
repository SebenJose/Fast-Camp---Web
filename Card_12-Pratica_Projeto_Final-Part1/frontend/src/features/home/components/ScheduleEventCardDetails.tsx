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
    <div className="mt-3 grid gap-2 border-t border-current/20 pt-3">
      <div>
        <p className="text-[0.68rem] font-bold uppercase opacity-70">
          Agendado
        </p>
        <p className="mt-0.5 font-semibold">{timeLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="bg-primary-black/15 text-current hover:bg-primary-black/25"
          onClick={onToggleCompleted}
        >
          <Check size={14} aria-hidden="true" />
          {event.completed ? "Reabrir" : "Feito"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="bg-primary-black/15 text-current hover:bg-primary-black/25"
          onClick={onDelete}
        >
          <Trash2 size={14} aria-hidden="true" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
