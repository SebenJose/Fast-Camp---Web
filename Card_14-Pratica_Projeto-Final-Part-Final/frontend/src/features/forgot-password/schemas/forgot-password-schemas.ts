import { z } from "zod";

import { passwordWithConfirmationSchema } from "@/features/auth/schemas/auth-schemas";

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

export const forgotPasswordVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Informe os 6 dígitos do código de verificação.")
    .regex(/^\d+$/, "O código deve conter apenas números."),
});

export const forgotPasswordResetSchema = passwordWithConfirmationSchema;

export const forgotPasswordApiResponseSchema = z.object({
  message: z.string().optional(),
});

export type ForgotPasswordRequestFormData = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ForgotPasswordVerifyFormData = z.infer<
  typeof forgotPasswordVerifySchema
>;
export type ForgotPasswordResetFormData = z.infer<
  typeof forgotPasswordResetSchema
>;
export type ForgotPasswordApiResponse = z.infer<
  typeof forgotPasswordApiResponseSchema
>;
