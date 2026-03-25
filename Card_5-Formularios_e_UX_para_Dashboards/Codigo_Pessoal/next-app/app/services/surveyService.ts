import { mockSurveys } from "@/app/data/mocks/surveys"
import type { SurveyInput, SurveyResponse } from "@/app/types/survey"
import { localStore } from "@/app/lib/storage"

const STORAGE_KEY = "fastcamp_survey_persistence"

function getInitialSurveys(): SurveyResponse[] {
  const stored = localStore.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed.map(
        (s: { readingDate: string | number } & Record<string, unknown>) => ({
          ...s,
          readingDate: new Date(s.readingDate),
        })
      ) as SurveyResponse[]
    } catch (e) {
      console.error("Failed to parse stored surveys, falling back to mocks", e)
      return [...mockSurveys]
    }
  }

  localStore.setItem(STORAGE_KEY, JSON.stringify(mockSurveys))
  return [...mockSurveys]
}

let surveys: SurveyResponse[] = getInitialSurveys()

export const surveyService = {
  getSurveys(): Promise<SurveyResponse[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...surveys])
      }, 800)
    })
  },

  createSurvey(input: SurveyInput): Promise<SurveyResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSurvey: SurveyResponse = {
          id: crypto.randomUUID(),
          ...input,
        }
        surveys = [newSurvey, ...surveys]

        localStore.setItem(STORAGE_KEY, JSON.stringify(surveys))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("surveysUpdated"))
        }

        resolve(newSurvey)
      }, 1000)
    })
  },
}
