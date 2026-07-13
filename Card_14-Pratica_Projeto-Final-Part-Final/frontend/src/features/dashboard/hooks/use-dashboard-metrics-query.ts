import { useQuery } from "@tanstack/react-query";

import { getDashboardMetrics } from "../api/dashboard-api";

async function fetchDashboardMetrics() {
  const metrics = await getDashboardMetrics();

  if (!metrics) {
    throw new Error("Não foi possível carregar as métricas.");
  }

  return metrics;
}

export function useDashboardMetricsQuery() {
  return useQuery({
    queryFn: fetchDashboardMetrics,
    queryKey: ["dashboard-metrics"],
  });
}
