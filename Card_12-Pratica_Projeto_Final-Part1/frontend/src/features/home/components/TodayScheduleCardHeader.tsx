import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { ScheduleMetric } from "../types/schedule";

import { ScheduleMetricBadge } from "./ScheduleMetricBadge";

type TodayScheduleCardHeaderProps = {
  metrics: ScheduleMetric[];
};

export function TodayScheduleCardHeader({
  metrics,
}: TodayScheduleCardHeaderProps) {
  return (
    <CardHeader className="mb-7 flex flex-col gap-4 px-5 pt-5 lg:flex-row lg:items-start lg:justify-between sm:px-7 sm:pt-7">
      <div>
        <CardTitle
          id="today-schedule-title"
          className="text-2xl font-semibold text-primary-title"
        >
          Agenda de hoje
        </CardTitle>
        <CardDescription className="mt-1 text-sm font-medium text-secundary-title">
          Blocos organizados por período, com horários relevantes apenas para
          aquela parte do dia.
        </CardDescription>
      </div>

      <div className="flex flex-wrap gap-3">
        {metrics.map((metric) => (
          <ScheduleMetricBadge key={metric.id} metric={metric} />
        ))}
      </div>
    </CardHeader>
  );
}
