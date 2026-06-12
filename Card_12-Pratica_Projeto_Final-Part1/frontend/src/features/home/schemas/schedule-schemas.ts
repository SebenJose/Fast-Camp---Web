import { z } from "zod";

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function getTimeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export const scheduleTimeSchema = z
  .string()
  .regex(scheduleTimePattern, "Informe um horario no formato HH:mm.");

export const scheduleEventToneSchema = z.enum([
  "slate",
  "mint",
  "sky",
  "amber",
  "rose",
]);

export const scheduleDayRangeSchema = z
  .object({
    startTime: scheduleTimeSchema,
    endTime: scheduleTimeSchema,
  })
  .refine(
    (dayRange) =>
      getTimeMinutes(dayRange.endTime) > getTimeMinutes(dayRange.startTime),
    {
      message: "O fim do dia precisa ser depois do começo.",
      path: ["endTime"],
    },
  );

export const scheduleEventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().trim().min(1, "Informe um título para criar o card."),
    startTime: scheduleTimeSchema,
    endTime: scheduleTimeSchema,
    tone: scheduleEventToneSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (event) => getTimeMinutes(event.endTime) > getTimeMinutes(event.startTime),
    {
      message: "O fim do card precisa ser depois do inicio.",
      path: ["endTime"],
    },
  );

export const scheduleEventFormValuesSchema = z
  .object({
    title: z.string().trim().min(1, "Informe um título para criar o card."),
    startTime: scheduleTimeSchema,
    endTime: scheduleTimeSchema,
    tone: scheduleEventToneSchema,
  })
  .refine(
    (event) => getTimeMinutes(event.endTime) > getTimeMinutes(event.startTime),
    {
      message: "O fim do card precisa ser depois do inicio.",
      path: ["endTime"],
    },
  );

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
