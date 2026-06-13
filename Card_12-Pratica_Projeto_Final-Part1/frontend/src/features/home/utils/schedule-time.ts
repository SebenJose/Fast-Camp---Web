import type {
  ScheduleDayRange,
  ScheduleEvent,
  SchedulePeriod,
  ScheduleRangeLabel,
  ScheduleTimeRange,
  ScheduleTimeRangeFormValues,
} from "../types/schedule";

type ScheduleTimeRangeComparison = "inside" | "overlaps" | "starts-inside";

export function getScheduleEventTimeLabel(event: ScheduleEvent) {
  return `${getTimeFromMinutes(event.startMinutes)} - ${getTimeFromMinutes(
    event.endMinutes,
  )}`;
}

export function getMinutesFromTime(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");

  return Number(hours) * 60 + Number(minutes);
}

export function getMinutesFromHour(hour: number) {
  return Math.round(hour * 60);
}

export function getMinutesFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function getTimeFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function getTimeRangeFromTimeValues(
  values: ScheduleTimeRangeFormValues,
): ScheduleTimeRange {
  return {
    startMinutes: getMinutesFromTime(values.startTime),
    endMinutes: getMinutesFromTime(values.endTime),
  };
}

export function sortScheduleEvents(events: ScheduleEvent[]) {
  return [...events].sort(
    (currentEvent, nextEvent) =>
      currentEvent.startMinutes - nextEvent.startMinutes ||
      currentEvent.endMinutes - nextEvent.endMinutes,
  );
}

export function getScheduleRangeLabels(
  startMinutes: number,
  endMinutes: number,
) {
  const labels: ScheduleRangeLabel[] = [
    { label: getTimeFromMinutes(startMinutes), minutes: startMinutes },
  ];
  const labelStepMinutes = 120;
  const nextStep =
    Math.ceil(startMinutes / labelStepMinutes) * labelStepMinutes;

  for (
    let labelMinutes = nextStep;
    labelMinutes < endMinutes;
    labelMinutes += labelStepMinutes
  ) {
    if (labelMinutes > startMinutes) {
      labels.push({
        label: getTimeFromMinutes(labelMinutes),
        minutes: labelMinutes,
      });
    }
  }

  labels.push({ label: getTimeFromMinutes(endMinutes), minutes: endMinutes });

  return Array.from(
    new Map(labels.map((rangeLabel) => [rangeLabel.minutes, rangeLabel])).values(),
  );
}

function getPeriodTimeRange(
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
): ScheduleTimeRange {
  return {
    startMinutes: getMinutesFromHour(period.startHour),
    endMinutes: getMinutesFromHour(period.endHour),
  };
}

function isValidTimeRange(range: ScheduleTimeRange) {
  return range.endMinutes > range.startMinutes;
}

export function compareScheduleTimeRange(
  range: ScheduleTimeRange,
  targetRange: ScheduleTimeRange,
  comparison: ScheduleTimeRangeComparison,
) {
  if (!isValidTimeRange(range) || !isValidTimeRange(targetRange)) {
    return false;
  }

  if (comparison === "inside") {
    return (
      range.startMinutes >= targetRange.startMinutes &&
      range.endMinutes <= targetRange.endMinutes
    );
  }

  if (comparison === "starts-inside") {
    return (
      range.startMinutes >= targetRange.startMinutes &&
      range.startMinutes < targetRange.endMinutes
    );
  }

  return (
    range.startMinutes < targetRange.endMinutes &&
    range.endMinutes > targetRange.startMinutes
  );
}

export function isTimeRangeInsidePeriod(
  range: ScheduleTimeRange,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  return compareScheduleTimeRange(range, getPeriodTimeRange(period), "inside");
}

export function isTimeRangeInsideDayRange(
  range: ScheduleTimeRange,
  dayRange: ScheduleDayRange,
) {
  return compareScheduleTimeRange(range, dayRange, "inside");
}

export function isTimeRangeStartingInsidePeriod(
  range: ScheduleTimeRange,
  period: Pick<SchedulePeriod, "startHour" | "endHour">,
) {
  return compareScheduleTimeRange(
    range,
    getPeriodTimeRange(period),
    "starts-inside",
  );
}

export function getVisibleSchedulePeriods(
  periods: SchedulePeriod[],
  dayRange: ScheduleDayRange,
) {
  const dayStart = dayRange.startMinutes;
  const dayEnd = dayRange.endMinutes;

  if (dayEnd <= dayStart || periods.length === 0) {
    return [];
  }

  const sortedPeriods = [...periods].sort(
    (currentPeriod, nextPeriod) =>
      currentPeriod.startHour - nextPeriod.startHour,
  );
  const events = sortScheduleEvents(periods.flatMap((period) => period.events));
  const firstPeriod = sortedPeriods[0];
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];

  if (dayEnd <= getMinutesFromHour(firstPeriod.startHour)) {
    return [getVisibleSchedulePeriod(firstPeriod, dayStart, dayEnd, events)];
  }

  if (dayStart >= getMinutesFromHour(lastPeriod.endHour)) {
    return [getVisibleSchedulePeriod(lastPeriod, dayStart, dayEnd, events)];
  }

  return sortedPeriods.flatMap((period, index) => {
    const periodStart = getMinutesFromHour(period.startHour);
    const periodEnd = getMinutesFromHour(period.endHour);
    const isFirstPeriod = index === 0;
    const isLastPeriod = index === sortedPeriods.length - 1;
    const visibleStart = isFirstPeriod
      ? Math.min(dayStart, periodEnd)
      : Math.max(periodStart, dayStart);
    const visibleEnd = isLastPeriod
      ? Math.max(dayEnd, periodStart)
      : Math.min(periodEnd, dayEnd);

    if (visibleEnd <= visibleStart) {
      return [];
    }

    return getVisibleSchedulePeriod(period, visibleStart, visibleEnd, events);
  });
}

function getVisibleSchedulePeriod(
  period: SchedulePeriod,
  visibleStart: number,
  visibleEnd: number,
  events: ScheduleEvent[],
) {
  const visibleRange: ScheduleTimeRange = {
    startMinutes: visibleStart,
    endMinutes: visibleEnd,
  };

  return {
    ...period,
    startHour: visibleStart / 60,
    endHour: visibleEnd / 60,
    rangeLabels: getScheduleRangeLabels(visibleStart, visibleEnd),
    events: events.filter((event) =>
      compareScheduleTimeRange(event, visibleRange, "overlaps"),
    ),
  };
}

export function getNextScheduleEvent(
  events: ScheduleEvent[],
  currentDate: Date,
) {
  const currentMinutes = getMinutesFromDate(currentDate);

  return sortScheduleEvents(events).find(
    (event) => !event.completed && event.startMinutes >= currentMinutes,
  );
}

export function isScheduleEventMissed(event: ScheduleEvent, currentDate: Date) {
  return (
    !event.completed && event.endMinutes < getMinutesFromDate(currentDate)
  );
}
