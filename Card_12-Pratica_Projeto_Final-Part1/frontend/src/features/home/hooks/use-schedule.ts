import { useScheduleActions } from "./use-schedule-actions";
import { useScheduleHydration } from "./use-schedule-hydration";
import { useScheduleMetrics } from "./use-schedule-metrics";

export function useSchedule() {
  const scheduleHydration = useScheduleHydration();
  const metrics = useScheduleMetrics(scheduleHydration.visibleEvents);
  const scheduleActions = useScheduleActions({
    dayRange: scheduleHydration.dayRange,
    periods: scheduleHydration.periods,
    userId: scheduleHydration.userId,
    visiblePeriods: scheduleHydration.visiblePeriods,
  });

  return {
    currentDate: scheduleHydration.currentDate,
    dayRange: scheduleHydration.dayRange,
    eventFormValues: scheduleActions.eventFormValues,
    isLoadingSchedule: scheduleHydration.isLoadingSchedule,
    metrics,
    pendingScheduleAction: scheduleActions.pendingScheduleAction,
    visibleEvents: scheduleHydration.visibleEvents,
    visiblePeriods: scheduleHydration.visiblePeriods,
    addEvent: scheduleActions.addEvent,
    deleteEvent: scheduleActions.deleteEvent,
    toggleEventCompleted: scheduleActions.toggleEventCompleted,
    updateDayRange: scheduleActions.updateDayRange,
  };
}
