import { z } from "zod";

import { getMinutesFromTime } from "../utils/schedule-time";

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleTimeSchema = z
  .string()
  .regex(scheduleTimePattern, "Informe um horario no formato HH:mm.");
export const scheduleMinutesSchema = z.number().int().min(0).max(23 * 60 + 59);

export const scheduleEventToneSchema = z.enum([
  "slate",
  "mint",
  "sky",
  "amber",
  "rose",
]);

export const scheduleTimeRangeSchema = z
  .object({
    startMinutes: scheduleMinutesSchema,
    endMinutes: scheduleMinutesSchema,
  })
  .refine((timeRange) => timeRange.endMinutes > timeRange.startMinutes, {
    message: "O fim precisa ser depois do começo.",
    path: ["endMinutes"],
  });

function isEndTimeAfterStartTime(timeRange: {
  startTime: string;
  endTime: string;
}) {
  return (
    getMinutesFromTime(timeRange.endTime) >
    getMinutesFromTime(timeRange.startTime)
  );
}

const timeRangeFormValuesObjectSchema = z.object({
  startTime: scheduleTimeSchema,
  endTime: scheduleTimeSchema,
});

export const scheduleTimeRangeFormValuesSchema =
  timeRangeFormValuesObjectSchema.refine(isEndTimeAfterStartTime, {
    message: "O fim precisa ser depois do começo.",
    path: ["endTime"],
  });

const scheduleTimeRangeFromFormValuesSchema =
  scheduleTimeRangeFormValuesSchema.transform((timeRange) => ({
    startMinutes: getMinutesFromTime(timeRange.startTime),
    endMinutes: getMinutesFromTime(timeRange.endTime),
  }));

const storedScheduleTimeRangeSchema = z
  .union([scheduleTimeRangeSchema, scheduleTimeRangeFromFormValuesSchema])
  .pipe(scheduleTimeRangeSchema);

const scheduleEventBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Informe um título para criar o card."),
  tone: scheduleEventToneSchema.optional(),
  completed: z.boolean().optional(),
});

export const scheduleDayRangeSchema = storedScheduleTimeRangeSchema;

export const scheduleDayRangeFormValuesSchema =
  timeRangeFormValuesObjectSchema.refine(isEndTimeAfterStartTime, {
    message: "O fim do dia precisa ser depois do começo.",
    path: ["endTime"],
  });

export const scheduleEventSchema = z
  .union([
    scheduleEventBaseSchema.merge(scheduleTimeRangeSchema),
    scheduleEventBaseSchema
      .extend({
        startTime: scheduleTimeSchema,
        endTime: scheduleTimeSchema,
      })
      .transform((event) => ({
        id: event.id,
        title: event.title,
        tone: event.tone,
        completed: event.completed,
        startMinutes: getMinutesFromTime(event.startTime),
        endMinutes: getMinutesFromTime(event.endTime),
      })),
  ])
  .pipe(scheduleEventBaseSchema.merge(scheduleTimeRangeSchema));

export const scheduleEventFormValuesSchema = z
  .object({
    title: z.string().trim().min(1, "Informe um título para criar o card."),
    startTime: scheduleTimeSchema,
    endTime: scheduleTimeSchema,
    tone: scheduleEventToneSchema,
  })
  .refine(isEndTimeAfterStartTime, {
    message: "O fim do card precisa ser depois do inicio.",
    path: ["endTime"],
  });

export const storedScheduleSchema = z.object({
  dayRange: scheduleDayRangeSchema,
  eventsByPeriodId: z.record(z.string().min(1), z.array(scheduleEventSchema)),
});

export const scheduleApiResponseSchema = z.object({
  message: z.string().optional(),
  schedule: storedScheduleSchema.optional(),
});

export const scheduleUserRequestSchema = z.object({
  userId: z.string().min(1),
});

export const scheduleDayRangeRequestSchema = scheduleUserRequestSchema.extend({
  dayRange: scheduleDayRangeSchema,
});

export const scheduleEventRequestSchema = scheduleUserRequestSchema.extend({
  event: scheduleEventFormValuesSchema,
});

export type StoredSchedule = z.infer<typeof storedScheduleSchema>;
export type ScheduleApiResponse = z.infer<typeof scheduleApiResponseSchema>;
