"use client";

import Link from "next/link";
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
  type LoginFormData,
  loginSchema,
} from "../schemas/auth-schemas";
import { useAuthStore } from "../stores/auth-store";

const LOGIN_FIELD_NAMES = ["email", "password"] as const satisfies readonly (keyof LoginFormData)[];

type LoginFormCardProps = {
  onShowRegister: () => void;
};

export function LoginFormCard({ onShowRegister }: LoginFormCardProps) {
  const router = useRouter();
  const login = useAuthStore((store) => store.login);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsedLogin = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsedLogin.success) {
      setFieldErrors(getZodFieldErrors(parsedLogin.error, LOGIN_FIELD_NAMES));
      return;
    }

    setIsSubmitting(true);
    const result = await login(parsedLogin.data).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de autenticação.",
    }));
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success(`Bem-vindo de volta, ${result.session.name}.`);
    router.push("/");
  }

  return (
    <Card className="w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 text-primary-title shadow-2xl shadow-black/30 ring-0 sm:p-10">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl">
          Acesse sua rotina
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-secundary-title">
          Entre para revisar o plano de hoje ou crie uma conta para montar sua
          primeira semana.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-8">
        <div className="grid rounded-2xl bg-primary-black p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              className="rounded-xl bg-opaque-black px-4 py-4 text-sm font-semibold text-app-foreground"
              type="button"
            >
              Login
            </button>
            <button
              className="rounded-xl px-4 py-4 text-sm font-semibold text-secundary-title"
              disabled={isSubmitting}
              onClick={onShowRegister}
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
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.email
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="email"
              name="email"
              type="email"
            />
            {fieldErrors.email && (
              <p className="text-sm font-medium text-warning" id="email-error">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label
                className="text-sm font-semibold text-secundary-title"
                htmlFor="password"
              >
                Senha
              </label>
              <Link
                className="text-xs font-semibold text-secundary-title underline underline-offset-4 transition hover:text-primary-title"
                href="/auth/forgot-password"
              >
                Esqueci minha senha
              </Link>
            </div>
            <input
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="current-password"
              className={cn(
                "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20",
                fieldErrors.password
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="password"
              name="password"
              type="password"
            />
            {fieldErrors.password && (
              <p className="text-sm font-medium text-warning" id="password-error">
                {fieldErrors.password}
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
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
