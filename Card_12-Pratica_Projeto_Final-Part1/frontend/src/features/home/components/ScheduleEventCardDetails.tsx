import { Check, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" size="sm" variant="destructive">
              <Trash2 size={14} aria-hidden="true" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border border-app-border bg-opaque-black text-primary-title shadow-2xl shadow-black/40">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary-title">
                Excluir este card?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-secundary-title">
                {`Essa ação remove "${event.title}" da agenda de hoje.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="border-app-border bg-input-opaque/55">
              <AlertDialogCancel className="border-app-border bg-transparent text-app-muted hover:bg-card-opaque hover:text-primary-title">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={onDelete}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
