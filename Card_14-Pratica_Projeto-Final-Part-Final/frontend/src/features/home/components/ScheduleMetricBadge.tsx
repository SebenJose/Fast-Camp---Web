import { Badge } from "@/shared/components/ui/badge";

import type { ScheduleMetric } from "../types/schedule";

type ScheduleMetricBadgeProps = {
  metric: ScheduleMetric;
};

export function ScheduleMetricBadge({ metric }: ScheduleMetricBadgeProps) {
  const Icon = metric.icon;

  return (
    <Badge
      variant="secondary"
      className="min-w-44 rounded-2xl px-5 py-2.5 text-sm font-bold"
    >
      <Icon size={15} strokeWidth={2} aria-hidden="true" />
      <span>{metric.label}</span>
    </Badge>
  );
}
