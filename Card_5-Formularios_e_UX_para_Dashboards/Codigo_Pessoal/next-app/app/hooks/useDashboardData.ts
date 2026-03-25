import { useEffect, useState, useMemo, useCallback } from "react"
import { surveyService } from "@/app/services/surveyService"
import { SurveyResponse } from "@/app/types/survey"

export function useDashboardData() {
  const [data, setData] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const surveys = await surveyService.getSurveys()
      setData(surveys)
    } catch (error) {
      console.error("Erro ao revalidar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const surveys = await surveyService.getSurveys()
        if (isMounted) setData(surveys)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(
      () => {
        refetch()
      },
      5 * 60 * 1000 //formula para calcular 5 minutos em milissegundos
    )

    return () => clearInterval(interval)
  }, [refetch])

  useEffect(() => {
    const handleUpdate = () => refetch()
    window.addEventListener("surveysUpdated", handleUpdate)

    return () => window.removeEventListener("surveysUpdated", handleUpdate)
  }, [refetch])

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

  const dailyReadingPercentage = useMemo(() => {
    if (data.length === 0) return 0
    const dailyCount =
      frequencyData.find((f) => f.frequency === "Diariamente")?.count || 0
    return Math.round((dailyCount / data.length) * 100)
  }, [frequencyData, data.length])

  return {
    data,
    isLoading,
    frequencyData,
    themeData,
    timeData,
    refetch,
    dailyReadingPercentage,
  }
}
