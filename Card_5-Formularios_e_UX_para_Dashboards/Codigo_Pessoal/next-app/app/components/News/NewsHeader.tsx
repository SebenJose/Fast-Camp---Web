"use client"

interface NewsHeaderProps {
  selectedId: string | null
}

export function NewsHeader({ selectedId }: NewsHeaderProps) {
  return (
    <header className="shrink-0 mb-6">
      <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Noticiário
      </h1>
      {!selectedId && (
        <p className="mt-2 animate-in text-base text-muted-foreground duration-500 fade-in md:text-lg">
          Tudo o que acontece, em um só lugar. Explore nossa curadoria de
          conteúdos e mantenha-se atualizado com os temas do momento.
          <br />
          Aqui você pode acompanhar algumas notícias do dia a dia
        </p>
      )}
    </header>
  )
}
