"use client"

import { SurveyView } from "./SurveyView"
import { SurveySkeleton } from "./SurveySkeleton"
import { ProtectedRoute } from "../Auth"
import { UseFormReturn } from "react-hook-form"
import { SurveyInput } from "@/app/types/survey"

interface SurveyPresenterProps {
  isMounting: boolean
  form: UseFormReturn<SurveyInput>
  isSubmitting: boolean
  isSuccess: boolean
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export function SurveyPresenter({
  isMounting,
  form,
  isSubmitting,
  isSuccess,
  onSubmit,
}: SurveyPresenterProps) {
  return (
    <ProtectedRoute>
      <div className="flex w-full flex-col gap-6">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Nova Pesquisa de Leitura
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para contribuir com nossa base de
            conhecimentos e atualizar nossos dashboards.
          </p>
        </header>

        {isMounting ? (
          <SurveySkeleton hideHeader />
        ) : (
          <SurveyView
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
