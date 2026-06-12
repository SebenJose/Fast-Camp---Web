"use client";

import { useSchedule } from "../hooks/use-schedule";

import { HomeHeader } from "./HomeHeader";
import { HomePageSkeleton } from "./HomePageSkeleton";
import { TodayScheduleCard } from "./TodayScheduleCard";

export function HomePage() {
  const schedule = useSchedule();

  if (schedule.isLoadingSchedule) {
    return <HomePageSkeleton />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HomeHeader
          events={schedule.visibleEvents}
          currentDate={schedule.currentDate}
        />
        <TodayScheduleCard
          metrics={schedule.metrics}
          periods={schedule.visiblePeriods}
          currentDate={schedule.currentDate}
          dayRange={schedule.dayRange}
          pendingAction={schedule.pendingScheduleAction}
          onDayRangeChange={schedule.updateDayRange}
          eventFormValues={schedule.eventFormValues}
          onEventFormChange={schedule.setEventFormValues}
          onAddEvent={schedule.addEvent}
          onDeleteEvent={schedule.deleteEvent}
          onToggleEventCompleted={schedule.toggleEventCompleted}
        />
      </div>
    </main>
  );
}
