# Guará

App de finanças pessoais para o Brasil: contas via Open Finance, gastos, tetos de gasto, relatórios, investimentos, alertas de preço, simulador e chat com assistentes de IA.

O produto terá web (Next.js), mobile e tablet (Expo) e uma API (NestJS), organizados neste monorepo. **Hoje só existe a base do frontend web** e os pacotes compartilhados.

## Estrutura

```
guara-folder/
├── apps/
│   └── web/                    # Next.js (App Router, Tailwind CSS, shadcn/ui)
│       └── src/
│           ├── app/            # rotas (apenas a página inicial por enquanto)
│           ├── components/
│           │   ├── layout/
│           │   └── ui/         # reservada para os componentes do shadcn/ui
│           ├── features/       # módulos de domínio (futuros)
│           ├── hooks/
│           ├── lib/            # utilitários do web (ex.: cn)
│           ├── stores/         # stores do zustand
│           └── styles/
└── packages/
    ├── eslint-config/          # configuração de ESLint compartilhada (flat config)
    ├── typescript-config/      # tsconfig base estrito
    ├── types/                  # tipos de domínio compartilhados
    ├── ui-tokens/              # tokens de design em TypeScript puro (web + mobile)
    └── utils/                  # formatadores puros (moeda, datas, valores vazios)
```

Os futuros `apps/mobile` (Expo), `apps/api` (NestJS) e `apps/workers` entram em `apps/` e são detectados automaticamente pelo `pnpm-workspace.yaml`.

### Tokens de design

`packages/ui-tokens` é a fonte única da verdade para cores, tipografia, espaçamento e raios. O build do pacote gera `dist/tokens.css` com as variáveis CSS, e o `apps/web/src/app/globals.css` só mapeia essas variáveis para o tema do Tailwind. Os valores atuais são provisórios (marcados com `TODO(identidade-visual)`).

## Pré-requisitos

- **Node.js 24 (LTS)**, conforme `.nvmrc` (`nvm use`). O pnpm também baixa o Node 24 automaticamente para os scripts do projeto (campo `devEngines.runtime`).
- **pnpm 12**, ativado via Corepack: `corepack enable`. A versão exata está em `packageManager`.

## Como rodar

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # opcional por enquanto
pnpm dev                                        # http://localhost:3000
```

## Scripts (raiz)

| Script              | O que faz                                                |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Sobe o web em modo desenvolvimento (Turbopack) via Turbo |
| `pnpm build`        | Gera os tokens CSS e faz o build de produção do web      |
| `pnpm lint`         | Roda o ESLint em todos os pacotes                        |
| `pnpm typecheck`    | Checa os tipos (TypeScript) em todos os pacotes          |
| `pnpm test`         | Roda os testes (Vitest) em todos os pacotes              |
| `pnpm format`       | Formata o repositório com Prettier                       |
| `pnpm format:check` | Verifica a formatação sem alterar arquivos               |

Para rodar algo em um pacote específico: `pnpm --filter @guara/web <script>`.

## Qualidade e commits

- **pre-commit**: lint-staged roda ESLint e Prettier nos arquivos alterados.
- **commit-msg**: commitlint exige [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (ex.: `feat(web): adiciona página de gastos`).
