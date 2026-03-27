import { mockSurveys } from "@/app/data/mocks/surveys"
import type { SurveyInput, SurveyResponse } from "@/app/types/survey"
import { localStore } from "@/app/lib/storage"
import type { ISurveyRepository } from "./ISurveyRepository"
import { STORAGE_KEYS, TIMEOUTS } from "@/app/config/constants"

const STORAGE_KEY = STORAGE_KEYS.SURVEYS

function parseSurveys(raw: string): SurveyResponse[] {
  const parsed = JSON.parse(raw)
  return parsed.map(
    (s: { readingDate: string | number } & Record<string, unknown>) => ({
      ...s,
      readingDate: new Date(s.readingDate),
    })
  ) as SurveyResponse[]
}

function getInitialSurveys(): SurveyResponse[] {
  const stored = localStore.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return parseSurveys(stored)
    } catch (e) {
      console.error(
        "Falha ao interpretar pesquisas armazenadas, usando dados mockados",
        e
      )
      return [...mockSurveys]
    }
  }
  localStore.setItem(STORAGE_KEY, JSON.stringify(mockSurveys))
  return [...mockSurveys]
}

export class LocalStorageSurveyRepository implements ISurveyRepository {
  private surveys: SurveyResponse[] = getInitialSurveys()

  getSurveys(): Promise<SurveyResponse[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.surveys])
      }, TIMEOUTS.GET_SURVEYS)
    })
  }

  createSurvey(input: SurveyInput): Promise<SurveyResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSurvey: SurveyResponse = {
          id: crypto.randomUUID(),
          ...input,
        }
        this.surveys = [newSurvey, ...this.surveys]

        localStore.setItem(STORAGE_KEY, JSON.stringify(this.surveys))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("surveysUpdated"))
        }

        resolve(newSurvey)
      }, TIMEOUTS.CREATE_SURVEY)
    })
  }
}
