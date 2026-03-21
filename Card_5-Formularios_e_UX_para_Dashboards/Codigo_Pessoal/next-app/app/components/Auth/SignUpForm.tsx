"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
} from "@/app/components/ui"
import { useAuth } from "@/app/hooks"
import {
  signUpSchema,
  type SignUpFields,
} from "@/app/lib/validations/auth.schema"

interface SignUpFormProps {
  onSuccess: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = (data: SignUpFields) => {
    const error = signUp(data.name, data.email, data.password)
    if (error) {
      toast.error(error)
    } else {
      toast.success(`Conta criada com sucesso! Bem-vindo, ${data.name}!`)
      reset()
      onSuccess()
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Criar nova Conta</CardTitle>
        <CardDescription>
          Preencha seus dados abaixo para se registrar na plataforma.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor="name-signup">Nome completo</Label>
            <Input
              id="name-signup"
              type="text"
              placeholder="João da Silva"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">E-mail</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="m@exemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Senha</Label>
            <Input
              id="password-signup"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password-signup">Confirmar senha</Label>
            <Input
              id="confirm-password-signup"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registrando…" : "Registrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
