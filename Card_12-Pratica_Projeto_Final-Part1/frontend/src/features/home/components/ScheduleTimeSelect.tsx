import type { ChangeEvent } from "react";

import { SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME } from "../constants/schedule";
import { scheduleTimeSchema } from "../schemas/schedule-schemas";

type ScheduleTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function getValidTimeValue(value: string) {
  const parsedTime = scheduleTimeSchema.safeParse(value);

  return parsedTime.success ? parsedTime.data : "00:00";
}

export function ScheduleTimeSelect({
  value,
  onChange,
  disabled = false,
}: ScheduleTimeSelectProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const parsedTime = scheduleTimeSchema.safeParse(event.target.value);

    if (!parsedTime.success) {
      return;
    }

    onChange(parsedTime.data);
  }

  return (
    <input
      className={`${SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME} w-full`}
      disabled={disabled}
      max="23:59"
      min="00:00"
      onChange={handleChange}
      step={60}
      type="time"
      value={getValidTimeValue(value)}
    />
  );
}
