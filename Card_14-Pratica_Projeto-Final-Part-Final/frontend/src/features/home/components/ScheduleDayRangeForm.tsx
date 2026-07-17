import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";

import { scheduleDayRangeFormValuesSchema } from "../schemas/schedule-schemas";
import type {
  ScheduleDayRange,
  ScheduleDayRangeFormValues,
} from "../types/schedule";
import {
  getTimeFromMinutes,
  getTimeRangeFromTimeValues,
} from "../utils/schedule-time";

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
  const currentValue = getScheduleDayRangeFormValues(value);
  const {
    control,
    formState: { errors, isDirty, isSubmitting: isSubmittingForm },
    handleSubmit,
  } = useForm<ScheduleDayRangeFormValues>({
    resolver: zodResolver(scheduleDayRangeFormValuesSchema),
    values: currentValue,
  });
  const isSubmitPending = isSubmitting || isSubmittingForm;
  const isFormDisabled = disabled || isSubmitPending;

  async function handleValidSubmit(draftDayRange: ScheduleDayRangeFormValues) {
    if (disabled || !isDirty) {
      return;
    }

    await onSubmit(getTimeRangeFromTimeValues(draftDayRange));
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      className="grid gap-3 rounded-2xl border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[1fr_8.5rem_8.5rem_auto] sm:items-end"
      noValidate
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
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <ScheduleTimeSelect
              value={field.value}
              onChange={field.onChange}
              disabled={isFormDisabled}
              errorMessage={errors.startTime?.message}
              errorMessageId="schedule-day-start-error"
            />
          )}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Termina">
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <ScheduleTimeSelect
              value={field.value}
              onChange={field.onChange}
              disabled={isFormDisabled}
              errorMessage={errors.endTime?.message}
              errorMessageId="schedule-day-end-error"
            />
          )}
        />
      </ScheduleFormField>

      <Button
        type="submit"
        className="self-end"
        disabled={isFormDisabled || !isDirty}
        aria-busy={isSubmitPending}
      >
        {isSubmitPending ? "Salvando..." : "Aplicar"}
      </Button>
    </form>
  );
}

function getScheduleDayRangeFormValues(
  value: ScheduleDayRange,
): ScheduleDayRangeFormValues {
  return {
    startTime: getTimeFromMinutes(value.startMinutes),
    endTime: getTimeFromMinutes(value.endMinutes),
  };
}
