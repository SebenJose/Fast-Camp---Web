import { Card, CardContent } from "@/shared/components/ui/card";

import { DASHBOARD_SUMMARY_CARDS } from "../data/dashboard-metrics";

export function DashboardSummaryGrid() {
  return (
    <section
      aria-label="Resumo do dashboard"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {DASHBOARD_SUMMARY_CARDS.map((metric) => (
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
