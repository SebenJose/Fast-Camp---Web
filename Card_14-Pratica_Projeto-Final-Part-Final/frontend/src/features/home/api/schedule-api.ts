import { parseApiResponse } from "@/shared/lib/parse-api-response";

import {
  scheduleApiResponseSchema,
  type StoredSchedule,
} from "../schemas/schedule-schemas";
import type { ScheduleDayRange, ScheduleEventFormValues } from "../types/schedule";

const SCHEDULE_API_BASE_URL = "/api/schedule";

export type ScheduleActionResult =
  | {
      ok: true;
      schedule: StoredSchedule;
    }
  | {
      ok: false;
      message: string;
    };

function getScheduleUrl(userId: string) {
  const params = new URLSearchParams({ userId });

  return `${SCHEDULE_API_BASE_URL}?${params.toString()}`;
}

export async function getUserSchedule(userId: string) {
  const response = await fetch(getScheduleUrl(userId)).catch(() => null);

  if (!response) {
    return null;
  }

  const data = await parseApiResponse(response, scheduleApiResponseSchema);

  if (!response.ok) {
    return null;
  }

  return data.schedule ?? null;
}

export async function updateScheduleDayRange(
  userId: string,
  dayRange: ScheduleDayRange,
): Promise<ScheduleActionResult> {
  const response = await fetch(`${SCHEDULE_API_BASE_URL}/day-range`, {
    body: JSON.stringify({ dayRange, userId }),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  }).catch(() => null);

  return readScheduleActionResult(
    response,
    "Nao foi possivel atualizar o horario do dia.",
  );
}

export async function createScheduleEvent(
  userId: string,
  event: ScheduleEventFormValues,
): Promise<ScheduleActionResult> {
  const response = await fetch(`${SCHEDULE_API_BASE_URL}/events`, {
    body: JSON.stringify({ event, userId }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);

  return readScheduleActionResult(response, "Nao foi possivel criar o card.");
}

export async function deleteScheduleEvent(
  userId: string,
  eventId: string,
): Promise<ScheduleActionResult> {
  const params = new URLSearchParams({ userId });
  const response = await fetch(
    `${SCHEDULE_API_BASE_URL}/events/${eventId}?${params.toString()}`,
    { method: "DELETE" },
  ).catch(() => null);

  return readScheduleActionResult(response, "Nao foi possivel excluir o card.");
}

export async function toggleScheduleEventCompleted(
  userId: string,
  eventId: string,
): Promise<ScheduleActionResult> {
  const response = await fetch(
    `${SCHEDULE_API_BASE_URL}/events/${eventId}/completed`,
    {
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    },
  ).catch(() => null);

  return readScheduleActionResult(response, "Nao foi possivel atualizar o card.");
}

async function readScheduleActionResult(
  response: Response | null,
  fallbackMessage: string,
): Promise<ScheduleActionResult> {
  if (!response) {
    return {
      ok: false,
      message: "Nao foi possivel conectar ao servico de agenda.",
    };
  }

  const data = await parseApiResponse(response, scheduleApiResponseSchema);

  if (!response.ok || !data.schedule) {
    return {
      ok: false,
      message: data.message ?? fallbackMessage,
    };
  }

  return {
    ok: true,
    schedule: data.schedule,
  };
}
