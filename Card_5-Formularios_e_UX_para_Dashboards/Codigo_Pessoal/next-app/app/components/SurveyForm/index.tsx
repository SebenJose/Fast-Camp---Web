"use client"

import { useState, useEffect } from "react"
import { useSurveyForm } from "@/app/hooks/useSurveyForm"
import { SurveyFormView } from "./SurveyFormView"
import { SurveyFormSkeleton } from "./SurveyFormSkeleton"
import { ProtectedRoute } from "../Auth"

/**
 * Smart Component for the Survey Form.
 * It connects the business logic (from useSurveyForm) with the presentation (SurveyFormView).
 */
export function SurveyForm() {
  const [isMounting, setIsMounting] = useState(true)
  const { form, isSubmitting, isSuccess, onSubmit } = useSurveyForm()

  useEffect(() => {
    const timer = setTimeout(() => setIsMounting(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 w-full">
        {/* Header persistent for better UX */}
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Nova Pesquisa de Leitura
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha os dados abaixo para contribuir com nossa base de conhecimentos
            e atualizar nossos dashboards.
          </p>
        </header>

        {isMounting ? (
          <SurveyFormSkeleton hideHeader />
        ) : (
          <SurveyFormView
            hideHeader
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
