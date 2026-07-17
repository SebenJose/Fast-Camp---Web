import type { ChangeEvent } from "react";

import { SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME } from "../constants/schedule";
import { scheduleTimeSchema } from "../schemas/schedule-schemas";

type ScheduleTimeSelectProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
  errorMessageId?: string;
};

function getValidTimeValue(value: string) {
  const parsedTime = scheduleTimeSchema.safeParse(value);

  return parsedTime.success ? parsedTime.data : "00:00";
}

export function ScheduleTimeSelect({
  value,
  onChange,
  disabled = false,
  errorMessage,
  errorMessageId,
}: ScheduleTimeSelectProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const parsedTime = scheduleTimeSchema.safeParse(event.target.value);

    if (!parsedTime.success) {
      return;
    }

    onChange(parsedTime.data);
  }

  return (
    <>
      <input
        aria-describedby={errorMessage ? errorMessageId : undefined}
        aria-invalid={Boolean(errorMessage)}
        className={`${SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME} w-full`}
        disabled={disabled}
        max="23:59"
        min="00:00"
        onChange={handleChange}
        step={60}
        type="time"
        value={getValidTimeValue(value)}
      />
      {errorMessage && errorMessageId ? (
        <p className="text-xs font-medium normal-case text-warning" id={errorMessageId}>
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
