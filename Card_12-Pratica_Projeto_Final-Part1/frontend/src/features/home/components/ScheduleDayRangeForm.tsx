import type { ScheduleDayRange } from "../types/schedule";

import { ScheduleFormField } from "./ScheduleFormField";
import { ScheduleTimeSelect } from "./ScheduleTimeSelect";

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
        <ScheduleTimeSelect
          value={value.startTime}
          onChange={(startTime) => onChange({ ...value, startTime })}
        />
      </ScheduleFormField>

      <ScheduleFormField label="Termina">
        <ScheduleTimeSelect
          value={value.endTime}
          onChange={(endTime) => onChange({ ...value, endTime })}
        />
      </ScheduleFormField>
    </div>
  );
}
