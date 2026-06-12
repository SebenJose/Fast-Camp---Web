import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";

import {
  createScheduleEvent,
  deleteScheduleEvent,
  getUserSchedule,
  toggleScheduleEventCompleted,
  updateScheduleDayRange,
} from "../api/schedule-api";
import {
  INITIAL_SCHEDULE_DAY_RANGE,
  INITIAL_SCHEDULE_EVENT_FORM_VALUES,
} from "../constants/schedule";
import {
  TODAY_SCHEDULE_METRICS,
  TODAY_SCHEDULE_PERIODS,
} from "../data/today-schedule";
import {
  scheduleDayRangeSchema,
  scheduleEventFormValuesSchema,
  type StoredSchedule,
} from "../schemas/schedule-schemas";
import type {
  ScheduleDayRange,
  ScheduleEvent,
  SchedulePendingAction,
  SchedulePeriod,
} from "../types/schedule";
import {
  getMinutesFromTime,
  getTimeFromMinutes,
  getVisibleSchedulePeriods,
  isEventInsideDayRange,
  isEventStartingInsidePeriod,
} from "../utils/schedule-time";

const SCHEDULE_EVENT_VALIDATION_TOAST_ID = "schedule-event-validation";

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

function getFirstIssueMessage(
  issues: readonly { message: string }[],
  fallbackMessage: string,
) {
  return issues[0]?.message ?? fallbackMessage;
}

function getUniqueScheduleEvents(events: ScheduleEvent[]) {
  return Array.from(new Map(events.map((event) => [event.id, event])).values());
}

function showScheduleEventValidationToast(message: string) {
  toast.warning(message, { id: SCHEDULE_EVENT_VALIDATION_TOAST_ID });
}

