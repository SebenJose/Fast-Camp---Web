import { authHandlers } from "@/features/auth/mocks/auth-handlers";
import { scheduleHandlers } from "@/features/home/mocks/schedule-handlers";

export const handlers = [...authHandlers, ...scheduleHandlers];
