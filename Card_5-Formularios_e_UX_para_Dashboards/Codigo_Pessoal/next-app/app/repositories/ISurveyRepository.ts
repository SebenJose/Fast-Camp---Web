import type { SurveyInput, SurveyResponse } from "@/app/types/survey"

export interface ISurveyRepository {
  getSurveys(): Promise<SurveyResponse[]>
  createSurvey(input: SurveyInput): Promise<SurveyResponse>
}
