import type { SurveyInput, SurveyResponse } from "@/app/types/survey"
import type { ISurveyRepository } from "./ISurveyRepository"

export class ApiSurveyRepository implements ISurveyRepository {
  async getSurveys(): Promise<SurveyResponse[]> {
    throw new Error("ApiSurveyRepository.getSurveys: ainda não implementado")
  }

  async createSurvey(_input: SurveyInput): Promise<SurveyResponse> {
    throw new Error("ApiSurveyRepository.createSurvey: ainda não implementado")
  }
}
