"use client";

import { useMemo, useState } from "react";

import {
  TODAY_SCHEDULE_METRICS,
  TODAY_SCHEDULE_PERIODS,
} from "../data/today-schedule";
import type { ScheduleEvent } from "../types/schedule";
import {
  INITIAL_SCHEDULE_DAY_RANGE,
  INITIAL_SCHEDULE_EVENT_FORM_VALUES,
} from "../constants/schedule";
import {
  getVisibleSchedulePeriods,
  getMinutesFromTime,
  getTimeFromMinutes,
  isEventInsidePeriod,
  sortScheduleEvents,
} from "../utils/schedule-time";

import { HomeHeader } from "./HomeHeader";
import { TodayScheduleCard } from "./TodayScheduleCard";

export function HomePage() {
  const [periods, setPeriods] = useState(TODAY_SCHEDULE_PERIODS);
  const [dayRange, setDayRange] = useState(INITIAL_SCHEDULE_DAY_RANGE);
  const [eventFormValues, setEventFormValues] = useState(
    INITIAL_SCHEDULE_EVENT_FORM_VALUES,
  );

  const visiblePeriods = useMemo(
    () => getVisibleSchedulePeriods(periods, dayRange),
    [periods, dayRange],
  );

  const metrics = useMemo(() => {
    const events = visiblePeriods.flatMap((period) => period.events);
    const completedBlocks = events.filter((event) => event.completed).length;
    const nextEvent = sortScheduleEvents(events).find(
      (event) => !event.completed,
    );

    return TODAY_SCHEDULE_METRICS.map((metric) => {
      if (metric.id === "completed-blocks") {
        return {
          ...metric,
          label: `${completedBlocks}/${events.length} feitas`,
        };
      }

      if (metric.id === "next-block") {
        return {
          ...metric,
          label: nextEvent ? `Próximo: ${nextEvent.title}` : "Tudo feito",
        };
      }

      return metric;
    });
  }, [visiblePeriods]);

  function handleAddEvent() {
    const title = eventFormValues.title.trim();
    const startMinutes = getMinutesFromTime(eventFormValues.startTime);
    const endMinutes = getMinutesFromTime(eventFormValues.endTime);

    if (!title || endMinutes <= startMinutes) {
      return;
    }

    const targetPeriod = visiblePeriods.find((period) =>
      isEventInsidePeriod(eventFormValues, period),
    );

    if (!targetPeriod) {
      return;
    }

    const newEvent: ScheduleEvent = {
      id: globalThis.crypto?.randomUUID() ?? `event-${Date.now()}`,
      title,
      startTime: eventFormValues.startTime,
      endTime: eventFormValues.endTime,
      tone: eventFormValues.tone,
    };

    setPeriods((currentPeriods) =>
      currentPeriods.map((period) => {
        if (period.id !== targetPeriod.id) {
          return period;
        }

        return {
          ...period,
          events: sortScheduleEvents([...period.events, newEvent]),
        };
      }),
    );

    const nextStartMinutes = endMinutes;
    const nextEndMinutes = Math.min(endMinutes + 30, targetPeriod.endHour * 60);
    const hasNextSlot = nextEndMinutes > nextStartMinutes;

    setEventFormValues((currentValues) => ({
      ...INITIAL_SCHEDULE_EVENT_FORM_VALUES,
      startTime: hasNextSlot
        ? getTimeFromMinutes(nextStartMinutes)
        : INITIAL_SCHEDULE_EVENT_FORM_VALUES.startTime,
      endTime: hasNextSlot
        ? getTimeFromMinutes(nextEndMinutes)
        : INITIAL_SCHEDULE_EVENT_FORM_VALUES.endTime,
      tone: currentValues.tone,
    }));
  }

  function handleDeleteEvent(eventId: string) {
    setPeriods((currentPeriods) =>
      currentPeriods.map((period) => ({
        ...period,
        events: period.events.filter((event) => event.id !== eventId),
      })),
    );
  }

  function handleToggleEventCompleted(eventId: string) {
    setPeriods((currentPeriods) =>
      currentPeriods.map((period) => ({
        ...period,
        events: period.events.map((event) =>
          event.id === eventId
            ? { ...event, completed: !event.completed }
            : event,
        ),
      })),
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HomeHeader />
        <TodayScheduleCard
          metrics={metrics}
          periods={visiblePeriods}
          dayRange={dayRange}
          onDayRangeChange={setDayRange}
          eventFormValues={eventFormValues}
          onEventFormChange={setEventFormValues}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onToggleEventCompleted={handleToggleEventCompleted}
        />
      </div>
    </main>
  );
}
