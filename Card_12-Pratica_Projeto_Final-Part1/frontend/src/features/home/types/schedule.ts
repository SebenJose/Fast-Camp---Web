import type { LucideIcon } from "lucide-react";

export type ScheduleEventTone = "slate" | "mint" | "sky" | "amber" | "rose";

export type ScheduleTimeRange = {
  startMinutes: number;
  endMinutes: number;
};

export type ScheduleTimeRangeFormValues = {
  startTime: string;
  endTime: string;
};

export type ScheduleEvent = ScheduleTimeRange & {
  id: string;
  title: string;
  tone?: ScheduleEventTone;
  completed?: boolean;
};

export type PositionedScheduleEvent = {
  event: ScheduleEvent;
  lane: number;
};

export type ScheduleEventFormValues = ScheduleTimeRangeFormValues & {
  title: string;
  tone: ScheduleEventTone;
};

export type ScheduleEventToneOption = {
  label: string;
  value: ScheduleEventTone;
};

export type ScheduleDayRange = ScheduleTimeRange;

export type ScheduleDayRangeFormValues = ScheduleTimeRangeFormValues;

export type ScheduleRangeLabel = {
  label: string;
  minutes: number;
};

export type SchedulePeriod = {
  id: string;
  label: string;
  icon: LucideIcon;
  startHour: number;
  endHour: number;
  rangeLabels: ScheduleRangeLabel[];
  events: ScheduleEvent[];
};

export type ScheduleMetric = {
  id: string;
  icon: LucideIcon;
  label: string;
};

export type SchedulePendingAction =
  | "add-event"
  | "delete-event"
  | "toggle-event"
  | "day-range";
