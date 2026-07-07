import type { ReactNode } from "react";

type ScheduleFormFieldProps = {
  label: string;
  children: ReactNode;
};

export function ScheduleFormField({
  label,
  children,
}: ScheduleFormFieldProps) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase text-app-muted">
      {label}
      {children}
    </label>
  );
}
