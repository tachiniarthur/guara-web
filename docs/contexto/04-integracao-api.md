# 4. Guará API e integração com o Web

A API é **só consulta**. Docs dela: `guara-api/CLAUDE.md`, `guara-api/docs/architecture.md`,
`guara-api/docs/progress/` (etapas E01–E19). Swagger em `/docs` (não em produção). Teste: `https://guara-api-tphy.onrender.com`
(dorme parado; ~45–50 s para acordar: o Web tem retries longos por isso).

## Arquitetura da API

- NestJS 11, TS strict, CommonJS; `src/modules/<dominio>/` = `module`, `controller` (só HTTP), `service`
  (regra), `repository` (SQL Drizzle), `processor` (fila, só no worker), `ai-tools`. Referência: `modules/users`.
  Schemas zod em `src/shared/schemas` (TS puro); DTO com `createZodDto`.
- Prefixo global `/v1`; helmet; CORS por `CORS_ORIGINS`; headers aceitos `Authorization, Content-Type, Idempotency-Key, X-Request-Id`.
- Globais: `JwtAuthGuard` (JWT Supabase via JWKS, `role=authenticated`), `ActivePlanGuard` (402 sem plano, exceto
  `@Public()`/`@WithoutPlan()`), `ZodValidationPipe`, `IdempotencyInterceptor`, `ZodSerializerInterceptor`, `GlobalExceptionFilter`.
- Banco: Postgres/Supabase, RLS por usuário (`Database.withUser`), 42 migrações Drizzle (a `0040_single_assistant` tirou a turma de assistentes). Redis: BullMQ + cache. Worker separado.
- Regras: dinheiro em **centavos inteiros** (`*Cents`), ausente = `null`, datas `timestamptz`, mês/dia em America/Sao_Paulo,
  rotas em inglês, mensagens em pt-BR. Percentuais chegam como **string** (`"93.33"`) → `apiPercent` no Web.
- Integrações: Malvo (Open Finance), Brapi (B3), Twelve Data (EUA), Anthropic (chat), Resend, Expo Push.
- Testes: Jest (`*.spec.ts` ao lado do código, 85), e2e em `test/` (37, exige Supabase local + Redis 6380), contrato, manual de IA.

## Contrato HTTP

- **Auth**: `Authorization: Bearer <access_token>`. Rotas abertas: `GET /v1/health`, `POST /v1/auth/email-status`, `POST /v1/auth/login`.
- **Erro**: `{ "error": { "code", "message" (pt-BR), "details" } }`. Códigos: `BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND,
VALIDATION_ERROR (422, details.issues), PLAN_LIMIT_REACHED (403), SUBSCRIPTION_REQUIRED (402), CONFLICT (409),
INTERNAL_ERROR, AI_USAGE_LIMIT_REACHED (429), UPSTREAM_UNAVAILABLE (503)` (+ `INVALID_CREDENTIALS`, `CPF_*`, `RATE_LIMITED` usados no login/CPF).
- **Listas**: `{ data: [...] }`; paginadas por cursor: `{ data, nextCursor }` (cursor opaco; `?limit=&cursor=`).
- Escritas aceitam `Idempotency-Key`. `DELETE` pode devolver 204 (o `apiRequest` do Web **não lê corpo vazio**).

## Cliente HTTP do Web (`src/lib/api.ts`)

`apiRequest<T>(path /v1/…, zodSchema, {method, body, signal})`:

1. exige `env.apiUrl`; 2. pega o token em `getSupabase().auth.getSession()`; 3. `fetch` com `Accept` e `Content-Type` JSON;
2. falha de rede → `ApiError("network")`; `TimeoutError` → `unavailable`; `AbortError` repropagado;
3. `!ok` → lê `{error}` e vira `ApiError(code, message, status, details)` (códigos mapeados em `SERVER_CODES`, senão por status);
4. sucesso → `schema.parse(json)` (**resposta inesperada lança ZodError**).
   `ApiError.code` ∈ `bad_request, validation_failed, unauthorized, forbidden, not_found, conflict, plan_limit_reached,
subscription_required, rate_limited, invalid_credentials, cpf_*, internal, unavailable, network`; `message` já é pt-BR.
   Não há refresh/retry no cliente (o refresh do token é do Supabase, `autoRefreshToken`). Os schemas ficam **junto de cada
   `live*.ts`**, quase sempre `.loose()` nos objetos que só se leem parcialmente.

## Autenticação (Web)

- `lib/supabase.ts`: cliente PKCE, sessão persistida no navegador; **usado só para auth**.
- `features/acesso/auth.ts`: e-mail+código OTP (`signInWithOtp`/`verifyOtp`), Google/Apple (`signInWithOAuth`),
  cadastro com senha (`signUp` + código), esqueci/nova senha (`updateUser`), login por senha ou CPF via **`POST /v1/auth/login`**
  (devolve `accessToken/refreshToken/expiresIn` → `supabase.auth.setSession`), checagem `POST /v1/auth/email-status`
  (`exists, providers, hasPassword, cpfRegistered`; 12 s de timeout, falha = segue sem aviso).
