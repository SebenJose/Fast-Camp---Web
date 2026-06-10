export function HomeHeader() {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-medium tracking-normal text-primary-title sm:text-6xl">
          Hoje
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-secundary-title sm:text-base">
          Uma visão limpa do dia, separada por períodos reais para facilitar
          decisões sem sobrecarregar a agenda.
        </p>
      </div>

      <div className="flex w-full max-w-64 items-center gap-3 rounded-2xl border border-app-border bg-card-opaque/50 px-5 py-3 text-sm shadow-lg shadow-black/20 lg:mt-8">
        <span className="size-2.5 rounded-full bg-primary-title shadow-[0_0_14px_rgba(243,246,248,0.7)]" />
        <div>
          <p className="font-semibold text-primary-title">Agora · 09:42</p>
          <p className="text-xs text-app-muted">próximo bloco em 18 min</p>
        </div>
      </div>
    </header>
  );
}
