import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";

import type { SchedulePeriod } from "../types/schedule";

import { ScheduleTimeline } from "./ScheduleTimeline";

type SchedulePeriodCardProps = {
  period: SchedulePeriod;
  currentDate: Date;
  onOpenEvent: (eventId: string) => void;
};

export function SchedulePeriodCard({
  period,
  currentDate,
  onOpenEvent,
}: SchedulePeriodCardProps) {
  const Icon = period.icon;

  return (
    <article>
      <Card className="gap-0 rounded-[22px] border border-app-border bg-input-opaque/55 p-0 ring-0">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-[8rem_1fr] sm:gap-5 sm:p-5">
          <div className="flex h-full items-center justify-center">
            <Badge
              variant="inverted"
              size="lg"
              className="font-black uppercase shadow-lg shadow-black/20"
            >
              <Icon size={15} strokeWidth={2.1} aria-hidden="true" />
              {period.label}
            </Badge>
          </div>

          <ScheduleTimeline
            period={period}
            currentDate={currentDate}
            onOpenEvent={onOpenEvent}
          />
        </CardContent>
      </Card>
    </article>
  );
}
