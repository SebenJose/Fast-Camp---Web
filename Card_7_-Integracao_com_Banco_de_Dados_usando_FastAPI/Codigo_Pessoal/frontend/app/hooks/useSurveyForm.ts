import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { surveyInputSchema, type SurveyInput } from "@/app/types/survey"
import { surveyService } from "@/app/services/surveyService"
import { TIMEOUTS } from "@/app/config/constants"

const DEFAULT_VALUES: SurveyInput = {
  readingDate: new Date(),
  theme: "" as SurveyInput["theme"],
  frequency: "" as SurveyInput["frequency"],
}

export function useSurveyForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")

  const form = useForm<SurveyInput>({
    resolver: zodResolver(surveyInputSchema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (status === "success") {
      const timeoutId = setTimeout(() => {
        setStatus("idle")
      }, TIMEOUTS.FORM_SUCCESS_RESET)
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [status])

  const onSubmit = async (data: SurveyInput) => {
    setStatus("submitting")
    try {
      await surveyService.createSurvey(data)
      setStatus("success")
      toast.success("Pesquisa enviada com sucesso!")
      form.reset(DEFAULT_VALUES)
    } catch {
      setStatus("error")
      toast.error("Erro ao enviar pesquisa. Tente novamente.")
    }
  }

  return {
    form,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    onSubmit: form.handleSubmit(onSubmit),
  }
}
