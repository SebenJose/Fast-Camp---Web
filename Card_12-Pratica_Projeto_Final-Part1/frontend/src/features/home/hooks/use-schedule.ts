import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth";

import {
  createScheduleEvent,
  deleteScheduleEvent,
  getUserSchedule,
  type ScheduleActionResult,
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
  ScheduleEventFormValues,
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

type ScheduleUserMutationVariables = {
  userId: string;
};

type CreateScheduleEventMutationVariables = ScheduleUserMutationVariables & {
  eventValues: ScheduleEventFormValues;
};

type UpdateScheduleDayRangeMutationVariables = ScheduleUserMutationVariables & {
  dayRange: ScheduleDayRange;
};

type ScheduleEventIdMutationVariables = ScheduleUserMutationVariables & {
  eventId: string;
};

function getScheduleQueryKey(userId: string): readonly ["schedule", string] {
  return ["schedule", userId];
}

function getScheduleMutationKey(
  action: SchedulePendingAction,
): readonly ["schedule", SchedulePendingAction] {
  return ["schedule", action];
}

function getRequiredUserId(userId: string | undefined) {
  if (!userId) {
    throw new Error("Sessao invalida para carregar a agenda.");
  }

  return userId;
}

async function fetchUserSchedule(userId: string) {
  const schedule = await getUserSchedule(userId);

  if (!schedule) {
    throw new Error("Nao foi possivel carregar sua agenda.");
  }

  return schedule;
}

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
  const queryClient = useQueryClient();
  const session = useAuthStore((store) => store.session);
  const userId = session?.userId;
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [eventFormValues, setEventFormValues] = useState(
    INITIAL_SCHEDULE_EVENT_FORM_VALUES,
  );

  const scheduleQuery = useQuery({
    enabled: Boolean(userId),
    queryFn: () => fetchUserSchedule(getRequiredUserId(userId)),
    queryKey: getScheduleQueryKey(userId ?? ""),
  });

  function cacheScheduleResult(
    result: ScheduleActionResult,
    variables: ScheduleUserMutationVariables,
  ) {
    if (!result.ok) {
      return;
    }

    queryClient.setQueryData<StoredSchedule>(
      getScheduleQueryKey(variables.userId),
      result.schedule,
    );
  }

  const createEventMutation = useMutation({
    mutationFn: ({ eventValues, userId }: CreateScheduleEventMutationVariables) =>
      createScheduleEvent(userId, eventValues),
    mutationKey: getScheduleMutationKey("add-event"),
    onSuccess: (result, variables) => cacheScheduleResult(result, variables),
  });

  const deleteEventMutation = useMutation({
    mutationFn: ({ eventId, userId }: ScheduleEventIdMutationVariables) =>
      deleteScheduleEvent(userId, eventId),
    mutationKey: getScheduleMutationKey("delete-event"),
    onSuccess: (result, variables) => cacheScheduleResult(result, variables),
  });

  const updateDayRangeMutation = useMutation({
    mutationFn: ({ dayRange, userId }: UpdateScheduleDayRangeMutationVariables) =>
      updateScheduleDayRange(userId, dayRange),
    mutationKey: getScheduleMutationKey("day-range"),
    onSuccess: (result, variables) => cacheScheduleResult(result, variables),
  });

  const toggleEventMutation = useMutation({
    mutationFn: ({ eventId, userId }: ScheduleEventIdMutationVariables) =>
      toggleScheduleEventCompleted(userId, eventId),
    mutationKey: getScheduleMutationKey("toggle-event"),
    onSuccess: (result, variables) => cacheScheduleResult(result, variables),
  });

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

  const pendingScheduleAction = useMemo<SchedulePendingAction | null>(() => {
    if (updateDayRangeMutation.isPending) {
      return "day-range";
    }

    if (createEventMutation.isPending) {
      return "add-event";
    }

    if (deleteEventMutation.isPending) {
      return "delete-event";
    }

    if (toggleEventMutation.isPending) {
      return "toggle-event";
    }

    return null;
  }, [
    createEventMutation.isPending,
    deleteEventMutation.isPending,
    toggleEventMutation.isPending,
    updateDayRangeMutation.isPending,
  ]);
  const isLoadingSchedule = !userId || scheduleQuery.isPending;

  function canStartScheduleAction() {
    if (pendingScheduleAction) {
      toast.info("Aguarde a atualização atual terminar.");
      return false;
    }

    return true;
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

    if (!canStartScheduleAction()) {
      return false;
    }

    const result = await createEventMutation.mutateAsync({
      eventValues,
      userId,
    });

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    const endMinutes = getMinutesFromTime(eventValues.endTime);
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
    return true;
  }

  async function deleteEvent(eventId: string) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const deletedEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);

    if (!canStartScheduleAction()) {
      return false;
    }

    const result = await deleteEventMutation.mutateAsync({ eventId, userId });

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    toast.success(
      deletedEvent ? `Card "${deletedEvent.title}" excluído.` : "Card excluído.",
    );
    return true;
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

    if (!canStartScheduleAction()) {
      return false;
    }

    const result = await updateDayRangeMutation.mutateAsync({
      dayRange: parsedDayRange.data,
      userId,
    });

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    toast.success(
      `Horário do dia atualizado: ${parsedDayRange.data.startTime} - ${parsedDayRange.data.endTime}.`,
    );
    return true;
  }

  async function toggleEventCompleted(eventId: string) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const targetEvent = periods
      .flatMap((period) => period.events)
      .find((event) => event.id === eventId);

    if (!canStartScheduleAction()) {
      return false;
    }

    const result = await toggleEventMutation.mutateAsync({ eventId, userId });

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }

    if (!targetEvent) {
      return true;
    }

    if (targetEvent.completed) {
      toast.info(`Card "${targetEvent.title}" reaberto.`);
      return true;
    }

    toast.success(`Card "${targetEvent.title}" marcado como feito.`);
    return true;
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
