import { useQuery } from "@tanstack/react-query";

import { getUserSchedule } from "../api/schedule-api";

export function getScheduleQueryKey(userId: string): readonly ["schedule", string] {
  return ["schedule", userId];
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

export function useScheduleQuery(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryFn: () => fetchUserSchedule(getRequiredUserId(userId)),
    queryKey: getScheduleQueryKey(userId ?? ""),
  });
}
