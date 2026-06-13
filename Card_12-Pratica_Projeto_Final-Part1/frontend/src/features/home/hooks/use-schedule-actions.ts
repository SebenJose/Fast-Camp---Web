import { useState } from "react";
import { toast } from "sonner";

import { INITIAL_SCHEDULE_EVENT_FORM_VALUES } from "../constants/schedule";
import { scheduleDayRangeSchema } from "../schemas/schedule-schemas";
import type {
  ScheduleDayRange,
  ScheduleEventFormValues,
  SchedulePeriod,
} from "../types/schedule";
import {
  getTimeFromMinutes,
  getTimeRangeFromTimeValues,
  isTimeRangeInsideDayRange,
  isTimeRangeStartingInsidePeriod,
} from "../utils/schedule-time";

import { useScheduleMutations } from "./use-schedule-mutations";

const SCHEDULE_EVENT_VALIDATION_TOAST_ID = "schedule-event-validation";

type UseScheduleActionsParams = {
  userId: string | undefined;
  dayRange: ScheduleDayRange;
  periods: SchedulePeriod[];
  visiblePeriods: SchedulePeriod[];
};

function getFirstIssueMessage(
  issues: readonly { message: string }[],
  fallbackMessage: string,
) {
  return issues[0]?.message ?? fallbackMessage;
}

function showScheduleEventValidationToast(message: string) {
  toast.warning(message, { id: SCHEDULE_EVENT_VALIDATION_TOAST_ID });
}

export function useScheduleActions({
  userId,
  dayRange,
  periods,
  visiblePeriods,
}: UseScheduleActionsParams) {
  const [eventFormValues, setEventFormValues] = useState(
    INITIAL_SCHEDULE_EVENT_FORM_VALUES,
  );
  const {
    createEventMutation,
    deleteEventMutation,
    pendingScheduleAction,
    toggleEventMutation,
    updateDayRangeMutation,
  } = useScheduleMutations();

  function canStartScheduleAction() {
    if (pendingScheduleAction) {
      toast.info("Aguarde a atualização atual terminar.");
      return false;
    }

    return true;
  }

  async function addEvent(eventValues: ScheduleEventFormValues) {
    if (!userId) {
      toast.error("Entre novamente para atualizar sua agenda.");
      return false;
    }

    const eventRange = getTimeRangeFromTimeValues(eventValues);

    if (!isTimeRangeInsideDayRange(eventRange, dayRange)) {
      showScheduleEventValidationToast(
        "Esse horário está fora do intervalo visível do dia.",
      );
      return false;
    }

    const targetPeriod = visiblePeriods.find((period) =>
      isTimeRangeStartingInsidePeriod(eventRange, period),
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

    const endMinutes = eventRange.endMinutes;
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
      nextDayRange.startMinutes === dayRange.startMinutes &&
      nextDayRange.endMinutes === dayRange.endMinutes
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
      `Horário do dia atualizado: ${getTimeFromMinutes(
        parsedDayRange.data.startMinutes,
      )} - ${getTimeFromMinutes(parsedDayRange.data.endMinutes)}.`,
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
    eventFormValues,
    pendingScheduleAction,
    addEvent,
    deleteEvent,
    toggleEventCompleted,
    updateDayRange,
  };
}
