import { SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME } from "../constants/schedule";
import type { ScheduleDayRange } from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";

type ScheduleDayRangeFormProps = {
  value: ScheduleDayRange;
  onChange: (value: ScheduleDayRange) => void;
};

export function ScheduleDayRangeForm({
  value,
  onChange,
}: ScheduleDayRangeFormProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-app-border bg-input-opaque/55 p-4 sm:grid-cols-[1fr_8.5rem_8.5rem] sm:items-end">
      <div>
        <p className="text-sm font-semibold text-primary-title">
          Horário visível do dia
        </p>
        <p className="mt-1 text-xs font-medium text-app-muted">
          Defina onde a agenda começa e termina na visualização.
        </p>
      </div>

      <ScheduleFormField label="Começa">
        <input
          type="time"
          value={value.startTime}
          onChange={(event) =>
            onChange({ ...value, startTime: event.target.value })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Termina">
        <input
          type="time"
          value={value.endTime}
          onChange={(event) =>
            onChange({ ...value, endTime: event.target.value })
          }
          className={SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME}
        />
      </ScheduleFormField>
    </div>
  );
}
