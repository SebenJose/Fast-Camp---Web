import { z } from "zod";

import { passwordWithConfirmationSchema } from "@/features/auth/schemas/auth-schemas";

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
});

export const forgotPasswordVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Informe o código de verificação.")
    .max(6, "Informe no máximo 6 caracteres."),
});

export const forgotPasswordResetSchema = passwordWithConfirmationSchema;

export type ForgotPasswordRequestFormData = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type ForgotPasswordVerifyFormData = z.infer<
  typeof forgotPasswordVerifySchema
>;
export type ForgotPasswordResetFormData = z.infer<
  typeof forgotPasswordResetSchema
>;
