import type { SurveyResponse } from "@/app/types/survey"

/**
 * Banco de dados falso para o Dashboard da Pesquisa de Leitura.
 * 30 entradas distribuídas entre Janeiro, Fevereiro e Março de 2026.
 */
export const mockSurveys: SurveyResponse[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801",
    readingDate: new Date(2026, 0, 3),
    theme: "Tecnologia",
    frequency: "Diariamente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802",
    readingDate: new Date(2026, 0, 7),
    theme: "Economia",
    frequency: "Semanalmente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803",
    readingDate: new Date(2026, 0, 10),
    theme: "Saúde",
    frequency: "Raramente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804",
    readingDate: new Date(2026, 0, 12),
    theme: "Educação",
    frequency: "Diariamente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805",
    readingDate: new Date(2026, 0, 15),
    theme: "Tecnologia",
    frequency: "Semanalmente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806",
    readingDate: new Date(2026, 0, 17),
    theme: "Economia",
    frequency: "Diariamente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807",
    readingDate: new Date(2026, 0, 20),
    theme: "Saúde",
    frequency: "Semanalmente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567808",
    readingDate: new Date(2026, 0, 22),
    theme: "Educação",
    frequency: "Raramente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567809",
    readingDate: new Date(2026, 0, 25),
    theme: "Tecnologia",
    frequency: "Diariamente",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567810",
    readingDate: new Date(2026, 0, 28),
    theme: "Economia",
    frequency: "Raramente",
  },

  // ─── Fevereiro (11 respostas) ─────────────────────────────────────────────
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    readingDate: new Date(2026, 1, 2),
    theme: "Saúde",
    frequency: "Diariamente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678902",
    readingDate: new Date(2026, 1, 5),
    theme: "Tecnologia",
    frequency: "Semanalmente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678903",
    readingDate: new Date(2026, 1, 8),
    theme: "Educação",
    frequency: "Diariamente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678904",
    readingDate: new Date(2026, 1, 11),
    theme: "Economia",
    frequency: "Semanalmente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678905",
    readingDate: new Date(2026, 1, 13),
    theme: "Tecnologia",
    frequency: "Raramente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678906",
    readingDate: new Date(2026, 1, 16),
    theme: "Saúde",
    frequency: "Diariamente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678907",
    readingDate: new Date(2026, 1, 18),
    theme: "Educação",
    frequency: "Semanalmente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678908",
    readingDate: new Date(2026, 1, 20),
    theme: "Economia",
    frequency: "Raramente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678909",
    readingDate: new Date(2026, 1, 22),
    theme: "Tecnologia",
    frequency: "Diariamente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678910",
    readingDate: new Date(2026, 1, 25),
    theme: "Saúde",
    frequency: "Semanalmente",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678911",
    readingDate: new Date(2026, 1, 27),
    theme: "Educação",
    frequency: "Raramente",
  },

  // ─── Março (11 respostas) ─────────────────────────────────────────────────
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789001",
    readingDate: new Date(2026, 2, 1),
    theme: "Economia",
    frequency: "Diariamente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789002",
    readingDate: new Date(2026, 2, 4),
    theme: "Tecnologia",
    frequency: "Semanalmente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789003",
    readingDate: new Date(2026, 2, 7),
    theme: "Saúde",
    frequency: "Raramente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789004",
    readingDate: new Date(2026, 2, 9),
    theme: "Educação",
    frequency: "Diariamente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789005",
    readingDate: new Date(2026, 2, 12),
    theme: "Economia",
    frequency: "Semanalmente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789006",
    readingDate: new Date(2026, 2, 14),
    theme: "Tecnologia",
    frequency: "Diariamente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789007",
    readingDate: new Date(2026, 2, 17),
    theme: "Saúde",
    frequency: "Semanalmente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789008",
    readingDate: new Date(2026, 2, 19),
    theme: "Educação",
    frequency: "Raramente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789009",
    readingDate: new Date(2026, 2, 21),
    theme: "Economia",
    frequency: "Diariamente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789010",
    readingDate: new Date(2026, 2, 24),
    theme: "Tecnologia",
    frequency: "Raramente",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789011",
    readingDate: new Date(2026, 2, 27),
    theme: "Saúde",
    frequency: "Diariamente",
  },
  {
    id: "d4e5f6g7-a7b8-9012-cdef-123456789012",
    readingDate: new Date(2026, 2, 29),
    theme: "Tecnologia",
    frequency: "Semanalmente",
  },
  {
    id: "d4e5f6g7-a7b8-9012-cdef-123456789013",
    readingDate: new Date(2026, 2, 30),
    theme: "Economia",
    frequency: "Diariamente",
  },
  {
    id: "d4e5f6g7-a7b8-9012-cdef-123456789014",
    readingDate: new Date(2026, 2, 31),
    theme: "Educação",
    frequency: "Raramente",
  },
]
