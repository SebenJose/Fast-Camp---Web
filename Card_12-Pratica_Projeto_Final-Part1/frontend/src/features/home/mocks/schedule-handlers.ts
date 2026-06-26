import { http, HttpResponse } from "msw";

import { TODAY_SCHEDULE_PERIODS } from "../data/today-schedule";
import {
  createUserScheduleEvent,
  deleteUserScheduleEvent,
  loadUserStoredSchedule,
  toggleUserScheduleEventCompleted,
  updateUserScheduleDayRange,
} from "../lib/schedule-storage";
import {
  scheduleDayRangeRequestSchema,
  scheduleEventRequestSchema,
  scheduleUserRequestSchema,
} from "../schemas/schedule-schemas";

function getEventId(value: string | readonly string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const scheduleHandlers = [
  http.get("/api/schedule", ({ request }) => {
    const url = new URL(request.url);
    const parsedRequest = scheduleUserRequestSchema.safeParse({
      userId: url.searchParams.get("userId"),
    });

    if (!parsedRequest.success) {
      return HttpResponse.json(
        { message: "Usuario da agenda nao informado." },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      schedule: loadUserStoredSchedule(
        parsedRequest.data.userId,
        TODAY_SCHEDULE_PERIODS,
      ),
    });
  }),

  http.patch("/api/schedule/day-range", async ({ request }) => {
    const parsedRequest = scheduleDayRangeRequestSchema.safeParse(
      await request.json(),
    );

    if (!parsedRequest.success) {
      return HttpResponse.json(
        { message: "Revise o horario do dia e tente novamente." },
        { status: 400 },
      );
    }

    const schedule = updateUserScheduleDayRange(
      parsedRequest.data.userId,
      parsedRequest.data.dayRange,
      TODAY_SCHEDULE_PERIODS,
    );

    if (!schedule) {
      return HttpResponse.json(
        { message: "Nao foi possivel atualizar o horario do dia." },
        { status: 400 },
      );
    }

    return HttpResponse.json({ schedule });
  }),

  http.post("/api/schedule/events", async ({ request }) => {
    const parsedRequest = scheduleEventRequestSchema.safeParse(
      await request.json(),
    );

    if (!parsedRequest.success) {
      return HttpResponse.json(
        { message: "Revise os dados do card e tente novamente." },
        { status: 400 },
      );
    }

    const result = createUserScheduleEvent(
      parsedRequest.data.userId,
      parsedRequest.data.event,
      TODAY_SCHEDULE_PERIODS,
    );

    if (!result.ok) {
      return HttpResponse.json({ message: result.message }, { status: 400 });
    }

    return HttpResponse.json({ schedule: result.schedule }, { status: 201 });
  }),

  http.delete("/api/schedule/events/:eventId", ({ params, request }) => {
    const url = new URL(request.url);
    const eventId = getEventId(params.eventId);
    const parsedRequest = scheduleUserRequestSchema.safeParse({
      userId: url.searchParams.get("userId"),
    });

    if (!eventId || !parsedRequest.success) {
      return HttpResponse.json(
        { message: "Card ou usuario da agenda nao informado." },
        { status: 400 },
      );
    }

    const result = deleteUserScheduleEvent(
      parsedRequest.data.userId,
      eventId,
      TODAY_SCHEDULE_PERIODS,
    );

    if (!result.ok) {
      const status = result.message === "Card nao encontrado." ? 404 : 400;

      return HttpResponse.json({ message: result.message }, { status });
    }

    return HttpResponse.json({ schedule: result.schedule });
  }),

  http.patch(
    "/api/schedule/events/:eventId/completed",
    async ({ params, request }) => {
      const eventId = getEventId(params.eventId);
      const parsedRequest = scheduleUserRequestSchema.safeParse(
        await request.json(),
      );

      if (!eventId || !parsedRequest.success) {
        return HttpResponse.json(
          { message: "Card ou usuario da agenda nao informado." },
          { status: 400 },
        );
      }

      const result = toggleUserScheduleEventCompleted(
        parsedRequest.data.userId,
        eventId,
        TODAY_SCHEDULE_PERIODS,
      );

      if (!result.ok) {
        return HttpResponse.json({ message: result.message }, { status: 400 });
      }

      return HttpResponse.json({ schedule: result.schedule });
    },
  ),
];
