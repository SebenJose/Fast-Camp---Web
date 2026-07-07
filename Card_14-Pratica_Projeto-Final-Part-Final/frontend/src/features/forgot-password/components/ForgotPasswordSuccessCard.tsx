import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  AUTH_FORM_CARD_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
} from "@/shared/components/auth-form";
import { Card } from "@/shared/components/ui/card";

export function ForgotPasswordSuccessCard() {
  return (
    <Card className={AUTH_FORM_CARD_CLASS_NAME}>
      <div className="flex flex-col items-center justify-center text-center py-4 w-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl text-center">
          Senha atualizada!
        </h2>
        <p className="max-w-md text-base leading-7 text-secundary-title mt-4 text-center mx-auto">
          Sua senha foi redefinida com sucesso. Agora você pode entrar com suas
          novas credenciais.
        </p>

        <div className="mt-8 w-full">
          <Link
            href="/auth"
            className={`flex items-center justify-center ${AUTH_PRIMARY_ACTION_CLASS_NAME}`}
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    </Card>
  );
}
