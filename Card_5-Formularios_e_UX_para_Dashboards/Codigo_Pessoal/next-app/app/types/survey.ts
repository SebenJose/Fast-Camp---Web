import * as z from "zod"

export const surveySchema = z.object({
  id: z.string().uuid(),
  readingDate: z.date({
    error: "A data de leitura é obrigatória.",
  }),
  theme: z.enum(["Tecnologia", "Economia", "Educação", "Saúde"] as const, {
    error: "Selecione um tema.",
  }),
  frequency: z.enum(["Diariamente", "Semanalmente", "Raramente"] as const, {
    error: "Selecione uma frequência.",
  }),
})

export type SurveyResponse = z.infer<typeof surveySchema>
export const surveyInputSchema = surveySchema.omit({ id: true })
export type SurveyInput = z.infer<typeof surveyInputSchema>
