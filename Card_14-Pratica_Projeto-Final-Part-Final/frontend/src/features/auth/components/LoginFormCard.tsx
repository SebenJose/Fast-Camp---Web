"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_INPUT_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";
import { cn } from "@/shared/lib/utils";

import { type LoginFormData, loginSchema } from "../schemas/auth-schemas";
import { useAuthStore } from "../stores/auth-store";

type LoginFormCardProps = {
  onShowRegister: () => void;
};

export function LoginFormCard({ onShowRegister }: LoginFormCardProps) {
  const router = useRouter();
  const login = useAuthStore((store) => store.login);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setFormError(null);

    const result = await login(data).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de autenticação.",
    }));

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

        <form
          className="mt-8 space-y-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.email
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="email"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm font-medium text-warning" id="email-error">
                {errors.email.message}
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
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.password
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm font-medium text-warning" id="password-error">
                {errors.password.message}
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
