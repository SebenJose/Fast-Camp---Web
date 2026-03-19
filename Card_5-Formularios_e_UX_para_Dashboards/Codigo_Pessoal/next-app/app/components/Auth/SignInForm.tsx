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
import { signInSchema, type SignInFields } from "@/app/lib/validations/auth.schema"

interface SignInFormProps {
  onSuccess: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = (data: SignInFields) => {
    const error = signIn(data.email, data.password)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Login realizado com sucesso!")
      reset()
      onSuccess()
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Bem Vindo de Volta!
        </CardTitle>
        <CardDescription>
          Insira o seu e-mail e senha para acessar o painel administrativo.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor="email-signin">E-mail</Label>
            <Input
              id="email-signin"
              type="email"
              placeholder="m@exemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-signin">Senha</Label>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <Input
              id="password-signin"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
