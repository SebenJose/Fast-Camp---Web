"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"

const pieConfig = {
  count: {
    label: "Total",
  },
  diariamente: {
    label: "Diariamente",
    color: "var(--chart-1)",
  },
  semanalmente: {
    label: "Semanalmente",
    color: "var(--chart-2)",
  },
  raramente: {
    label: "Raramente",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const barConfig = {
  count: {
    label: "Respostas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const lineConfig = {
  tecnologia: {
    label: "Tecnologia",
    color: "var(--chart-1)",
  },
  economia: {
    label: "Economia",
    color: "var(--chart-2)",
  },
  educação: {
    label: "Educação",
    color: "var(--chart-3)",
  },
  saúde: {
    label: "Saúde",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

interface DashboardViewProps {
  data: Record<string, unknown>[]
  frequencyData: Record<string, unknown>[]
  themeData: Record<string, unknown>[]
  timeData: Record<string, unknown>[]
  hideHeader?: boolean
}

export function DashboardView({
  data,
  frequencyData,
  themeData,
  timeData,
  hideHeader = false,
}: DashboardViewProps) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col gap-6">
      {!hideHeader && (
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Leitura
          </h1>
          <p className="text-muted-foreground">
            Resultados reais baseados em {data.length} respostas coletadas.
          </p>
        </header>
      )}

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-12">
        <Card className="flex flex-col shadow-sm md:col-span-4">
          <CardHeader className="items-center pb-0">
            <CardTitle>Frequência de Leitura</CardTitle>
            <CardDescription>Distribuição total por hábito</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 text-center">
            <ChartContainer
              config={pieConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={frequencyData}
                  dataKey="count"
                  nameKey="name"
                  label={({ payload, ...props }) => (
                    <text
                      cx={props.cx}
                      cy={props.cy}
                      x={props.x}
                      y={props.y}
                      textAnchor={props.textAnchor}
                      dominantBaseline={props.dominantBaseline}
                      fill="currentColor"
                      fontSize={10}
                      className="fill-foreground/70"
                    >
                      {payload.frequency}
                    </text>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-center text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              {Math.round(
                (((frequencyData.find((f) => f.frequency === "Diariamente")
                  ?.count as number) || 0) /
                  (data.length || 1)) *
                  100
              )}
              % leem diariamente <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        {/* Bar Chart - Temas mais Lidos */}
        <Card className="flex flex-col shadow-sm md:col-span-8">
          <CardHeader className="flex flex-col items-start gap-2">
            <CardTitle>Engajamento por Tema</CardTitle>
            <CardDescription>
              Preferência de assuntos entre os participantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={barConfig}>
              <BarChart
                accessibilityLayer
                data={themeData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="theme"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="var(--chart-1)" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Tema {themeData[0]?.theme as string} é o mais popular no momento
            </div>
          </CardFooter>
        </Card>

        {/* Line Chart - Crescimento Mensal por Tema */}
        <Card className="flex flex-col shadow-sm md:col-span-12">
          <CardHeader>
            <CardTitle>Sazonalidade de Interesses</CardTitle>
            <CardDescription>
              Evolução do volume de respostas por tema nos últimos meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={lineConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={timeData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="tecnologia"
                  type="monotone"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={true}
                />
                <Line
                  dataKey="economia"
                  type="monotone"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  dot={true}
                />
                <Line
                  dataKey="educação"
                  type="monotone"
                  stroke="var(--chart-3)"
                  strokeWidth={3}
                  dot={true}
                />
                <Line
                  dataKey="saúde"
                  type="monotone"
                  stroke="var(--chart-4)"
                  strokeWidth={3}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                Dados atualizados em tempo real{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
