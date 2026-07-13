import { z } from "zod";

export const weeklyTokensSchema = z.object({
  used: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
});

export const weeklyTaskPointSchema = z.object({
  day: z.string().min(1),
  completed: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});

export const dailyInteractionPointSchema = z.object({
  day: z.string().min(1),
  interactions: z.number().int().nonnegative(),
});

export const dashboardMetricsSchema = z.object({
  totalMessages: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  aiTimeMinutes: z.number().int().nonnegative(),
  weeklyTokens: weeklyTokensSchema,
  weeklyTasks: z.array(weeklyTaskPointSchema),
  dailyInteractions: z.array(dailyInteractionPointSchema),
});

export const metricsApiResponseSchema = z.object({
  message: z.string().nullish(),
  metrics: dashboardMetricsSchema.nullish(),
});

export type WeeklyTokens = z.infer<typeof weeklyTokensSchema>;
export type WeeklyTaskPoint = z.infer<typeof weeklyTaskPointSchema>;
export type DailyInteractionPoint = z.infer<typeof dailyInteractionPointSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
