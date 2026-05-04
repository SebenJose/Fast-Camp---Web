import type { SurveyInput, SurveyResponse } from "@/app/types/survey"
import type { ISurveyRepository } from "./ISurveyRepository"
import { apiClient } from "@/app/services/api/client"
import { AuthService } from "@/app/services"

export class ApiSurveyRepository implements ISurveyRepository {
  private getHeaders(): Record<string, string> {
    const session = AuthService.getSession()
    if (session?.token) {
      return { Authorization: `Bearer ${session.token}` }
    }
    return {}
  }

  async getSurveys(): Promise<SurveyResponse[]> {
    const data = await apiClient<{ surveys: any[] }>("/surveys/", {
      method: "GET",
      headers: this.getHeaders(),
    })

    return data.surveys.map((item) => ({
      id: String(item.id),
      readingDate: new Date(item.readingDate),
      theme: item.theme,
      frequency: item.frequency,
    }))
  }

  async createSurvey(input: SurveyInput): Promise<SurveyResponse> {
    const item = await apiClient<any>("/surveys/", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        readingDate: input.readingDate.toISOString(),
        theme: input.theme,
        frequency: input.frequency,
      }),
    })

    return {
      id: String(item.id),
      readingDate: new Date(item.readingDate),
      theme: item.theme,
      frequency: item.frequency,
    }
  }
}
