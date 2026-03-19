import * as z from "zod"

export const signInSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
})

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Nome obrigatório"),
    email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type SignInFields = z.infer<typeof signInSchema>
export type SignUpFields = z.infer<typeof signUpSchema>
