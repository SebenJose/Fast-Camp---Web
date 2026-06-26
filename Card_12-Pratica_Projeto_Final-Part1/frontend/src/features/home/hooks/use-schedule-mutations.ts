import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  createScheduleEvent,
  deleteScheduleEvent,
  type ScheduleActionResult,
  toggleScheduleEventCompleted,
  updateScheduleDayRange,
} from "../api/schedule-api";
import type { StoredSchedule } from "../schemas/schedule-schemas";
import type {
  ScheduleDayRange,
  ScheduleEventFormValues,
  SchedulePendingAction,
} from "../types/schedule";

import { getScheduleQueryKey } from "./use-schedule-query";

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

function getScheduleMutationKey(
  action: SchedulePendingAction,
): readonly ["schedule", SchedulePendingAction] {
  return ["schedule", action];
}

export function useScheduleMutations() {
  const queryClient = useQueryClient();

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

  return {
    createEventMutation,
    deleteEventMutation,
    pendingScheduleAction,
    toggleEventMutation,
    updateDayRangeMutation,
  };
}
