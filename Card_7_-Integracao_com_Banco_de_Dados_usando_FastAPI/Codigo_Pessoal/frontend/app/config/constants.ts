export const STORAGE_KEYS = {
  AUTH_USERS: "auth_users",
  AUTH_SESSION: "auth_session",
  SURVEYS: "fastcamp_survey_persistence",
} as const

export const TIMEOUTS = {
  GET_SURVEYS: 800,
  CREATE_SURVEY: 1000,
  FORM_SUCCESS_RESET: 3000,
  FORM_MOUNTING: 500,
  DASHBOARD_POLLING: 5 * 60 * 1000,
} as const

export const SURVEY_THEMES = [
  "Tecnologia",
  "Economia",
  "Educação",
  "Saúde",
] as const

export const SURVEY_FREQUENCIES = [
  "Diariamente",
  "Semanalmente",
  "Raramente",
] as const
