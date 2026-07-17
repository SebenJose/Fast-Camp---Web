import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "A senha precisa ter pelo menos 6 caracteres.");

export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas precisam ser iguais.",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
  })
  .and(passwordWithConfirmationSchema);

export const mockAuthSessionSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
});

export const mockAuthUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.string().datetime(),
});

export const mockAuthUsersSchema = z.array(mockAuthUserSchema);

export const authApiResponseSchema = z.object({
  message: z.string().nullish(),
  session: mockAuthSessionSchema.nullish(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type MockAuthSession = z.infer<typeof mockAuthSessionSchema>;
export type MockAuthUser = z.infer<typeof mockAuthUserSchema>;

export function getZodFieldErrors<TFieldName extends string>(
  error: z.ZodError,
  fieldNames: readonly TFieldName[],
) {
  const fieldErrors: Partial<Record<TFieldName, string>> = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];

    if (
      typeof fieldName === "string" &&
      fieldNames.includes(fieldName as TFieldName) &&
      !fieldErrors[fieldName as TFieldName]
    ) {
      fieldErrors[fieldName as TFieldName] = issue.message;
    }
  }

  return fieldErrors;
}
