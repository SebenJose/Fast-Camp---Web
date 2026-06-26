export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-app-muted">
        Dashboard
      </p>
      <div>
        <h1 className="text-4xl font-semibold text-primary-title sm:text-5xl">
          Visão geral
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-secundary-title sm:text-base">
          Acompanhe consumo de IA, tarefas cumpridas e interações semanais.
        </p>
      </div>
    </header>
  );
}
