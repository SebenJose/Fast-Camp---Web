# Paleta de Cores do Sistema (Shadcn Theme)

Sistema atualizado para a utilização de variáveis dinâmicas em `OKLCH` definidas no `app/globals.css`. Este padrão garante suporte nativo para os temas _Light_ e _Dark Mode_, garantindo um alto contraste acessível e customização por meio de tokens CSS (CSS Variables).

## 🎨 Cores Principais (Tokens Base)

| Variável Tailwind  | Uso do Sistema                           | Light Mode (`oklch`) | Dark Mode (`oklch`) |
| ------------------ | ---------------------------------------- | -------------------- | ------------------- |
| `background`       | Fundo principal das páginas              | `1 0 0`              | `0.145 0 0`         |
| `foreground`       | Cor base do texto e ícones secundários   | `0.145 0 0`          | `0.985 0 0`         |
| `primary`          | Botões Primários, CTAs e Destaques       | `0.205 0 0`          | `0.922 0 0`         |
| `secondary`        | Fundo auxiliar, Botões Secundários       | `0.97 0 0`           | `0.269 0 0`         |
| `muted`            | Textos de apoio, fundos neutros/inativos | `0.97 0 0`           | `0.269 0 0`         |
| `card` / `popover` | Fundo de Cartões, Dropdowns, Modais      | `1 0 0`              | `0.205 0 0`         |
| `destructive`      | Ações destrutivas (Excluir, Perigo)      | `0.577 0.245 27.3`   | `0.704 0.191 22.2`  |
| `border` / `ring`  | Linhas, Divisores e Focus Rings (Acess.) | `0.922 0 0`          | `1 0 0 / 10%`       |

## 📊 Cores de Gráficos e Analytics (Charts)

Estas cores são exclusivas para a plotagem dos componentes do `recharts` localizados na `Dashboard`.

| Variável Tailwind | OKLCH (Cross-Theme)   |
| ----------------- | --------------------- |
| `chart-1`         | `0.809 0.105 251.813` |
| `chart-2`         | `0.623 0.214 259.815` |
| `chart-3`         | `0.546 0.245 262.881` |
| `chart-4`         | `0.488 0.243 264.376` |
| `chart-5`         | `0.424 0.199 265.638` |

