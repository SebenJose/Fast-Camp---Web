"use client";

import { QueryErrorState } from "@/shared/components/query-error-state";

import { useDashboardMetricsQuery } from "../hooks/use-dashboard-metrics-query";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";
import { DashboardSummaryGrid } from "./DashboardSummaryGrid";
import { ProductivityChartsSection } from "./ProductivityChartsSection";
import { TokenUsageChartCard } from "./TokenUsageChartCard";

export function DashboardPage() {
  const { data: metrics, isPending, isError, refetch } =
    useDashboardMetricsQuery();

  if (isPending) {
    return <DashboardPageSkeleton />;
  }

  if (isError || !metrics) {
    return (
      <QueryErrorState
        title="Não foi possível carregar as métricas."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <DashboardHeader />
        <DashboardSummaryGrid metrics={metrics} />
        <TokenUsageChartCard weeklyTokens={metrics.weeklyTokens} />
        <ProductivityChartsSection
          weeklyTasks={metrics.weeklyTasks}
          dailyInteractions={metrics.dailyInteractions}
        />
      </div>
    </main>
  );
}
