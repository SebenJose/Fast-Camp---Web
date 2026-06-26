import Image from "next/image";

import { AuthFormSwitcher } from "./AuthFormSwitcher";

export function AuthPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-primary-black text-app-foreground md:grid-cols-2">
      <WelcomePanel />
      <LoginPanel />
    </main>
  );
}

function WelcomePanel() {
  return (
    <section className="relative flex min-h-[32rem] items-stretch justify-center overflow-hidden bg-opaque-black px-8 py-6 text-app-foreground md:min-h-screen">
      <div className="grid w-full max-w-2xl grid-rows-[auto_1fr_auto] gap-4 text-left">
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-primary-title drop-shadow-[0_4px_18px_rgba(243,246,248,0.22)] sm:text-4xl lg:text-5xl">
          Organize seu dia de forma fácil
        </h1>

        <div className="flex min-h-0 items-center justify-center">
          <Image
            alt="Logo Organiza.Ai"
            className="h-auto max-h-[52vh] w-104 max-w-full object-contain sm:w-136 md:max-h-[62vh] md:w-160 lg:w-184"
            height={1024}
            priority
            src="/images/logo.png"
            width={1024}
          />
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white p-4 text-left">
          <p className="text-sm leading-5 text-secundary-title">
            Alinhe seu dia a dia de forma fácil e prática com Organiza.IA
          </p>
        </div>
      </div>
    </section>
  );
}

function LoginPanel() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-primary-black px-8 py-12 md:min-h-screen">
      <AuthFormSwitcher />
    </section>
  );
}
