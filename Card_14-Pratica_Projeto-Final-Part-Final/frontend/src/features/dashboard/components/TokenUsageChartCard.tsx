"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { WeeklyTokens } from "../schemas/dashboard-schemas";

const chartConfig = {
  value: {
    label: "Uso semanal",
    color: "var(--schedule-sky-bg)",
  },
  used: {
    label: "Tokens usados",
    color: "var(--schedule-sky-bg)",
  },
} satisfies ChartConfig;

export function TokenUsageChartCard({
  weeklyTokens,
}: {
  weeklyTokens: WeeklyTokens;
}) {
  const tokenUsagePercent =
    weeklyTokens.limit > 0
      ? Math.min(
          100,
          Math.round((weeklyTokens.used / weeklyTokens.limit) * 100),
        )
      : 0;
  const tokenUsageData = [
    {
      name: "Tokens usados",
      value: tokenUsagePercent,
      fill: "var(--color-used)",
    },
  ];

  return (
    <section aria-labelledby="tokens-title">
      <div className="mb-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-app-muted">
          Tokens
        </p>
        <h2
          id="tokens-title"
          className="mt-2 text-2xl font-semibold text-primary-title"
        >
          Tokens semanais gastos
        </h2>
      </div>

      <Card className="gap-0 rounded-[24px] border border-app-border bg-opaque-black/80 p-0 ring-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="text-primary-title">
            Consumo da IA
          </CardTitle>
          <CardDescription className="text-secundary-title">
            O círculo cheio representa 100% dos tokens semanais consumidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[24rem_1fr] lg:items-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-72"
          >
            <RadialBarChart
              data={tokenUsageData}
              endAngle={90 - (360 * tokenUsagePercent) / 100}
              innerRadius={92}
              outerRadius={132}
              startAngle={90}
            >
              <PolarAngleAxis
                angleAxisId={0}
                dataKey="value"
                domain={[0, 100]}
                tick={false}
                type="number"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <RadialBar
                background={{ fill: "var(--input-opaque)" }}
                cornerRadius={999}
                dataKey="value"
              />
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-primary-title text-5xl font-semibold"
              >
                {tokenUsagePercent}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-app-muted text-xs font-semibold uppercase tracking-[0.18em]"
              >
                usado
              </text>
            </RadialBarChart>
          </ChartContainer>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-app-border bg-input-opaque/55 p-4">
              <p className="text-xs font-bold uppercase text-app-muted">
                Tokens consumidos
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary-title">
                {weeklyTokens.used.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="rounded-2xl border border-app-border bg-input-opaque/55 p-4">
              <p className="text-xs font-bold uppercase text-app-muted">
                Limite semanal
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary-title">
                {weeklyTokens.limit.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
