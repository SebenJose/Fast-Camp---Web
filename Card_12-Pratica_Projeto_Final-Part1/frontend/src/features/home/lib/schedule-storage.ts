import { INITIAL_SCHEDULE_DAY_RANGE } from "../constants/schedule";
import type {
  ScheduleDayRange,
  ScheduleEvent,
  ScheduleEventTone,
  SchedulePeriod,
} from "../types/schedule";
import { sortScheduleEvents } from "../utils/schedule-time";

type StoredSchedule = {
  dayRange: ScheduleDayRange;
  eventsByPeriodId: Record<string, ScheduleEvent[]>;
};

const SCHEDULE_STORAGE_KEY_PREFIX = "organiza-ai:schedule";
const SCHEDULE_EVENT_TONES: ScheduleEventTone[] = [
  "slate",
  "mint",
  "sky",
  "amber",
  "rose",
];

function getUserScheduleStorageKey(userId: string) {
  return `${SCHEDULE_STORAGE_KEY_PREFIX}:${userId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScheduleDayRange(value: unknown): value is ScheduleDayRange {
  return (
    isRecord(value) &&
    typeof value.startTime === "string" &&
    typeof value.endTime === "string"
  );
}

function isScheduleEventTone(value: unknown): value is ScheduleEventTone {
  return (
    typeof value === "string" &&
    SCHEDULE_EVENT_TONES.includes(value as ScheduleEventTone)
  );
}

function isScheduleEvent(value: unknown): value is ScheduleEvent {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.startTime === "string" &&
    typeof value.endTime === "string" &&
    (value.tone === undefined || isScheduleEventTone(value.tone)) &&
    (value.completed === undefined || typeof value.completed === "boolean")
  );
}

function parseStoredSchedule(value: unknown): StoredSchedule | null {
  if (!isRecord(value) || !isScheduleDayRange(value.dayRange)) {
    return null;
  }

  if (!isRecord(value.eventsByPeriodId)) {
    return null;
  }

  const eventsByPeriodId: Record<string, ScheduleEvent[]> = {};

  for (const [periodId, events] of Object.entries(value.eventsByPeriodId)) {
    if (!Array.isArray(events) || !events.every(isScheduleEvent)) {
      return null;
    }

    eventsByPeriodId[periodId] = sortScheduleEvents(events);
  }

  return {
    dayRange: value.dayRange,
    eventsByPeriodId,
  };
}

function getStoredSchedule(userId: string) {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedSchedule = window.localStorage.getItem(
      getUserScheduleStorageKey(userId),
    );

    if (!storedSchedule) {
      return null;
    }

    return parseStoredSchedule(JSON.parse(storedSchedule));
  } catch {
    return null;
  }
}

export function loadUserSchedule(
  userId: string,
  basePeriods: SchedulePeriod[],
) {
  const storedSchedule = getStoredSchedule(userId);

  if (!storedSchedule) {
    return {
      dayRange: INITIAL_SCHEDULE_DAY_RANGE,
      periods: basePeriods,
    };
  }

  return {
    dayRange: storedSchedule.dayRange,
    periods: basePeriods.map((period) => ({
      ...period,
      events: storedSchedule.eventsByPeriodId[period.id] ?? [],
    })),
  };
}

export function saveUserSchedule(
  userId: string,
  dayRange: ScheduleDayRange,
  periods: SchedulePeriod[],
) {
  if (!isBrowser()) {
    return;
  }

  const eventsByPeriodId = periods.reduce<Record<string, ScheduleEvent[]>>(
    (eventsByPeriod, period) => ({
      ...eventsByPeriod,
      [period.id]: period.events,
    }),
    {},
  );

  window.localStorage.setItem(
    getUserScheduleStorageKey(userId),
    JSON.stringify({
      dayRange,
      eventsByPeriodId,
    }),
  );
}
