"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

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

import type {
  DailyInteractionPoint,
  WeeklyTaskPoint,
} from "../schemas/dashboard-schemas";

const taskChartConfig = {
  completed: {
    label: "Cumpridas",
    color: "var(--schedule-completed-border)",
  },
  pending: {
    label: "Pendentes",
    color: "var(--schedule-amber-bg)",
  },
} satisfies ChartConfig;

const interactionChartConfig = {
  interactions: {
    label: "Interações",
    color: "var(--schedule-mint-bg)",
  },
} satisfies ChartConfig;

export function ProductivityChartsSection({
  weeklyTasks,
  dailyInteractions,
}: {
  weeklyTasks: WeeklyTaskPoint[];
  dailyInteractions: DailyInteractionPoint[];
}) {
  return (
    <section aria-labelledby="productivity-title">
      <div className="mb-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-app-muted">
          Rendimento
        </p>
        <h2
          id="productivity-title"
          className="mt-2 text-2xl font-semibold text-primary-title"
        >
          Rendimento semanal
        </h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="gap-0 rounded-[24px] border border-app-border bg-opaque-black/80 p-0 ring-0">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-primary-title">
              Tarefas da semana
            </CardTitle>
            <CardDescription className="text-secundary-title">
              Cards criados nesta semana, cumpridos e pendentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <ChartContainer config={taskChartConfig} className="h-80 w-full">
              <BarChart data={weeklyTasks}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                  cursor={false}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  fill="var(--color-pending)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-[24px] border border-app-border bg-opaque-black/80 p-0 ring-0">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-primary-title">
              Interações com a IA
            </CardTitle>
            <CardDescription className="text-secundary-title">
              Mensagens enviadas ao assistente nesta semana.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <ChartContainer
              config={interactionChartConfig}
              className="h-80 w-full"
            >
              <LineChart data={dailyInteractions}>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                />
                <Line
                  dataKey="interactions"
                  dot={{
                    fill: "var(--color-interactions)",
                    r: 4,
                  }}
                  stroke="var(--color-interactions)"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
