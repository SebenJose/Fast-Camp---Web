import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";

import { INITIAL_SCHEDULE_DAY_RANGE } from "../constants/schedule";
import { TODAY_SCHEDULE_PERIODS } from "../data/today-schedule";
import type { StoredSchedule } from "../schemas/schedule-schemas";
import type { ScheduleEvent, SchedulePeriod } from "../types/schedule";
import { getVisibleSchedulePeriods } from "../utils/schedule-time";

import { useScheduleQuery } from "./use-schedule-query";

function getPeriodsFromStoredSchedule(storedSchedule: StoredSchedule) {
  return TODAY_SCHEDULE_PERIODS.map((period) => ({
    ...period,
    events: storedSchedule.eventsByPeriodId[period.id] ?? [],
  }));
}

function getInitialPeriods(): SchedulePeriod[] {
  return TODAY_SCHEDULE_PERIODS.map((period) => ({
    ...period,
    events: [...period.events],
  }));
}

function getUniqueScheduleEvents(events: ScheduleEvent[]) {
  return Array.from(new Map(events.map((event) => [event.id, event])).values());
}

export function useScheduleHydration() {
  const session = useAuthStore((store) => store.session);
  const userId = session?.userId;
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const scheduleQuery = useScheduleQuery(userId);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (scheduleQuery.isError) {
      toast.error("Nao foi possivel carregar sua agenda.");
    }
  }, [scheduleQuery.isError]);

  const dayRange = scheduleQuery.data?.dayRange ?? INITIAL_SCHEDULE_DAY_RANGE;
  const periods = useMemo(
    () =>
      scheduleQuery.data
        ? getPeriodsFromStoredSchedule(scheduleQuery.data)
        : getInitialPeriods(),
    [scheduleQuery.data],
  );

  const visiblePeriods = useMemo(
    () => getVisibleSchedulePeriods(periods, dayRange),
    [periods, dayRange],
  );
  const visibleEvents = useMemo(
    () =>
      getUniqueScheduleEvents(visiblePeriods.flatMap((period) => period.events)),
    [visiblePeriods],
  );
  const isLoadingSchedule = !userId || scheduleQuery.isPending;

  return {
    currentDate,
    dayRange,
    isLoadingSchedule,
    periods,
    userId,
    visibleEvents,
    visiblePeriods,
  };
}
