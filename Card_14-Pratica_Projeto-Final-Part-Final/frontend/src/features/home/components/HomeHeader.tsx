import { useMemo } from "react";

import type { ScheduleEvent } from "../types/schedule";
import {
  getMinutesFromDate,
  getNextScheduleEvent,
} from "../utils/schedule-time";

type HomeHeaderProps = {
  events: ScheduleEvent[];
  currentDate: Date;
};

function formatCurrentTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNextEventLabel(events: ScheduleEvent[], currentDate: Date) {
  const nextEvent = getNextScheduleEvent(events, currentDate);

  if (!nextEvent) {
    return "sem próximos blocos";
  }

  const minutesUntilEvent =
    nextEvent.startMinutes - getMinutesFromDate(currentDate);

  if (minutesUntilEvent <= 0) {
    return `${nextEvent.title} começa agora`;
  }

  if (minutesUntilEvent < 60) {
    return `${nextEvent.title} em ${minutesUntilEvent} min`;
  }

  const hours = Math.floor(minutesUntilEvent / 60);
  const minutes = minutesUntilEvent % 60;

  return `${nextEvent.title} em ${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
}

export function HomeHeader({ events, currentDate }: HomeHeaderProps) {
  const currentTimeLabel = formatCurrentTime(currentDate);
  const nextEventLabel = useMemo(
    () => getNextEventLabel(events, currentDate),
    [currentDate, events],
  );

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-medium tracking-normal text-primary-title sm:text-6xl">
          Hoje
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-secundary-title sm:text-base">
          Sua rotina diária recorrente, separada por períodos reais do dia: os
          mesmos blocos se repetem a cada dia, para você focar no agora sem
          sobrecarregar a agenda.
        </p>
      </div>

      <div className="flex w-full max-w-64 items-center gap-3 rounded-2xl border border-app-border bg-card-opaque/50 px-5 py-3 text-sm shadow-lg shadow-black/20 lg:mt-8">
        <span className="size-2.5 rounded-full bg-primary-title shadow-[0_0_14px_rgba(243,246,248,0.7)]" />
        <div>
          <p className="font-semibold text-primary-title" suppressHydrationWarning>
            Agora · {currentTimeLabel}
          </p>
          <p className="text-xs text-app-muted">{nextEventLabel}</p>
        </div>
      </div>
    </header>
  );
}