export function useSchedule() {
  const session = useAuthStore((store) => store.session);
  const userId = session?.userId;
  const [periods, setPeriods] = useState(getInitialPeriods);
  const [dayRange, setDayRange] = useState(INITIAL_SCHEDULE_DAY_RANGE);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [pendingScheduleAction, setPendingScheduleAction] =
    useState<SchedulePendingAction | null>(null);
  const [eventFormValues, setEventFormValues] = useState(
    INITIAL_SCHEDULE_EVENT_FORM_VALUES,
  );
  const pendingScheduleActionRef = useRef<SchedulePendingAction | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      pendingScheduleActionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const currentUserId = userId;
    let isActive = true;

    async function hydrateSchedule() {
      setIsLoadingSchedule(true);

      const schedule = await getUserSchedule(currentUserId).catch(() => null);

      if (!isActive) {
        return;
      }

      if (!schedule) {
        setDayRange(INITIAL_SCHEDULE_DAY_RANGE);
        setPeriods(getInitialPeriods());
        setIsLoadingSchedule(false);
        toast.error("Nao foi possivel carregar sua agenda.");
        return;
      }

      setDayRange(schedule.dayRange);
      setPeriods(getPeriodsFromStoredSchedule(schedule));
      setIsLoadingSchedule(false);
    }

    void hydrateSchedule();

    return () => {
      isActive = false;
    };
  }, [userId]);

  const visiblePeriods = useMemo(
    () => getVisibleSchedulePeriods(periods, dayRange),
    [periods, dayRange],
  );
  const visibleEvents = useMemo(
    () =>
      getUniqueScheduleEvents(visiblePeriods.flatMap((period) => period.events)),
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

  function applyStoredSchedule(schedule: StoredSchedule) {
    if (!isMountedRef.current) {
      return;
    }

    setDayRange(schedule.dayRange);
    setPeriods(getPeriodsFromStoredSchedule(schedule));
  }

  function startScheduleAction(action: SchedulePendingAction) {
    if (pendingScheduleActionRef.current) {
      toast.info("Aguarde a atualização atual terminar.");
      return false;
    }

    pendingScheduleActionRef.current = action;
    setPendingScheduleAction(action);
    return true;
  }

  function finishScheduleAction(action: SchedulePendingAction) {
    if (pendingScheduleActionRef.current !== action) {
      return;
    }

    pendingScheduleActionRef.current = null;

    if (isMountedRef.current) {
      setPendingScheduleAction(null);
    }
  }

  async function addEvent() {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const parsedEvent = scheduleEventFormValuesSchema.safeParse(eventFormValues);

    if (!parsedEvent.success) {
      showScheduleEventValidationToast(
        getFirstIssueMessage(
          parsedEvent.error.issues,
          "Preencha um título e um horário válido para criar o card.",
        ),
      );
      return false;
    }

    const eventValues = parsedEvent.data;

    if (!isEventInsideDayRange(eventValues, dayRange)) {
      showScheduleEventValidationToast(
        "Esse horário está fora do intervalo visível do dia.",
      );
      return false;
    }

    const targetPeriod = visiblePeriods.find((period) =>
      isEventStartingInsidePeriod(eventValues, period),
    );

    if (!targetPeriod) {
      showScheduleEventValidationToast(
        "Não foi possível encontrar o período inicial desse card.",
      );
      return false;
    }

    const action = "add-event";

    if (!startScheduleAction(action)) {
      return false;
    }

    try {
      const result = await createScheduleEvent(userId, eventValues);

      if (!isMountedRef.current) {
        return false;
      }

      if (!result.ok) {
        toast.error(result.message);
        return false;
      }

      const endMinutes = getMinutesFromTime(eventValues.endTime);
      const nextStartMinutes = endMinutes;
      const nextEndMinutes = Math.min(endMinutes + 30, targetPeriod.endHour * 60);
      const hasNextSlot = nextEndMinutes > nextStartMinutes;

      applyStoredSchedule(result.schedule);
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
      return true;
    } finally {
      finishScheduleAction(action);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const deletedEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);
    const action = "delete-event";

    if (!startScheduleAction(action)) {
      return false;
    }

    try {
      const result = await deleteScheduleEvent(userId, eventId);

      if (!isMountedRef.current) {
        return false;
      }

      if (!result.ok) {
        toast.error(result.message);
        return false;
      }

      applyStoredSchedule(result.schedule);
      toast.success(
        deletedEvent ? `Card "${deletedEvent.title}" excluído.` : "Card excluído.",
      );
      return true;
    } finally {
      finishScheduleAction(action);
    }
  }

  async function updateDayRange(nextDayRange: ScheduleDayRange) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    if (
      nextDayRange.startTime === dayRange.startTime &&
      nextDayRange.endTime === dayRange.endTime
    ) {
      return true;
    }

    const parsedDayRange = scheduleDayRangeSchema.safeParse(nextDayRange);

    if (!parsedDayRange.success) {
      toast.warning(
        getFirstIssueMessage(
          parsedDayRange.error.issues,
          "O fim do dia precisa ser depois do começo.",
        ),
      );
      return false;
    }

    const action = "day-range";

    if (!startScheduleAction(action)) {
      return false;
    }

    try {
      const result = await updateScheduleDayRange(userId, parsedDayRange.data);

      if (!isMountedRef.current) {
        return false;
      }

      if (!result.ok) {
        toast.error(result.message);
        return false;
      }

      applyStoredSchedule(result.schedule);
      toast.success(
        `Horário do dia atualizado: ${parsedDayRange.data.startTime} - ${parsedDayRange.data.endTime}.`,
      );
      return true;
    } finally {
      finishScheduleAction(action);
    }
  }

  async function toggleEventCompleted(eventId: string) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const targetEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);
    const action = "toggle-event";

    if (!startScheduleAction(action)) {
      return false;
    }

    try {
      const result = await toggleScheduleEventCompleted(userId, eventId);

      if (!isMountedRef.current) {
        return false;
      }

      if (!result.ok) {
        toast.error(result.message);
        return false;
      }

      applyStoredSchedule(result.schedule);

      if (!targetEvent) {
        return true;
      }

      if (targetEvent.completed) {
        toast.info(`Card "${targetEvent.title}" reaberto.`);
        return true;
      }

      toast.success(`Card "${targetEvent.title}" marcado como feito.`);
      return true;
    } finally {
      finishScheduleAction(action);
    }
  }

  return {
    currentDate,
    dayRange,
    eventFormValues,
    isLoadingSchedule,
    metrics,
    pendingScheduleAction,
    setEventFormValues,
    visibleEvents,
    visiblePeriods,
    addEvent,
    deleteEvent,
    toggleEventCompleted,
    updateDayRange,
  };
}
