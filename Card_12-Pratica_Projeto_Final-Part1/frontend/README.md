# Card 12 Frontend

Projeto iniciado com Next.js, React, TypeScript e Tailwind CSS.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Estrutura Feature-Based

```text
src/
  app/                 # Rotas, layouts e entrypoints do Next.js
  features/            # Funcionalidades isoladas por dominio
    home/
      components/
      types/
      index.ts
  shared/              # Codigo reutilizavel entre features
    components/
    lib/
    styles/
```

Use `src/features/<nome-da-feature>` para novos fluxos de produto e exponha
apenas o necessario pelo `index.ts` da feature.
