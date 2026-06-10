import {
  BriefcaseBusiness,
  Coffee,
  Moon,
  Sparkles,
  Sun,
  Utensils,
} from "lucide-react";

import type { ScheduleMetric, SchedulePeriod } from "../types/schedule";

const completedBlocks = 0;
const totalBlocks = 8;

export const TODAY_SCHEDULE_PERIODS: SchedulePeriod[] = [
  {
    id: "morning",
    label: "Manhã",
    icon: Sun,
    startHour: 6,
    endHour: 12,
    rangeLabels: ["06:00", "08:00", "10:00", "12:00"],
    events: [
      {
        id: "coffee",
        title: "Café e marmitas",
        startTime: "07:10",
        endTime: "07:50",
        tone: "mint",
      },
      {
        id: "planning",
        title: "Planejamento",
        startTime: "09:00",
        endTime: "09:30",
        tone: "sky",
      },
      {
        id: "meeting",
        title: "Reunião",
        startTime: "11:10",
        endTime: "11:45",
        tone: "slate",
      },
    ],
  },
  {
    id: "lunch",
    label: "Almoço",
    icon: Utensils,
    startHour: 12,
    endHour: 13,
    rangeLabels: ["12:00", "13:00"],
    events: [
      {
        id: "screenless-lunch",
        title: "Almoço sem tela",
        startTime: "12:15",
        endTime: "13:00",
        tone: "amber",
      },
    ],
  },
  {
    id: "afternoon",
    label: "Tarde",
    icon: Coffee,
    startHour: 13,
    endHour: 18,
    rangeLabels: ["13:00", "15:00", "17:00", "18:00"],
    events: [
      {
        id: "focus",
        title: "Bloco de foco",
        startTime: "14:10",
        endTime: "15:20",
        tone: "sky",
      },
      {
        id: "exercise",
        title: "Exercício leve",
        startTime: "16:30",
        endTime: "17:10",
        tone: "mint",
      },
    ],
  },
  {
    id: "night",
    label: "Noite",
    icon: Moon,
    startHour: 18,
    endHour: 22,
    rangeLabels: ["18:00", "20:00", "22:00"],
    events: [
      {
        id: "review",
        title: "Revisão curta",
        startTime: "19:20",
        endTime: "19:45",
        tone: "rose",
      },
      {
        id: "screens-off",
        title: "Desligar telas",
        startTime: "21:30",
        endTime: "22:00",
        tone: "slate",
      },
    ],
  },
];

export const TODAY_SCHEDULE_METRICS: ScheduleMetric[] = [
  {
    id: "completed-blocks",
    icon: BriefcaseBusiness,
    label: `${completedBlocks}/${totalBlocks} feitas`,
  },
  {
    id: "next-block",
    icon: Sparkles,
    label: "Próximo: planejamento",
  },
];
