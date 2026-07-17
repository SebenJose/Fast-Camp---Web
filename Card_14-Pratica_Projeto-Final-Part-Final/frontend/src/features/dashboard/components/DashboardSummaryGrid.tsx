import { Card, CardContent } from "@/shared/components/ui/card";

import type { DashboardMetrics } from "../schemas/dashboard-schemas";

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

export function DashboardSummaryGrid({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  const summaryCards = [
    {
      id: "messages",
      label: "Mensagens trocadas",
      value: metrics.totalMessages.toLocaleString("pt-BR"),
      description: "Mensagens enviadas e recebidas no chat",
    },
    {
      id: "tokens",
      label: "Tokens consumidos",
      value: metrics.totalTokens.toLocaleString("pt-BR"),
      description: `${metrics.weeklyTokens.used.toLocaleString("pt-BR")} nesta semana`,
    },
    {
      id: "tasks",
      label: "Tarefas cumpridas",
      value: metrics.completedTasks.toLocaleString("pt-BR"),
      description: "Cards marcados como feitos",
    },
    {
      id: "usage",
      label: "Tempo de uso",
      value: formatMinutes(metrics.aiTimeMinutes),
      description: "Tempo estimado de conversa com a IA",
    },
  ];

  return (
    <section
      aria-label="Resumo do dashboard"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {summaryCards.map((metric) => (
        <Card
          key={metric.id}
          className="gap-0 rounded-2xl border border-app-border bg-input-opaque/55 p-0 ring-0"
        >
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-app-muted">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-primary-title">
              {metric.value}
            </p>
            <p className="mt-2 text-xs font-medium text-secundary-title">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
