"use client";

import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import type {
  ScheduleDayRange,
  ScheduleEventFormValues,
  ScheduleMetric,
  SchedulePendingAction,
  SchedulePeriod,
} from "../types/schedule";

import { ScheduleDayRangeForm } from "./ScheduleDayRangeForm";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { ScheduleEventForm } from "./ScheduleEventForm";
import { SchedulePeriodCard } from "./SchedulePeriodCard";
import { TodayScheduleCardHeader } from "./TodayScheduleCardHeader";

type TodayScheduleCardProps = {
  metrics: ScheduleMetric[];
  periods: SchedulePeriod[];
  currentDate: Date;
  dayRange: ScheduleDayRange;
  pendingAction: SchedulePendingAction | null;
  onDayRangeChange: (value: ScheduleDayRange) => Promise<boolean>;
  eventFormValues: ScheduleEventFormValues;
  onAddEvent: (values: ScheduleEventFormValues) => Promise<boolean>;
  onDeleteEvent: (eventId: string) => Promise<boolean>;
  onToggleEventCompleted: (eventId: string) => Promise<boolean>;
};

type ScheduleControlsPanel = "day-range" | "event-form";

export function TodayScheduleCard({
  metrics,
  periods,
  currentDate,
  dayRange,
  pendingAction,
  onDayRangeChange,
  eventFormValues,
  onAddEvent,
  onDeleteEvent,
  onToggleEventCompleted,
}: TodayScheduleCardProps) {
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [openControlsPanel, setOpenControlsPanel] =
    useState<ScheduleControlsPanel | null>(null);
  const selectedEvent =
    periods
      .flatMap((period) => period.events)
      .find((event) => event.id === openEventId) ?? null;
  const isScheduleActionPending = pendingAction !== null;

  function handleOpenEvent(eventId: string) {
    setOpenEventId((currentEventId) =>
      currentEventId === eventId ? null : eventId,
    );
  }

  async function handleDeleteEvent(eventId: string) {
    if (isScheduleActionPending) {
      return;
    }

    const isDeleted = await onDeleteEvent(eventId);

    if (isDeleted) {
      setOpenEventId(null);
    }
  }

  async function handleToggleEventCompleted(eventId: string) {
    if (isScheduleActionPending) {
      return;
    }

    const isUpdated = await onToggleEventCompleted(eventId);

    if (isUpdated) {
      setOpenEventId(null);
    }
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
              disabled={isScheduleActionPending}
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
              disabled={isScheduleActionPending}
            >
              <Plus size={16} aria-hidden="true" />
              Novo card
            </Button>
          </div>

          {openControlsPanel === "day-range" ? (
            <ScheduleDayRangeForm
              key={`${dayRange.startMinutes}-${dayRange.endMinutes}`}
              value={dayRange}
              onSubmit={onDayRangeChange}
              disabled={isScheduleActionPending}
              isSubmitting={pendingAction === "day-range"}
            />
          ) : null}

          {openControlsPanel === "event-form" ? (
            <ScheduleEventForm
              values={eventFormValues}
              onSubmit={onAddEvent}
              disabled={isScheduleActionPending}
              isSubmitting={pendingAction === "add-event"}
            />
          ) : null}

          {periods.map((period) => (
            <SchedulePeriodCard
              key={period.id}
              period={period}
              currentDate={currentDate}
              onOpenEvent={handleOpenEvent}
            />
          ))}

          {periods.length === 0 ? (
            <div className="rounded-2xl border border-app-border bg-input-opaque/55 px-4 py-5 text-sm font-medium text-app-muted">
              Ajuste o começo e o fim do dia para exibir a timeline.
            </div>
          ) : null}
        </CardContent>

        <p className="mt-5 px-7 pb-5 text-xs font-medium text-app-muted sm:pb-7">
          Selecione um card para marcar como feito, reabrir ou remover da
          agenda. As alterações ficam salvas automaticamente para esta conta.
        </p>
      </Card>

      <ScheduleEventDialog
        event={selectedEvent}
        open={selectedEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenEventId(null);
          }
        }}
        onDelete={handleDeleteEvent}
        onToggleCompleted={handleToggleEventCompleted}
        disabled={isScheduleActionPending}
        isDeleting={pendingAction === "delete-event"}
        isToggling={pendingAction === "toggle-event"}
      />
    </section>
  );
}
