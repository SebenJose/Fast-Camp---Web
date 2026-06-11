export const TOKEN_WEEKLY_LIMIT = 100_000;
export const TOKEN_WEEKLY_USED = 68_400;

export const TOKEN_USAGE_DATA = [
  {
    name: "Tokens usados",
    value: Math.round((TOKEN_WEEKLY_USED / TOKEN_WEEKLY_LIMIT) * 100),
    fill: "var(--color-used)",
  },
];

export const WEEKLY_TASK_COMPLETION_DATA = [
  { day: "Dom", completed: 3, pending: 1 },
  { day: "Seg", completed: 7, pending: 2 },
  { day: "Ter", completed: 5, pending: 3 },
  { day: "Qua", completed: 8, pending: 1 },
  { day: "Qui", completed: 6, pending: 2 },
  { day: "Sex", completed: 9, pending: 1 },
  { day: "Sáb", completed: 4, pending: 2 },
];

export const DAILY_INTERACTIONS_DATA = [
  { day: "Dom", interactions: 12 },
  { day: "Seg", interactions: 24 },
  { day: "Ter", interactions: 18 },
  { day: "Qua", interactions: 29 },
  { day: "Qui", interactions: 22 },
  { day: "Sex", interactions: 31 },
  { day: "Sáb", interactions: 16 },
];

export const DASHBOARD_SUMMARY_CARDS = [
  {
    id: "messages",
    label: "Mensagens trocadas",
    value: "152",
    description: "Conversas simuladas nesta semana",
  },
  {
    id: "tokens",
    label: "Tokens consumidos",
    value: TOKEN_WEEKLY_USED.toLocaleString("pt-BR"),
    description: `${TOKEN_WEEKLY_LIMIT.toLocaleString("pt-BR")} tokens disponíveis`,
  },
  {
    id: "tasks",
    label: "Tarefas cumpridas",
    value: "42",
    description: "Cards marcados como feitos",
  },
  {
    id: "usage",
    label: "Tempo de uso",
    value: "6h 35min",
    description: "Uso estimado da IA e agenda",
  },
];
