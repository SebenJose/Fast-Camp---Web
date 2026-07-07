import { useMemo } from "react";

import { TODAY_SCHEDULE_METRICS } from "../data/today-schedule";
import type { ScheduleEvent } from "../types/schedule";

export function useScheduleMetrics(visibleEvents: ScheduleEvent[]) {
  return useMemo(() => {
    const completedBlocks = visibleEvents.filter((event) => event.completed).length;

    return TODAY_SCHEDULE_METRICS.map((metric) => {
      if (metric.id === "completed-blocks") {
        return {
          ...metric,
          label: `${completedBlocks}/${visibleEvents.length} feitas`,
        };
      }

      return metric;
    });
  }, [visibleEvents]);
}
