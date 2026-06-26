import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME,
  SCHEDULE_EVENT_TITLE_MAX_LENGTH,
  SCHEDULE_EVENT_TONE_OPTIONS,
} from "../constants/schedule";
import { scheduleEventFormValuesSchema } from "../schemas/schedule-schemas";
import type { ScheduleEventFormValues } from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";
import { ScheduleTimeSelect } from "./ScheduleTimeSelect";

type ScheduleEventFormProps = {
  values: ScheduleEventFormValues;
  onSubmit: (values: ScheduleEventFormValues) => Promise<boolean>;
  disabled?: boolean;
  isSubmitting?: boolean;
};

function getScheduleEventTone(value: string) {
  return SCHEDULE_EVENT_TONE_OPTIONS.find((option) => option.value === value)
    ?.value;
}

export function ScheduleEventForm({
  values,
  onSubmit,
  disabled = false,
  isSubmitting = false,
}: ScheduleEventFormProps) {
  const {
    control,
    formState: { errors, isSubmitting: isSubmittingForm },
    handleSubmit,
    register,
    watch,
  } = useForm<ScheduleEventFormValues>({
    resolver: zodResolver(scheduleEventFormValuesSchema),
    values,
  });
  const isSubmitPending = isSubmitting || isSubmittingForm;
  const isFormDisabled = disabled || isSubmitPending;
  const titleLength = watch("title").length;

  async function handleValidSubmit(formValues: ScheduleEventFormValues) {
    if (disabled) {
      return;
    }

    await onSubmit(formValues);
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      className="grid gap-3 rounded-2xl border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[minmax(12rem,1fr)_8.5rem_8.5rem_9rem_auto]"
      noValidate
    >
      <ScheduleFormField label="Título">
        <input
          aria-describedby={errors.title ? "schedule-title-error" : undefined}
          aria-invalid={Boolean(errors.title)}
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
          placeholder="Novo bloco"
          disabled={isFormDisabled}
          maxLength={SCHEDULE_EVENT_TITLE_MAX_LENGTH}
          {...register("title")}
        />
        <div className="flex items-center justify-between gap-2">
          {errors.title ? (
            <p
              className="text-xs font-medium normal-case text-warning"
              id="schedule-title-error"
            >
              {errors.title.message}
            </p>
          ) : (
            <span />
          )}
          <p
            className={`ml-auto text-xs font-medium normal-case tabular-nums ${
              titleLength >= SCHEDULE_EVENT_TITLE_MAX_LENGTH
                ? "text-warning"
                : "text-app-muted"
            }`}
          >
            {titleLength}/{SCHEDULE_EVENT_TITLE_MAX_LENGTH}
          </p>
        </div>
      </ScheduleFormField>

      <ScheduleFormField label="Início">
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <ScheduleTimeSelect
              value={field.value}
              onChange={field.onChange}
              disabled={isFormDisabled}
              errorMessage={errors.startTime?.message}
              errorMessageId="schedule-start-time-error"
            />
          )}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Fim">
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <ScheduleTimeSelect
              value={field.value}
              onChange={field.onChange}
              disabled={isFormDisabled}
              errorMessage={errors.endTime?.message}
              errorMessageId="schedule-end-time-error"
            />
          )}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Cor">
        <Controller
          control={control}
          name="tone"
          render={({ field }) => (
            <Select
              value={field.value}
              disabled={isFormDisabled}
              onValueChange={(nextTone) => {
                const selectedTone = getScheduleEventTone(nextTone);

                if (!selectedTone) {
                  return;
                }

                field.onChange(selectedTone);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-app-border bg-input-opaque px-3 text-sm font-medium text-primary-title hover:bg-card-opaque focus-visible:border-secundary-title/60 focus-visible:ring-secundary-title/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-app-border bg-input-opaque text-primary-title shadow-xl shadow-black/30">
                {SCHEDULE_EVENT_TONE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="focus:bg-card-opaque focus:text-primary-title"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </ScheduleFormField>

      <Button
        type="submit"
        className="self-end"
        disabled={isFormDisabled}
        aria-busy={isSubmitPending}
      >
        <Plus size={16} aria-hidden="true" />
        {isSubmitPending ? "Adicionando..." : "Adicionar"}
      </Button>
    </form>
  );
}
