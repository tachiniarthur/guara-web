# 5. Fluxos de dados

## Sessão e entrada

```
/boas-vindas → /entrar | /boas-vindas/criar → (e-mail+código | senha | CPF | Google/Apple)
   Supabase Auth → onAuthStateChange(SIGNED_IN) → SessionProvider.resolveStatus()
   → GET /v1/me/plan → plan? signedIn → "/" : onboarding → /onboarding/cpf → … → /onboarding/plano
```

Onboarding real: CPF (`PUT /v1/me/cpf`, imutável depois) → perfil de investidor (protótipo, respostas em
`sessionStorage`) → bancos (protótipo, `sessionStorage`) → avisos (`/onboarding/avisos`, só tela; leva a `/`) →
plano (`POST /me/plan`; em produção a API recusa 403, só ambiente de teste ativa direto).
`stores/auth-flow` (sessionStorage) guarda `passwordPending`/`signUpPending` para o gate não redirecionar cedo.
Cadastro: após o código, grava nome (`PATCH /me`), CPF e celular.

## Tela com dados reais (padrão)

```
<Rota>Screen (client)
  const { live } = useSession()
  const q = use<Dominio>View({ enabled: live })     // features/<d>/live.ts
        └ useQueries([...apiRequest(path, zodSchema)])   staleTime 60s (categorias 30min)
        └ buildView(tela, () => to<Dominio>View(resultados))   // converte p/ o formato do data.ts; erro → console + "Não deu para carregar"
  <DominioDataProvider value={view ?? prototype}>   // context.tsx; componentes leem só do context
```

Estado: `live ? (erro ? "erro" : data ? null : "carregando") : parseScreenState(estado)`. Sem contas
(`hasAccounts=false`/`semDados`) → telas "novo usuário" (`features/novo`). Formatação em `lib/format` (moeda
em centavos → `R$`, datas em America/Sao_Paulo) e `lib/live-format.ts`.

## Mapa tela → hook → endpoints

| Tela                          | Hook (arquivo)                                                  | Endpoints                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Início                        | `useHomeView` (`inicio/live.ts`)                                | dashboard, insights daily/monthly(2)/spending, budgets/summary, transactions?limit=5, anomalies, subscriptions, investments/allocation, goals, categories, me |
| Gastos                        | `useGastosView` (`gastos/live.ts`)                              | insights daily/monthly(6)/spending, budgets/summary, transactions?limit=8, anomalies, accounts, categories                                                    |
| Lançamentos                   | `useLancamentos` (`live-lancamentos.ts`, infinite query)        | transactions (from/to/limit/cursor), insights/spending, accounts, categories, anomalies                                                                       |
| Lançamento / Categoria        | `useTransactionDetail` / `useCategoryLedger` (`live-ledger.ts`) | transactions/:id, insights/spending/categories/:id, budgets/summary, accounts, categories, anomalies                                                          |
| Tetos (lista/detalhe)         | `useTetosView` (`live-tetos.ts`)                                | budgets/summary, insights/spending?month (retroativo)                                                                                                         |
| Investimentos / Posições      | `useInvestimentosView` (`investimentos/live.ts`)                | investments summary/evolution/positions, belongings, price-alerts, investor-profile, dashboard                                                                |
| Alocação                      | `usePortfolioAllocation` (context)                              | derivado das posições + perfil                                                                                                                                |
| Metas (lista)                 | `useMetasView`                                                  | goals, investments/positions, insights/monthly(1)                                                                                                             |
| Alertas (hub, lista, detalhe) | `useAlertasView`, `usePriceAlerts`, `usePriceAlertDetail`       | budgets/summary, price-alerts, notifications, market history                                                                                                  |
| Novo alerta de preço          | `PriceAlertLiveForm`                                            | market assets/quote → `POST /price-alerts`                                                                                                                    |
| Novo investimento             | `NewInvestmentLiveForm`                                         | `POST /investments/positions`                                                                                                                                 |
| Perfil / usuário no shell     | `useMe`, `useMyPlan`, `useUser`                                 | me, me/plan, accounts, notifications/unread-count                                                                                                             |

## Formulários e escrita

Formulários são **controlados com `useState`** (react-hook-form/zod-resolver instalados mas não usados). Padrão
(ver `price-alert-live-form.tsx`): validar no cliente (mensagem em `problem`), `useMutation` com `apiRequest`,
`onError` → `ApiError.message`, `onSuccess` → `invalidateQueries(["alertas"|"investimentos"…])` e `router.push`.
Valores de dinheiro: `lib/money-input.ts` (`parseMoneyInput`, `decimalToCents`), CPF/telefone/senha em `lib/cpf|phone|password`.
Mutations de perfil/plano atualizam o cache com `setQueryData(planKeys|meKeys)`.

## Layout das telas (Início, Gastos)

`useScreenLayout(screen, defs)`: leitura `GET /v1/me/layouts/:screen` (+ cópia `localStorage guara:layout:<tela>`);
editar usa rascunho; "Concluir" grava local com `pending` e envia `PUT`; se falhar, reenvia ao reabrir.
`mergeLayout` reconcilia blocos novos/desconhecidos. Nunca chama DELETE.

## Estado local (Zustand)

`chat-panel` (UI do chat e mensagens fake em memória), `privacy` (ocultar valores), `settings` (localStorage `guara-settings`),
`saved-simulations` (localStorage), `profile-answers`/`onboarding-banks`/`auth-flow` (sessionStorage).
Query keys em português: `["gastos",…]`, `["alertas",…]`, `["usuario",…]`, `["plano","meu"]`, `["perfil","eu"]`, `["layout",screen]`.

## Cache / erros

React Query: `retry: 1`, sem refetch no foco. Erros de rede/serviço viram `ErrorBlock`/toasts; 401 no plano → logout.
