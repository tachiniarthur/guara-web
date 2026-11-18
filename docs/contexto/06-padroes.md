# 6. Padrões, comandos e testes

## Comandos (Web; usar Node 24: `source ~/.nvm/nvm.sh && nvm use`)

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm typecheck` (`next typegen && tsc --noEmit`) ·
`pnpm test` (vitest run) · `pnpm test:watch` · `pnpm format` / `format:check`.
Verificação de uma mudança: `pnpm lint && pnpm typecheck && pnpm test` (+ `pnpm build` se mexer em rotas).
**Estado em 16/11/2026: lint, typecheck e format:check limpos; 40 arquivos / 186 testes passando (~31 s, após a remoção dos agentes).**
Hooks: pre-commit = lint-staged (eslint --fix + prettier); commit-msg = commitlint **Conventional Commits** com
escopo (`feat(web): …`). Ferramenta: `rtk` reescreve comandos de shell (hook global do usuário).

## Código

- TypeScript estrito; `import type` obrigatório (ESLint `consistent-type-imports`); `_` prefixa não usados.
- Prettier: 100 colunas, plugin Tailwind (ordena classes de `cn`/`cva`). Comentários e UI em **pt-BR**.
- Server vs client: `page.tsx` servidor fino; telas interativas `"use client"` em `*-screen.tsx`.
- Next 16 tem **breaking changes**: ler `node_modules/next/dist/docs/` antes de usar APIs (AGENTS.md). Usa `proxy.ts`
  (não `middleware.ts`), `PageProps<"/rota">`/`LayoutProps` tipados (gerados por `next typegen`), `params`/`searchParams` async.
- Separação: `data.ts` (protótipo) / `live.ts` (API+zod+conversão) / `context.tsx` / `components/`. Componentes não
  importam `data.ts` direto quando há context.
- Funções `to<X>View` e formatadores são **puros e testados** (`live.test.ts`, `build.test.tsx`).
- Estilo: classes Tailwind com tokens; `cn()` de `lib/utils`; variantes com `cva`; nada de CSS por tela.
- Nomes: pastas/rotas em pt-BR (`gastos`, `metas`, `alertas`), arquivos kebab-case, componentes PascalCase, hooks `useX`.
- Acessibilidade: `role="status"/"alert"`, `aria-label` em controles, foco, teclado no editor de layout.
- Movimento: sempre tokens/comportamentos de `docs/ux/README.md`.

## Testes (Vitest 5 + Testing Library + jsdom)

`vitest.config.ts`: `globals: true`, `include: src/**/*.test.{ts,tsx}`, `css: false`, setup `vitest.setup.ts` (jest-dom).
Arquivos `*.test.ts(x)` **ao lado do código**. 40 arquivos, concentrados em:

- lib (`api`, `cpf`, `phone`, `password`, `money-input`, `bar-width`, `format/*`);
- conversões `live` (`gastos`, `gastos-tetos`, `inicio`, `investimentos`, `metas`, `alertas`): chamam `toXView` com objetos de resposta;
- acesso (login, signup, code, password forms, `session-gate`); onboarding (cpf, plano, avisos, bancos, perfil);
- layout editor (`model`, editor), simulador (`build`, salvar), configurações, skeleton, posições (accordion), `page.test.tsx` do Início.
  **Sem cobertura**: a maioria das páginas de protótipo (assinaturas, relatório, conversas, notificações; ativo, bens e metas têm testes das conversões em `live.test.ts`), `components/ui`
  quase todo, e2e/Playwright (não há). Não há MSW; mocks são objetos/`vi.mock` dos módulos.

## Testes da API (resumo)

Jest unitário `*.spec.ts` junto do código (85); e2e `test/*.e2e-spec.ts` (37; Supabase local + Redis 6380; inclui
`schema-health` e `data-api`); contrato (`jest.contract.config.js`, opt-in); manual de IA (`test:ai-manual`, custa dinheiro,
só com autorização). Verificação da API: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Em 16/11/2026 (assistente único): lint, typecheck, build e 84 suítes / 599 unitários verdes; e2e 30/32
suítes (falham `pooler`, que exige o Supavisor local, e `subscriptions`, que já falhava antes da mudança).
