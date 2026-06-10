import type { FormEvent } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import {
  SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME,
  SCHEDULE_EVENT_TONE_OPTIONS,
} from "../constants/schedule";
import type {
  ScheduleEventFormValues,
  ScheduleEventTone,
} from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";

type ScheduleEventFormProps = {
  values: ScheduleEventFormValues;
  onChange: (values: ScheduleEventFormValues) => void;
  onSubmit: () => void;
};

export function ScheduleEventForm({
  values,
  onChange,
  onSubmit,
}: ScheduleEventFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        />
      </ScheduleFormField>

      <ScheduleFormField label="Início">
        <input
          type="time"
          value={values.startTime}
          onChange={(event) =>
            onChange({ ...values, startTime: event.target.value })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Fim">
        <input
          type="time"
          value={values.endTime}
          onChange={(event) =>
            onChange({ ...values, endTime: event.target.value })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Cor">
        <select
          value={values.tone}
          onChange={(event) =>
            onChange({
              ...values,
              tone: event.target.value as ScheduleEventTone,
            })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
        >
          {SCHEDULE_EVENT_TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </ScheduleFormField>

      <Button type="submit" className="self-end">
        <Plus size={16} aria-hidden="true" />
        Adicionar
      </Button>
    </form>
  );
}
