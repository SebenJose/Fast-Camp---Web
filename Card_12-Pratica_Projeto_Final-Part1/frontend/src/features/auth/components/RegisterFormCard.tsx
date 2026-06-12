"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import {
  getZodFieldErrors,
  type RegisterFormData,
  registerSchema,
} from "../schemas/auth-schemas";
import { useAuthStore } from "../stores/auth-store";

const REGISTER_FIELD_NAMES = [
  "name",
  "email",
  "password",
  "passwordConfirmation",
] as const satisfies readonly (keyof RegisterFormData)[];

type RegisterFormCardProps = {
  onShowLogin: () => void;
};

export function RegisterFormCard({ onShowLogin }: RegisterFormCardProps) {
  const router = useRouter();
  const register = useAuthStore((store) => store.register);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsedRegister = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirmation: formData.get("passwordConfirmation"),
    });

    if (!parsedRegister.success) {
      setFieldErrors(
        getZodFieldErrors(parsedRegister.error, REGISTER_FIELD_NAMES),
      );
      return;
    }

    setIsSubmitting(true);
    const result = await register(parsedRegister.data).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de autenticação.",
    }));
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success(`Conta criada. Bem-vindo, ${result.session.name}.`);
    router.push("/");
  }

  return (
    <Card className="w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 text-primary-title shadow-2xl shadow-black/30 ring-0 sm:p-10">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl">
          Crie sua conta
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-secundary-title">
          Monte sua primeira semana e comece a organizar sua rotina com mais
          clareza.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-8">
        <div className="grid rounded-2xl bg-primary-black p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              className="rounded-xl px-4 py-4 text-sm font-semibold text-secundary-title"
              disabled={isSubmitting}
              onClick={onShowLogin}
              type="button"
            >
              Login
            </button>
            <button
              className="rounded-xl bg-opaque-black px-4 py-4 text-sm font-semibold text-app-foreground"
              type="button"
            >
              Cadastro
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-name"
            >
              Nome
            </label>
            <input
              aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.name
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-name"
              name="name"
              type="text"
            />
            {fieldErrors.name && (
              <p
                className="text-sm font-medium text-warning"
                id="register-name-error"
              >
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-email"
            >
              E-mail
            </label>
            <input
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.email
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-email"
              name="email"
              type="email"
            />
            {fieldErrors.email && (
              <p
                className="text-sm font-medium text-warning"
                id="register-email-error"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password"
            >
              Senha
            </label>
            <input
              aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="new-password"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.password
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-password"
              name="password"
              type="password"
            />
            {fieldErrors.password && (
              <p
                className="text-sm font-medium text-warning"
                id="register-password-error"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password-confirmation"
            >
              Confirmar senha
            </label>
            <input
              aria-describedby={
                fieldErrors.passwordConfirmation
                  ? "register-password-confirmation-error"
                  : undefined
              }
              aria-invalid={Boolean(fieldErrors.passwordConfirmation)}
              autoComplete="new-password"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.passwordConfirmation
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-password-confirmation"
              name="passwordConfirmation"
              type="password"
            />
            {fieldErrors.passwordConfirmation && (
              <p
                className="text-sm font-medium text-warning"
                id="register-password-confirmation-error"
              >
                {fieldErrors.passwordConfirmation}
              </p>
            )}
          </div>

          {formError && (
            <p className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
              {formError}
            </p>
          )}

          <button
            className="h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
