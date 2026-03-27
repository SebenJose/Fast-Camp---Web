"use client"

import { useDashboardData, useMinimumLoadingTime } from "@/app/hooks"
import { TIMEOUTS } from "@/app/config/constants"
import { DashboardPresenter } from "./DashboardPresenter"

export function DashboardContainer() {
  const {
    data,
    isLoading: actualLoading,
    frequencyData,
    themeData,
    timeData,
    dailyReadingPercentage,
  } = useDashboardData()

  const isLoading = useMinimumLoadingTime(actualLoading, TIMEOUTS.FORM_MOUNTING)

  return (
    <DashboardPresenter
      data={data}
      isLoading={isLoading}
      frequencyData={frequencyData}
      themeData={themeData}
      timeData={timeData}
      dailyReadingPercentage={dailyReadingPercentage}
    />
  )
}
