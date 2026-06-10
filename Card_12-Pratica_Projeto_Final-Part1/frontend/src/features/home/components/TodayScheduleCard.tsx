"use client";

import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import type {
  ScheduleDayRange,
  ScheduleEventFormValues,
  ScheduleMetric,
  SchedulePeriod,
} from "../types/schedule";

import { ScheduleDayRangeForm } from "./ScheduleDayRangeForm";
import { ScheduleEventForm } from "./ScheduleEventForm";
import { SchedulePeriodCard } from "./SchedulePeriodCard";
import { TodayScheduleCardHeader } from "./TodayScheduleCardHeader";

type TodayScheduleCardProps = {
  metrics: ScheduleMetric[];
  periods: SchedulePeriod[];
  dayRange: ScheduleDayRange;
  onDayRangeChange: (value: ScheduleDayRange) => void;
  eventFormValues: ScheduleEventFormValues;
  onEventFormChange: (values: ScheduleEventFormValues) => void;
  onAddEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleEventCompleted: (eventId: string) => void;
};

type ScheduleControlsPanel = "day-range" | "event-form";

export function TodayScheduleCard({
  metrics,
  periods,
  dayRange,
  onDayRangeChange,
  eventFormValues,
  onEventFormChange,
  onAddEvent,
  onDeleteEvent,
  onToggleEventCompleted,
}: TodayScheduleCardProps) {
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [openControlsPanel, setOpenControlsPanel] =
    useState<ScheduleControlsPanel | null>(null);

  function handleOpenEvent(eventId: string) {
    setOpenEventId((currentEventId) =>
      currentEventId === eventId ? null : eventId,
    );
  }

  function handleDeleteEvent(eventId: string) {
    onDeleteEvent(eventId);
    setOpenEventId(null);
  }

  function handleToggleEventCompleted(eventId: string) {
    onToggleEventCompleted(eventId);
    setOpenEventId(null);
  }

  function handleOpenControlsPanel(panel: ScheduleControlsPanel) {
    setOpenControlsPanel((currentPanel) =>
      currentPanel === panel ? null : panel,
    );
  }

  return (
    <section aria-labelledby="today-schedule-title">
      <Card className="gap-0 rounded-[28px] border border-app-border bg-opaque-black/80 p-0 shadow-2xl shadow-black/20 ring-0">
        <TodayScheduleCardHeader metrics={metrics} />

        <CardContent className="space-y-5 px-5 sm:px-7">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={
                openControlsPanel === "day-range" ? "secondary" : "outline"
              }
              onClick={() => handleOpenControlsPanel("day-range")}
              aria-expanded={openControlsPanel === "day-range"}
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Horário do dia
            </Button>

            <Button
              type="button"
              variant={
                openControlsPanel === "event-form" ? "secondary" : "outline"
              }
              onClick={() => handleOpenControlsPanel("event-form")}
              aria-expanded={openControlsPanel === "event-form"}
            >
              <Plus size={16} aria-hidden="true" />
              Novo card
            </Button>
          </div>

          {openControlsPanel === "day-range" ? (
            <ScheduleDayRangeForm
              value={dayRange}
              onChange={onDayRangeChange}
            />
          ) : null}

          {openControlsPanel === "event-form" ? (
            <ScheduleEventForm
              values={eventFormValues}
              onChange={onEventFormChange}
              onSubmit={onAddEvent}
            />
          ) : null}

          {periods.map((period) => (
            <SchedulePeriodCard
              key={period.id}
              period={period}
              openEventId={openEventId}
              onOpenEvent={handleOpenEvent}
              onDeleteEvent={handleDeleteEvent}
              onToggleEventCompleted={handleToggleEventCompleted}
            />
          ))}

          {periods.length === 0 ? (
            <div className="rounded-2xl border border-app-border bg-input-opaque/55 px-4 py-5 text-sm font-medium text-app-muted">
              Ajuste o começo e o fim do dia para exibir a timeline.
            </div>
          ) : null}
        </CardContent>

        <p className="mt-5 px-7 pb-5 text-xs font-medium text-app-muted sm:pb-7">
          Dica: arraste mentalmente o próximo bloco, não o dia inteiro. A tabela
          mostra apenas o necessário para decidir o próximo passo.
        </p>
      </Card>
    </section>
  );
}
