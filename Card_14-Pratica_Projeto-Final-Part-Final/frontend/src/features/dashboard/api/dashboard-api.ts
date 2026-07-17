import { parseApiResponse } from "@/shared/lib/parse-api-response";

import { metricsApiResponseSchema } from "../schemas/dashboard-schemas";

const METRICS_API_URL = "/api/metrics";

export async function getDashboardMetrics() {
  const response = await fetch(METRICS_API_URL).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const data = await parseApiResponse(response, metricsApiResponseSchema);

  return data.metrics ?? null;
}
