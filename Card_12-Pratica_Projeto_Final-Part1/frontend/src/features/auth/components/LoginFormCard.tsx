"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_INPUT_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";
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
    <AuthFormCard
      title="Acesse sua rotina"
      description={
        <>
          Entre para revisar o plano de hoje ou crie uma conta para montar sua
          primeira semana.
        </>
      }
    >
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
                AUTH_INPUT_CLASS_NAME,
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
                AUTH_INPUT_CLASS_NAME,
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
            <p className={AUTH_FORM_ERROR_CLASS_NAME}>{formError}</p>
          )}

          <button
            className={AUTH_PRIMARY_ACTION_CLASS_NAME}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
    </AuthFormCard>
  );
}
