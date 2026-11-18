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
        └ useQueries([...apiQuery(path, zodSchema)])     // lib/api-query.ts
        └ buildView(tela, () => to<Dominio>View(resultados))   // converte p/ o formato do data.ts; erro → console + "Não deu para carregar"
  <DominioDataProvider value={view ?? prototype}>   // context.tsx; componentes leem só do context
```

Estado: `live ? (erro ? "erro" : data ? null : "carregando") : parseScreenState(estado)`.

## Cache das consultas (rapidez na navegação)

- **Uma chave por endereço**: `apiQuery(path, schema)` usa `["api", path]` e guarda o JSON cru; cada tela
  converte com o próprio schema no `select`. Duas telas que leem o mesmo endereço (ex.: `monthly?months=12`
  no Início, Gastos, Metas, Simulador e Relatório) fazem uma chamada só. `staleTime` padrão de 5 min.
- **Endereços num lugar só**: cada `live.ts` exporta os endereços (`homePaths`, `gastosPaths`,
  `ASSINATURAS_PATHS`, `INVESTIMENTOS_PATHS`, `METAS_PATHS`, `ALERTAS_PATHS`, `SIMULADOR_PATHS`,
  `reportPaths`); o hook e o pré-carregamento usam os mesmos.
- **Pré-carregamento** (`features/prefetch/use-prefetch-screens.ts`, no `AppShell`): quando a tela aberta
  termina de buscar, busca por trás as outras abas do menu (3 por vez).
- **Cópia no navegador** (`lib/query-persist.ts`): o cache `api`/`plano`/`perfil`/`usuario` vai para o
  `localStorage` (`guara:consultas:v1`) com o id do usuário; ao reabrir, só a mesma conta recebe a cópia
  (até 3 dias). Com o plano guardado, a sessão entra na hora (`SessionProvider` otimista) e confirma por
  trás. Sair limpa o cache e a cópia.
- Escrita: `invalidateApi(client, ...prefixos)` invalida as chaves `["api", ...]` pelo começo do endereço. Sem contas
  (`hasAccounts=false`/`semDados`) → telas "novo usuário" (`features/novo`). Formatação em `lib/format` (moeda
  em centavos → `R$`, datas em America/Sao_Paulo) e `lib/live-format.ts`.

## Mapa tela → hook → endpoints

| Tela                            | Hook (arquivo)                                                  | Endpoints                                                                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Início                          | `useHomeView` (`inicio/live.ts`)                                | dashboard, insights daily/monthly(2)/spending, budgets/summary, transactions?limit=5, anomalies, subscriptions, investments/allocation, goals, categories, me                                               |
| Gastos                          | `useGastosView` (`gastos/live.ts`)                              | insights daily/monthly(6)/spending, budgets/summary, transactions?limit=8, anomalies, accounts, categories. Seletor de mês (12 meses, `stores/gastos-month`): tudo com `month=`; categoria abre com `?mes=` |
| Lançamentos                     | `useLancamentos` (`live-lancamentos.ts`, infinite query)        | transactions (from/to/limit/cursor), insights/spending, accounts, categories, anomalies                                                                                                                     |
| Lançamento / Categoria          | `useTransactionDetail` / `useCategoryLedger` (`live-ledger.ts`) | transactions/:id, insights/spending/categories/:id, budgets/summary, accounts, categories, anomalies                                                                                                        |
| Tetos (lista/detalhe)           | `useTetosView` (`live-tetos.ts`)                                | budgets/summary, insights/spending?month (retroativo)                                                                                                                                                       |
| Investimentos / Posições        | `useInvestimentosView` (`investimentos/live.ts`)                | investments summary/evolution/positions, belongings, price-alerts, investor-profile, dashboard. 6M/12M/Tudo: `usePerformance` (`evolution?period=6m\|12m\|all`)                                             |
| Alocação                        | `usePortfolioAllocation` (context)                              | derivado das posições + perfil                                                                                                                                                                              |
| Metas (lista)                   | `useMetasView`                                                  | goals, investments/positions, insights/monthly(1)                                                                                                                                                           |
| Metas (detalhe, nova)           | `useGoal`, `useCreateGoal`/`useUpdateGoal`/`useRemoveGoal`      | goals/:id, investments/positions (vincular posições)                                                                                                                                                        |
| Página do ativo                 | `usePosition`, `useMarketAsset`, `useHistory` (`ativo/live.ts`) | investments/positions/:id; market/assets/:symbol (+history) só com ticker da B3/cripto; 403 = fora do plano                                                                                                 |
| Alocação / Perfis               | `useAllocation`, `useProfileTargets` (`alocacao/live.ts`)       | investments/allocation, investor-profile, investor-profile/questionnaire                                                                                                                                    |
| Bens                            | `useBelonging`, `useCreateBelonging`… (`bens/live.ts`)          | belongings(/:id), investments/summary (patrimônio total)                                                                                                                                                    |
| Alertas (hub, lista, detalhe)   | `useAlertasView`, `usePriceAlerts`, `usePriceAlertDetail`       | budgets/summary, price-alerts, notifications, market history                                                                                                                                                |
| Assinaturas (lista, calendário) | `useAssinaturasView` (`assinaturas/live.ts`)                    | subscriptions?status=active, accounts, categories                                                                                                                                                           |
| Assinatura (detalhe)            | `useAssinaturaDetail`                                           | subscriptions, transactions?q=…&from=…&direction=debit (cobranças), `PATCH /subscriptions/:id` ("não é assinatura")                                                                                         |
| Simulador                       | `useSimulatorContext` (`simulador/live.ts`)                     | simulations/defaults, simulations/spending-suggestions, insights/monthly(12), investor-profile, belongings, goals                                                                                           |
| Simulações salvas               | `useApiSavedSimulations`                                        | `GET/POST/DELETE /simulations` (objetivo e corte; aposentadoria fica no navegador: a API pede idades)                                                                                                       |
| Relatório / Linha do tempo      | `useReportView(período)` (`relatorio/live.ts`)                  | dashboard, insights daily (mês atual e anterior), monthly(12), spending (1, 3 ou 12 meses), transactions?from, accounts, categories, anomalies                                                              |
| Exportar relatório              | `export-live.ts`                                                | `POST /reports/exports` (PDF gastos do mês, CSV lançamentos), `GET /reports/exports/:id` a cada 2 s, `/download`                                                                                            |
| Novo alerta de preço            | `PriceAlertLiveForm`                                            | market assets/quote → `POST /price-alerts`                                                                                                                                                                  |
| Novo investimento               | `NewInvestmentLiveForm`                                         | `POST /investments/positions`                                                                                                                                                                               |
| Perfil / usuário no shell       | `useMe`, `useMyPlan`, `useUser`                                 | me, me/plan, accounts, notifications/unread-count                                                                                                                                                           |

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

`chat-panel` (painel aberto, visão e conversa atual), `features/conversas/stream` (turno sendo enviado/respondido), `privacy` (ocultar valores), `settings` (localStorage `guara-settings`),
`saved-simulations` (localStorage: sem login, e a aposentadoria com login), `profile-answers`/`onboarding-banks`/`auth-flow` (sessionStorage).
Query keys em português: `["gastos",…]`, `["alertas",…]`, `["usuario",…]`, `["plano","meu"]`, `["perfil","eu"]`, `["layout",screen]`.

## Cache / erros

React Query: `retry: 1`, sem refetch no foco. Erros de rede/serviço viram `ErrorBlock`/toasts; 401 no plano → logout.