- `SessionProvider` (`features/acesso/session.tsx`): `status = loading|signedOut|onboarding|signedIn|unavailable`.
  `GET /v1/me/plan` decide: sem plano → `onboarding`; 401 → logout; falha → retries (2,4,8,12,16,18 s) → `unavailable`.
  Acorda a API com `GET /v1/health` ao montar.
- Permissões: o Web só distingue **plano** (limites: `bankConnections`, `aiQuestionsPerMonth`, …).
  Não há perfis/papéis. Autorização real é da API (RLS + plano).

## Endpoints que o Web consome (confirmados por grep em `src/`)

| Endpoint                                                                                                                 | Quem chama                         | Para quê                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------- |
| `POST /v1/auth/email-status` · `POST /v1/auth/login`                                                                     | `acesso/auth.ts`                   | cadastro/entrada                                                  |
| `GET/PATCH /v1/me` · `PUT /v1/me/cpf`                                                                                    | `perfil/api.ts`, `usuario/live`    | nome, celular, CPF mascarado                                      |
| `GET/POST /v1/me/plan` · `PUT /v1/me/plan/billing-period`                                                                | `perfil/api.ts`, onboarding        | plano e uso                                                       |
| `GET /v1/accounts`                                                                                                       | usuario, gastos, ledger            | contas/bancos conectados                                          |
| `GET /v1/notifications/unread-count` · `GET /v1/notifications?limit=20`                                                  | usuario, alertas                   | não lidas; avisos                                                 |
| `GET /v1/dashboard`                                                                                                      | inicio, investimentos              | agregados do painel (blocos com `data`/`reason`)                  |
| `GET /v1/insights/spending[?month]` · `/daily` · `/monthly?months=N` · `/categories/:id`                                 | gastos, inicio, metas, tetos       | gráficos de gasto                                                 |
| `GET /v1/budgets/summary`                                                                                                | gastos, tetos, alertas, inicio     | tetos: `items[{budget,spentCents,usedPct,projectedCents,status}]` |
| `GET /v1/transactions` (`from,to,limit,cursor`) · `GET /v1/transactions/:id`                                             | gastos, lancamentos                | lançamentos (cursor, 100/pág)                                     |
| `GET /v1/anomalies?status=pending` · `GET /v1/anomalies`                                                                 | gastos, ledger                     | compras fora do padrão                                            |
| `GET /v1/categories`                                                                                                     | gastos, inicio, ledger             | categorias (cache 30 min)                                         |
| `GET /v1/subscriptions?status=active`                                                                                    | inicio                             | assinaturas ativas                                                |
| `GET /v1/goals`                                                                                                          | inicio, metas                      | metas + progresso                                                 |
| `GET /v1/investments/summary·evolution?period=12m·allocation·positions?groupBy=class` · `POST /v1/investments/positions` | investimentos, inicio, metas, form | carteira; criar posição                                           |
| `GET /v1/belongings` · `GET /v1/investor-profile`                                                                        | investimentos                      | bens; perfil (alvo da alocação)                                   |
| `GET/POST /v1/price-alerts` · `GET /v1/price-alerts/:id`                                                                 | alertas, investimentos             | alertas de preço                                                  |
| `GET /v1/market/assets?q=` · `/assets/:symbol/quote?mic=` · `/assets/:symbol/history?range=1mo`                          | mercado, alertas                   | cotações                                                          |
| `GET/PUT /v1/me/layouts/:screen`                                                                                         | `layout/use-screen-layout`         | layout de `home`/`spending`                                       |
| `GET /v1/health`                                                                                                         | session                            | acordar a API                                                     |

**Existem na API e o Web não chama** (futuras integrações): `chat/*` (conversas, SSE com o Lobo Guará, busca, uso), `onboarding`,
`connections` (Open Finance), `investor-profile` POST/questionnaire, `budgets` POST/PATCH/DELETE, `goals` POST/PATCH,
`subscriptions` escrita, `transactions` PATCH (categoria), `category-rules`, `reports/exports`, `simulations/*`,
`belongings` escrita, `price-alerts` PATCH/DELETE, `investments` movimentações/preview/exposure, `notifications` read/devices/settings,
`DELETE /v1/me` (exclusão), `GET /v1/plans`. (`GET /v1/chat/assistants` e `PUT /v1/me/plan/assistants` foram removidos da API em 16/11/2026.)

## Como consultar a API numa tarefa

1. Achar o controller: `guara-api/src/modules/<dominio>/*.controller.ts` (rota + decorators `@Public/@WithoutPlan/@RequiresFeature`).
2. Contrato exato (request/response): `guara-api/src/shared/schemas/<dominio>.schema.ts`.
3. Regra: `<dominio>.service.ts`; limites de plano: `shared/plans/catalog.ts` + `common/plans`.
4. Etapa/decisão: `guara-api/docs/progress/etapas/E##-*.md`. Chat: seção "Chat (Lobo Guará)" do `docs/architecture.md`.
5. Mudança de contrato no Web que exija campo novo em recurso com `strictObject` (layouts): **publicar a API antes**.
