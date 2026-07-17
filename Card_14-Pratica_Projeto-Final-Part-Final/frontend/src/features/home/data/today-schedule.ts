import {
  BriefcaseBusiness,
  Coffee,
  Moon,
  Sun,
  Utensils,
} from "lucide-react";

import type { ScheduleMetric, SchedulePeriod } from "../types/schedule";
import { getScheduleRangeLabels } from "../utils/schedule-time";

const completedBlocks = 0;
const totalBlocks = 0;

export const TODAY_SCHEDULE_PERIODS: SchedulePeriod[] = [
  {
    id: "morning",
    label: "Manhã",
    icon: Sun,
    startHour: 6,
    endHour: 12,
    rangeLabels: getScheduleRangeLabels(6 * 60, 12 * 60),
    events: [],
  },
  {
    id: "lunch",
    label: "Almoço",
    icon: Utensils,
    startHour: 12,
    endHour: 13,
    rangeLabels: getScheduleRangeLabels(12 * 60, 13 * 60),
    events: [],
  },
  {
    id: "afternoon",
    label: "Tarde",
    icon: Coffee,
    startHour: 13,
    endHour: 18,
    rangeLabels: getScheduleRangeLabels(13 * 60, 18 * 60),
    events: [],
  },
  {
    id: "night",
    label: "Noite",
    icon: Moon,
    startHour: 18,
    endHour: 22,
    rangeLabels: getScheduleRangeLabels(18 * 60, 22 * 60),
    events: [],
  },
];

export const TODAY_SCHEDULE_METRICS: ScheduleMetric[] = [
  {
    id: "completed-blocks",
    icon: BriefcaseBusiness,
    label: `${completedBlocks}/${totalBlocks} feitas`,
  },
];
