import type { FormEvent } from "react";
import { Plus } from "lucide-react";

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
  SCHEDULE_EVENT_TONE_OPTIONS,
} from "../constants/schedule";
import type { ScheduleEventFormValues } from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";
import { ScheduleTimeSelect } from "./ScheduleTimeSelect";

type ScheduleEventFormProps = {
  values: ScheduleEventFormValues;
  onChange: (values: ScheduleEventFormValues) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
};

function getScheduleEventTone(value: string) {
  return SCHEDULE_EVENT_TONE_OPTIONS.find((option) => option.value === value)
    ?.value;
}

export function ScheduleEventForm({
  values,
  onChange,
  onSubmit,
  disabled = false,
  isSubmitting = false,
}: ScheduleEventFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[minmax(12rem,1fr)_8.5rem_8.5rem_9rem_auto]"
    >
      <ScheduleFormField label="Título">
        <input
          value={values.title}
          onChange={(event) =>
            onChange({ ...values, title: event.target.value })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
          placeholder="Novo bloco"
          disabled={disabled}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Início">
        <ScheduleTimeSelect
          value={values.startTime}
          onChange={(startTime) => onChange({ ...values, startTime })}
          disabled={disabled}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Fim">
        <ScheduleTimeSelect
          value={values.endTime}
          onChange={(endTime) => onChange({ ...values, endTime })}
          disabled={disabled}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Cor">
        <Select
          value={values.tone}
          disabled={disabled}
          onValueChange={(tone) => {
            const selectedTone = getScheduleEventTone(tone);

            if (!selectedTone) {
              return;
            }

            onChange({
              ...values,
              tone: selectedTone,
            });
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
      </ScheduleFormField>

      <Button
        type="submit"
        className="self-end"
        disabled={disabled}
        aria-busy={isSubmitting}
      >
        <Plus size={16} aria-hidden="true" />
        {isSubmitting ? "Adicionando..." : "Adicionar"}
      </Button>
    </form>
  );
}
