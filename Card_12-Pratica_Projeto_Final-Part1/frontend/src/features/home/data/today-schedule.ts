import {
  BriefcaseBusiness,
  Coffee,
  Moon,
  Sun,
  Utensils,
} from "lucide-react";

import type { ScheduleMetric, SchedulePeriod } from "../types/schedule";

const completedBlocks = 0;
const totalBlocks = 0;

export const TODAY_SCHEDULE_PERIODS: SchedulePeriod[] = [
  {
    id: "morning",
    label: "Manhã",
    icon: Sun,
    startHour: 6,
    endHour: 12,
    rangeLabels: ["06:00", "08:00", "10:00", "12:00"],
    events: [],
  },
  {
    id: "lunch",
    label: "Almoço",
    icon: Utensils,
    startHour: 12,
    endHour: 13,
    rangeLabels: ["12:00", "13:00"],
    events: [],
  },
  {
    id: "afternoon",
    label: "Tarde",
    icon: Coffee,
    startHour: 13,
    endHour: 18,
    rangeLabels: ["13:00", "15:00", "17:00", "18:00"],
    events: [],
  },
  {
    id: "night",
    label: "Noite",
    icon: Moon,
    startHour: 18,
    endHour: 22,
    rangeLabels: ["18:00", "20:00", "22:00"],
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
