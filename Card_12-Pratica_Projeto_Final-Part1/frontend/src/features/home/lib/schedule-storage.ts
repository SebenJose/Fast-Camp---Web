import { v4 as uuidv4 } from "uuid";

import { INITIAL_SCHEDULE_DAY_RANGE } from "../constants/schedule";
import {
  storedScheduleSchema,
  type StoredSchedule,
} from "../schemas/schedule-schemas";
import type {
  ScheduleDayRange,
  ScheduleEvent,
  ScheduleEventFormValues,
  SchedulePeriod,
} from "../types/schedule";
import {
  getVisibleSchedulePeriods,
  isEventInsideDayRange,
  isEventStartingInsidePeriod,
  sortScheduleEvents,
} from "../utils/schedule-time";

const SCHEDULE_STORAGE_KEY_PREFIX = "organiza-ai:schedule";

function getUserScheduleStorageKey(userId: string) {
  return `${SCHEDULE_STORAGE_KEY_PREFIX}:${userId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function getBaseStoredSchedule(basePeriods: SchedulePeriod[]): StoredSchedule {
  return {
    dayRange: INITIAL_SCHEDULE_DAY_RANGE,
    eventsByPeriodId: basePeriods.reduce<Record<string, ScheduleEvent[]>>(
      (eventsByPeriodId, period) => ({
        ...eventsByPeriodId,
        [period.id]: sortScheduleEvents(period.events),
      }),
      {},
    ),
  };
}

function getPeriodsFromStoredSchedule(
  basePeriods: SchedulePeriod[],
  storedSchedule: StoredSchedule,
) {
  return basePeriods.map((period) => ({
    ...period,
    events: storedSchedule.eventsByPeriodId[period.id] ?? [],
  }));
}

function parseStoredSchedule(value: unknown): StoredSchedule | null {
  const parsedSchedule = storedScheduleSchema.safeParse(value);

  if (!parsedSchedule.success) {
    return null;
  }

  const eventsByPeriodId: Record<string, ScheduleEvent[]> = {};

  for (const [periodId, events] of Object.entries(
    parsedSchedule.data.eventsByPeriodId,
  )) {
    eventsByPeriodId[periodId] = sortScheduleEvents(events);
  }

  return {
    dayRange: parsedSchedule.data.dayRange,
    eventsByPeriodId,
  };
}

function getStoredSchedule(userId: string): StoredSchedule | null {
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

function getStoredScheduleOrDefault(
  userId: string,
  basePeriods: SchedulePeriod[],
) {
  return getStoredSchedule(userId) ?? getBaseStoredSchedule(basePeriods);
}

function saveStoredSchedule(userId: string, schedule: StoredSchedule) {
  if (!isBrowser()) {
    return null;
  }

  const storedSchedule = storedScheduleSchema.safeParse(schedule);

  if (!storedSchedule.success) {
    return null;
  }

  window.localStorage.setItem(
    getUserScheduleStorageKey(userId),
    JSON.stringify(storedSchedule.data),
  );

  return storedSchedule.data;
}

export function loadUserStoredSchedule(
  userId: string,
  basePeriods: SchedulePeriod[],
) {
  return getStoredScheduleOrDefault(userId, basePeriods);
}

export function updateUserScheduleDayRange(
  userId: string,
  dayRange: ScheduleDayRange,
  basePeriods: SchedulePeriod[],
) {
  const currentSchedule = loadUserStoredSchedule(userId, basePeriods);
  const nextSchedule = saveStoredSchedule(userId, {
    ...currentSchedule,
    dayRange,
  });

  if (!nextSchedule) {
    return null;
  }

  return nextSchedule;
}

export function createUserScheduleEvent(
  userId: string,
  eventValues: ScheduleEventFormValues,
  basePeriods: SchedulePeriod[],
) {
  const currentSchedule = loadUserStoredSchedule(userId, basePeriods);
  const currentPeriods = getPeriodsFromStoredSchedule(
    basePeriods,
    currentSchedule,
  );
  const visiblePeriods = getVisibleSchedulePeriods(
    currentPeriods,
    currentSchedule.dayRange,
  );

  if (!isEventInsideDayRange(eventValues, currentSchedule.dayRange)) {
    return {
      ok: false as const,
      message: "Esse horario esta fora do intervalo visivel do dia.",
    };
  }

  const targetPeriod = visiblePeriods.find((period) =>
    isEventStartingInsidePeriod(eventValues, period),
  );

  if (!targetPeriod) {
    return {
      ok: false as const,
      message: "Esse horario esta fora do intervalo visivel do dia.",
    };
  }

  const newEvent: ScheduleEvent = {
    id: uuidv4(),
    title: eventValues.title.trim(),
    startTime: eventValues.startTime,
    endTime: eventValues.endTime,
    tone: eventValues.tone,
  };
  const targetEvents = currentSchedule.eventsByPeriodId[targetPeriod.id] ?? [];
  const nextSchedule = saveStoredSchedule(userId, {
    ...currentSchedule,
    eventsByPeriodId: {
      ...currentSchedule.eventsByPeriodId,
      [targetPeriod.id]: sortScheduleEvents([...targetEvents, newEvent]),
    },
  });

  if (!nextSchedule) {
    return {
      ok: false as const,
      message: "Nao foi possivel criar o card.",
    };
  }

  return {
    ok: true as const,
    schedule: nextSchedule,
    event: newEvent,
  };
}

export function deleteUserScheduleEvent(
  userId: string,
  eventId: string,
  basePeriods: SchedulePeriod[],
) {
  const currentSchedule = loadUserStoredSchedule(userId, basePeriods);
  const events = Object.values(currentSchedule.eventsByPeriodId).flat();
  const deletedEvent = events.find((event) => event.id === eventId) ?? null;

  if (!deletedEvent) {
    return {
      ok: false as const,
      message: "Card nao encontrado.",
    };
  }

  const nextSchedule = saveStoredSchedule(userId, {
    ...currentSchedule,
    eventsByPeriodId: Object.fromEntries(
      Object.entries(currentSchedule.eventsByPeriodId).map(
        ([periodId, periodEvents]) => [
          periodId,
          periodEvents.filter((event) => event.id !== eventId),
        ],
      ),
    ),
  });

  if (!nextSchedule) {
    return {
      ok: false as const,
      message: "Nao foi possivel excluir o card.",
    };
  }

  return {
    ok: true as const,
    schedule: nextSchedule,
    event: deletedEvent,
  };
}

export function toggleUserScheduleEventCompleted(
  userId: string,
  eventId: string,
  basePeriods: SchedulePeriod[],
) {
  const currentSchedule = loadUserStoredSchedule(userId, basePeriods);
  let updatedEvent: ScheduleEvent | null = null;
  const nextSchedule = saveStoredSchedule(userId, {
    ...currentSchedule,
    eventsByPeriodId: Object.fromEntries(
      Object.entries(currentSchedule.eventsByPeriodId).map(
        ([periodId, periodEvents]) => [
          periodId,
          periodEvents.map((event) => {
            if (event.id !== eventId) {
              return event;
            }

            updatedEvent = { ...event, completed: !event.completed };

            return updatedEvent;
          }),
        ],
      ),
    ),
  });

  if (!nextSchedule || !updatedEvent) {
    return {
      ok: false as const,
      message: "Nao foi possivel atualizar o card.",
    };
  }

  return {
    ok: true as const,
    schedule: nextSchedule,
    event: updatedEvent,
  };
}
