import type {
  ScheduleDayRange,
  ScheduleEventFormValues,
  ScheduleEventTone,
  ScheduleEventToneOption,
} from "../types/schedule";

export const INITIAL_SCHEDULE_DAY_RANGE: ScheduleDayRange = {
  startMinutes: 6 * 60,
  endMinutes: 22 * 60,
};

export const INITIAL_SCHEDULE_EVENT_FORM_VALUES: ScheduleEventFormValues = {
  title: "",
  startTime: "09:00",
  endTime: "09:30",
  tone: "sky",
};

export const SCHEDULE_EVENT_TONE_OPTIONS: ScheduleEventToneOption[] = [
  { label: "Cinza", value: "slate" },
  { label: "Menta", value: "mint" },
  { label: "Azul", value: "sky" },
  { label: "Âmbar", value: "amber" },
  { label: "Rosa", value: "rose" },
];

export const SCHEDULE_EVENT_TONE_CLASS_NAMES: Record<
  ScheduleEventTone,
  string
> = {
  slate:
    "border-schedule-slate-border bg-schedule-slate-bg text-schedule-slate-fg",
  mint: "border-schedule-mint-border bg-schedule-mint-bg text-schedule-mint-fg",
  sky: "border-schedule-sky-border bg-schedule-sky-bg text-schedule-sky-fg",
  amber:
    "border-schedule-amber-border bg-schedule-amber-bg text-schedule-amber-fg",
  rose: "border-schedule-rose-border bg-schedule-rose-bg text-schedule-rose-fg",
};

export const SCHEDULE_EVENT_FORM_FIELD_CLASS_NAME =
  "h-10 rounded-xl border border-app-border bg-input-opaque px-3 text-sm font-medium text-primary-title outline-none transition focus:border-secundary-title/60 focus:ring-2 focus:ring-secundary-title/20";

export const SCHEDULE_TIMELINE_EVENT_TOP = 40;
export const SCHEDULE_TIMELINE_LANE_HEIGHT = 62;
export const SCHEDULE_TIMELINE_BOTTOM_PADDING = 18;
export const SCHEDULE_EVENT_MIN_WIDTH_PERCENT = 14;
