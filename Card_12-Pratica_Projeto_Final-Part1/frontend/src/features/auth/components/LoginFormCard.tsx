import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";


type LoginFormCardProps = {
  onShowRegister: () => void;
};

export function LoginFormCard({ onShowRegister }: LoginFormCardProps) {
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
              onClick={onShowRegister}
              type="button"
            >
              Cadastro
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-5">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-secundary-title" htmlFor="email">
              E-mail
            </label>
            <input
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="email"
              name="email"
              type="email"
            />
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
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="password"
              name="password"
              type="password"
            />
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200"
            type="submit"
          >
            Entrar
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
