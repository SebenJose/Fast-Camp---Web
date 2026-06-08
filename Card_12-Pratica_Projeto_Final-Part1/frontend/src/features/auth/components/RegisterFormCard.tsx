import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type RegisterFormCardProps = {
  onShowLogin: () => void;
};

export function RegisterFormCard({ onShowLogin }: RegisterFormCardProps) {
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

        <form className="mt-8 space-y-5">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-name"
            >
              Nome
            </label>
            <input
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="register-name"
              name="name"
              type="text"
            />
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-email"
            >
              E-mail
            </label>
            <input
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="register-email"
              name="email"
              type="email"
            />
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password"
            >
              Senha
            </label>
            <input
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="register-password"
              name="password"
              type="password"
            />
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password-confirmation"
            >
              Confirmar senha
            </label>
            <input
              className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
              id="register-password-confirmation"
              name="passwordConfirmation"
              type="password"
            />
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200"
            type="submit"
          >
            Criar conta
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
