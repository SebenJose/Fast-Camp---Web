import type { FormEvent } from "react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";

import type { ScheduleDayRange } from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";
import { ScheduleTimeSelect } from "./ScheduleTimeSelect";

type ScheduleDayRangeFormProps = {
  value: ScheduleDayRange;
  onSubmit: (value: ScheduleDayRange) => Promise<boolean>;
  disabled?: boolean;
  isSubmitting?: boolean;
};

export function ScheduleDayRangeForm({
  value,
  onSubmit,
  disabled = false,
  isSubmitting = false,
}: ScheduleDayRangeFormProps) {
  const [draftValue, setDraftValue] = useState(value);
  const hasChanges =
    draftValue.startTime !== value.startTime || draftValue.endTime !== value.endTime;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || !hasChanges) {
      return;
    }

    void onSubmit(draftValue);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[1fr_8.5rem_8.5rem_auto] sm:items-end"
    >
      <div>
        <p className="text-sm font-semibold text-primary-title">
          Horário visível do dia
        </p>
        <p className="mt-1 text-xs font-medium text-app-muted">
          Defina onde a agenda começa e termina na visualização.
        </p>
      </div>

      <ScheduleFormField label="Começa">
        <ScheduleTimeSelect
          value={draftValue.startTime}
          onChange={(startTime) =>
            setDraftValue((currentValue) => ({ ...currentValue, startTime }))
          }
          disabled={disabled}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Termina">
        <ScheduleTimeSelect
          value={draftValue.endTime}
          onChange={(endTime) =>
            setDraftValue((currentValue) => ({ ...currentValue, endTime }))
          }
          disabled={disabled}
        />
      </ScheduleFormField>

      <Button
        type="submit"
        className="self-end"
        disabled={disabled || !hasChanges}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : "Aplicar"}
      </Button>
    </form>
  );
}
