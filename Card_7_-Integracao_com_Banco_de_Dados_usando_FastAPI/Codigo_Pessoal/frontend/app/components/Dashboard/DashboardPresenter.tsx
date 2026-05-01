"use client"

import { DashboardView } from "./DashboardView"
import { DashboardSkeleton } from "./DashboardSkeleton"
import { Skeleton } from "@/app/components/ui"
import { ProtectedRoute } from "../Auth"
import type {
  SurveyResponse,
  FrequencyData,
  ThemeData,
  TimeData,
} from "@/app/types"

interface DashboardPresenterProps {
  data: SurveyResponse[]
  isLoading: boolean
  frequencyData: FrequencyData[]
  themeData: ThemeData[]
  timeData: TimeData[]
  dailyReadingPercentage: number
}

export function DashboardPresenter({
  data,
  isLoading,
  frequencyData,
  themeData,
  timeData,
  dailyReadingPercentage,
}: DashboardPresenterProps) {
  return (
    <ProtectedRoute>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Leitura
          </h1>
          <div className="flex h-6 items-center gap-1.5">
            {isLoading ? (
              <Skeleton className="h-4 w-64 opacity-70" />
            ) : (
              <p className="text-muted-foreground">
                Resultados reais baseados em {data.length} respostas coletadas.
              </p>
            )}
          </div>
        </header>

        {isLoading ? (
          <DashboardSkeleton hideHeader />
        ) : (
          <DashboardView
            hideHeader
            data={data}
            frequencyData={frequencyData}
            themeData={themeData}
            timeData={timeData}
            dailyReadingPercentage={dailyReadingPercentage}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
