"use client"

import { useSurveyForm, useMinimumLoadingTime } from "@/app/hooks"
import { TIMEOUTS } from "@/app/config/constants"
import { SurveyPresenter } from "./SurveyPresenter"

export function SurveyContainer() {
  const { form, isSubmitting, isSuccess, onSubmit } = useSurveyForm()

  const isMounting = useMinimumLoadingTime(false, TIMEOUTS.FORM_MOUNTING)

  return (
    <SurveyPresenter
      isMounting={isMounting}
      form={form}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      onSubmit={onSubmit}
    />
  )
}
