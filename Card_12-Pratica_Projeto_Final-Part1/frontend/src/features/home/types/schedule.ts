import type { LucideIcon } from "lucide-react";

export type ScheduleEventTone = "slate" | "mint" | "sky" | "amber" | "rose";

export type ScheduleEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  tone?: ScheduleEventTone;
  completed?: boolean;
};

export type PositionedScheduleEvent = {
  event: ScheduleEvent;
  lane: number;
};

export type ScheduleEventFormValues = Pick<
  ScheduleEvent,
  "title" | "startTime" | "endTime" | "tone"
> & {
  tone: ScheduleEventTone;
};

export type ScheduleEventToneOption = {
  label: string;
  value: ScheduleEventTone;
};

export type ScheduleDayRange = {
  startTime: string;
  endTime: string;
};

export type SchedulePeriod = {
  id: string;
  label: string;
  icon: LucideIcon;
  startHour: number;
  endHour: number;
  rangeLabels: string[];
  events: ScheduleEvent[];
};

export type ScheduleMetric = {
  id: string;
  icon: LucideIcon;
  label: string;
};
