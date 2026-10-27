# Guará · Web

App de finanças pessoais para o Brasil: contas via Open Finance, gastos, tetos de gasto, relatórios, investimentos, alertas de preço, simulador e chat com assistentes de IA.

Este repositório é o **frontend web** (Next.js). A API (NestJS) e o app mobile (Expo) terão repositórios próprios, lado a lado na mesma pasta:

```
guara-folder/
├── web/      # este repositório
├── api/      # futuro
└── mobile/   # futuro
```

## Estrutura

```
web/
└── src/
    ├── app/            # rotas (App Router)
    ├── components/
    │   ├── layout/
    │   └── ui/         # reservada para os componentes do shadcn/ui
    ├── features/       # módulos de domínio
    ├── hooks/
    ├── lib/
    │   ├── format/     # formatadores puros (moeda, datas, valores vazios)
    │   └── utils.ts    # utilitários do web (ex.: cn)
    ├── stores/         # stores do zustand
    ├── styles/
    └── types/          # tipos de domínio
```

### Tokens de design

Os tokens (cores, tipografia, espaçamento e raios) vivem em `src/app/globals.css`: as variáveis CSS ficam no `:root`, com os nomes semânticos do shadcn/ui, e o bloco `@theme` as expõe para o Tailwind. Os valores atuais são provisórios (marcados com `TODO(identidade-visual)`).

## Pré-requisitos

- **Node.js 24 (LTS)**, conforme `.nvmrc` (`nvm use`). O pnpm também baixa o Node 24 automaticamente para os scripts do projeto (campo `devEngines.runtime`).
- **pnpm 12**, ativado via Corepack: `corepack enable`. A versão exata está em `packageManager`.

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # sem as variáveis, o site roda como protótipo
pnpm dev                     # http://localhost:3000
```

### Protótipo × login de verdade

Sem `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, o
site é o protótipo navegável (dados de exemplo, sem login). Com as três, o login é pelo Supabase
(e-mail com código, Google, Apple) e o site fala com a API do Guará: sem login, abre a entrada;
sem plano, a etapa de plano do onboarding (todo plano é pago); com plano, o app. Na Vercel, as
variáveis entram em Settings → Environment Variables (valem a partir do próximo deploy).

## Scripts

| Script              | O que faz                                      |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Sobe o app em modo desenvolvimento (Turbopack) |
| `pnpm build`        | Faz o build de produção                        |
| `pnpm start`        | Serve o build de produção                      |
| `pnpm lint`         | Roda o ESLint                                  |
| `pnpm typecheck`    | Checa os tipos (TypeScript)                    |
| `pnpm test`         | Roda os testes (Vitest)                        |
| `pnpm format`       | Formata o projeto com Prettier                 |
| `pnpm format:check` | Verifica a formatação sem alterar arquivos     |

## Qualidade e commits

- **pre-commit**: lint-staged roda ESLint e Prettier nos arquivos alterados.
- **commit-msg**: commitlint exige [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (ex.: `feat: adiciona página de gastos`).
