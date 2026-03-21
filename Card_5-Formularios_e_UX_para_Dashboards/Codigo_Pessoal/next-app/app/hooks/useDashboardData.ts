import { useEffect, useState, useMemo } from "react"
import { surveyService } from "@/app/services/surveyService"
import { SurveyResponse } from "@/app/types/survey"

export function useDashboardData() {
  const [data, setData] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    surveyService.getSurveys().then((surveys) => {
      if (isMounted) {
        setData(surveys)
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const frequencyData = useMemo(() => {
    const counts: Record<string, number> = {
      Diariamente: 0,
      Semanalmente: 0,
      Raramente: 0,
    }
    data.forEach((s) => {
      if (counts[s.frequency] !== undefined) counts[s.frequency]++
    })

    return Object.entries(counts).map(([label, count], index) => ({
      frequency: label,
      count,
      fill: `var(--chart-${index + 1})`,
      name: label.toLowerCase(),
    }))
  }, [data])

  const themeData = useMemo(() => {
    const counts: Record<string, number> = {
      Tecnologia: 0,
      Economia: 0,
      Educação: 0,
      Saúde: 0,
    }
    data.forEach((s) => {
      if (counts[s.theme] !== undefined) counts[s.theme]++
    })

    return Object.entries(counts)
      .map(([label, count]) => ({
        theme: label,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  const timeData = useMemo(() => {
    const months = ["Janeiro", "Fevereiro", "Março"]
    const chartData = months.map((month, index) => ({
      month,
      monthIndex: index,
      tecnologia: 0,
      economia: 0,
      educação: 0,
      saúde: 0,
    }))

    data.forEach((s) => {
      const monthIndex = s.readingDate.getMonth()
      if (monthIndex < months.length) {
        const themeKey = s.theme.toLowerCase() as keyof (typeof chartData)[0]
        if (typeof chartData[monthIndex][themeKey] === "number") {
          ;(chartData[monthIndex][themeKey] as number)++
        }
      }
    })

    return chartData
  }, [data])

  return {
    data,
    isLoading,
    frequencyData,
    themeData,
    timeData,
  }
}
