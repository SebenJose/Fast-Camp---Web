import { mockSurveys } from "@/app/data/mocks/surveys"
import type { SurveyInput, SurveyResponse } from "@/app/types/survey"

const STORAGE_KEY = "fastcamp_survey_persistence"

function getInitialSurveys(): SurveyResponse[] {
  if (typeof window === "undefined") return [...mockSurveys]

  const stored = localStorage.getItem(STORAGE_KEY)
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSurveys))
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

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys))
        }

        resolve(newSurvey)
      }, 1000)
    })
  },
}
