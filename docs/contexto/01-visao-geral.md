# 1. Visão geral

## Os projetos

`guara-folder/` **não é monorepo nem repositório git**: é só uma pasta com repositórios independentes.

| Pasta              | O que é                                                | Papel nas tarefas                        |
| ------------------ | ------------------------------------------------------ | ---------------------------------------- |
| `web/`             | Frontend Next.js (git próprio)                         | **Único escopo de implementação**        |
| `guara-api/`       | Back-end NestJS (git próprio)                          | **Somente consulta** (contratos, regras) |
| `prints/`          | 35 capturas de tela (desktop/tablet/mobile, globo)     | Referência visual                        |
| `mobile/` (futuro) | App Expo (existe só no CLAUDE.md/README, não na pasta) | —                                        |

Guará = app de finanças pessoais para o Brasil: contas via Open Finance (Malvo), gastos, tetos,
assinaturas, investimentos (B3 e EUA), alertas de preço, simulador, metas, relatórios e chat com
o **Lobo Guará**, único assistente de IA do app (desde 16/11/2026 não existe mais a "turma" de
bichos, nem no Web nem na API).

## Web (`web/`)

- **Next.js 16.3** (App Router, Turbopack), **React 19**, **TypeScript ~6.0** estrito, **Tailwind 4**
  (`@tailwindcss/postcss`; tokens em `src/app/globals.css`), pnpm 12, **Node 24** (`.nvmrc`;
  `source ~/.nvm/nvm.sh && nvm use`, o shell padrão está na v22).
- Dados: **TanStack Query 5** (cache/requests), **zod 4** (valida toda resposta da API), **Zustand 5**
  (estado de UI/persistência local), **Supabase JS** (SÓ login/sessão).
- UI: componentes **próprios** em `src/components/ui` (não vêm do shadcn: ver
  [07](07-pontos-de-atencao.md)), `class-variance-authority` + `clsx` + `tailwind-merge` (`cn`),
  **Motion** (2 arquivos) e **dnd-kit** (editor de layout). Gráficos = SVG feito à mão.
- Fontes: Fraunces (display/números) e Figtree (texto), via `next/font/google`.
- Deploy: Vercel, região `gru1` (São Paulo) (`vercel.json`). App **somente tema escuro**
  (`<html class="dark">`, `colorScheme: dark`).
- Testes: Vitest 5 + Testing Library + jsdom. Lint: ESLint 9 (`eslint-config-next`). Prettier 3 com
  plugin do Tailwind. Husky: pre-commit (lint-staged) e commit-msg (commitlint, Conventional Commits).

## API (`guara-api/`) em uma tela

NestJS 11 + TypeScript (CommonJS), Supabase (Postgres/Auth/Storage), **Drizzle ORM** (postgres-js),
**zod** via `nestjs-zod` + Swagger (`/docs`, fora de produção), BullMQ + Redis (filas e cache),
pino, Jest. Dois processos com o mesmo código: HTTP (`main.ts`) e worker (`worker.ts`).
Detalhes e contratos em [04-integracao-api.md](04-integracao-api.md).

## Como se relacionam

```
Navegador (web, Next/Vercel)
   ├── Supabase Auth  ← login (OTP por e-mail, Google/Apple, senha, sessão PKCE)   [só auth]
   └── guara-api /v1/*  ← TODOS os dados, com  Authorization: Bearer <access_token do Supabase>
            └── Postgres (RLS por usuário), Redis, Malvo, Brapi, Twelve Data, Anthropic, Resend, Expo Push
```

O Web **nunca** fala com o banco. A API valida o JWT do Supabase (JWKS) e filtra tudo por usuário.

## Modo protótipo × modo real (conceito central do Web)

`src/lib/env.ts` exporta `isLive = apiUrl && supabaseUrl && supabaseKey` (3 variáveis `NEXT_PUBLIC_*`).

- **Sem as variáveis:** protótipo navegável: sem login, tudo com dados de exemplo (`features/*/data.ts`).
- **Com as variáveis:** login real e dados da API, **mas só em parte das telas**. As demais continuam
  com dados de exemplo mesmo logado (ver tabela em [02-web-rotas.md](02-web-rotas.md#o-que-é-real-e-o-que-é-protótipo)).

Padrão de convivência: cada tela tem os dados de exemplo (`data.ts`) e uma camada `live.ts` que busca
na API e devolve **o mesmo formato** do `data.ts`; um Context (`context.tsx`) escolhe qual entrega.

## Variáveis de ambiente (`.env.example`)

| Variável                               | Uso                                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                  | Base da API (ex.: Render de teste); o código acrescenta `/v1/...` |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase Auth                                                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública (nunca a secret)                                    |

Lidas e validadas por zod em `src/lib/env.ts` (vazio vira `undefined`).
