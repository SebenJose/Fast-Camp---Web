"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  TODAY_SCHEDULE_METRICS,
  TODAY_SCHEDULE_PERIODS,
} from "../data/today-schedule";
import type { ScheduleDayRange, ScheduleEvent } from "../types/schedule";
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
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [eventFormValues, setEventFormValues] = useState(
    INITIAL_SCHEDULE_EVENT_FORM_VALUES,
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const visiblePeriods = useMemo(
    () => getVisibleSchedulePeriods(periods, dayRange),
    [periods, dayRange],
  );
  const visibleEvents = useMemo(
    () => visiblePeriods.flatMap((period) => period.events),
    [visiblePeriods],
  );

  const metrics = useMemo(() => {
    const completedBlocks = visibleEvents.filter((event) => event.completed).length;

    return TODAY_SCHEDULE_METRICS.map((metric) => {
      if (metric.id === "completed-blocks") {
        return {
          ...metric,
          label: `${completedBlocks}/${visibleEvents.length} feitas`,
        };
      }

      return metric;
    });
  }, [visibleEvents]);

  function handleAddEvent() {
    const title = eventFormValues.title.trim();
    const startMinutes = getMinutesFromTime(eventFormValues.startTime);
    const endMinutes = getMinutesFromTime(eventFormValues.endTime);

    if (!title || endMinutes <= startMinutes) {
      toast.warning("Preencha um título e um horário válido para criar o card.");
      return;
    }

    const targetPeriod = visiblePeriods.find((period) =>
      isEventInsidePeriod(eventFormValues, period),
    );

    if (!targetPeriod) {
      toast.warning("Esse horário está fora do intervalo visível do dia.");
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

    toast.success("Card criado com sucesso.");
  }

  function handleDeleteEvent(eventId: string) {
    const deletedEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);

    setPeriods((currentPeriods) =>
      currentPeriods.map((period) => ({
        ...period,
        events: period.events.filter((event) => event.id !== eventId),
      })),
    );

    toast.success(
      deletedEvent
        ? `Card "${deletedEvent.title}" excluído.`
        : "Card excluído.",
    );
  }

  function handleDayRangeChange(nextDayRange: ScheduleDayRange) {
    if (
      nextDayRange.startTime === dayRange.startTime &&
      nextDayRange.endTime === dayRange.endTime
    ) {
      return;
    }

    const startMinutes = getMinutesFromTime(nextDayRange.startTime);
    const endMinutes = getMinutesFromTime(nextDayRange.endTime);

    if (endMinutes <= startMinutes) {
      toast.warning("O fim do dia precisa ser depois do começo.");
      return;
    }

    setDayRange(nextDayRange);

    toast.success(
      `Horário do dia atualizado: ${nextDayRange.startTime} - ${nextDayRange.endTime}.`,
    );
  }

  function handleToggleEventCompleted(eventId: string) {
    const targetEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);

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

    if (!targetEvent) {
      return;
    }

    if (targetEvent.completed) {
      toast.info(`Card "${targetEvent.title}" reaberto.`);
      return;
    }

    toast.success(`Card "${targetEvent.title}" marcado como feito.`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HomeHeader events={visibleEvents} currentDate={currentDate} />
        <TodayScheduleCard
          metrics={metrics}
          periods={visiblePeriods}
          currentDate={currentDate}
          dayRange={dayRange}
          onDayRangeChange={handleDayRangeChange}
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
