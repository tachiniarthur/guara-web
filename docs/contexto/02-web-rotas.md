# 2. Web: estrutura, layouts, navegação e páginas

## `src/`

```
src/
├── proxy.ts            "middleware" do Next 16: reescreve ?estado=X para /previa/X/<rota> (só Relatório e Alertas)
├── app/
│   ├── layout.tsx      raiz: fontes, <html class="dark" lang="pt-BR">, <Providers>
│   ├── providers.tsx   QueryClientProvider (retry 1, sem refetch no foco) + CountUpNumbers + SessionProvider
│   ├── globals.css     tokens (:root + @theme), keyframes, comportamentos globais, reduced-motion
│   ├── (app)/          área logada (54 páginas) → SessionGate("app") + AppShell
│   └── (onboarding)/   entrada, cadastro, onboarding, termos (22 páginas)
├── components/
│   ├── layout/         AppShell, Sidebar, Rail, BottomNav, MobileHeader, Page, painel de chat, etc.
│   ├── ui/             40 primitivos próprios (Button, Panel, Card, form, dialogs, chips…)
│   ├── states/         estados de tela: skeleton, erro, vazio, toasts
│   └── charts/         ChartBox/ChartFit/Donut/ValueBars/Inspector (SVG próprio)
├── features/<dominio>/ data.ts (protótipo) · live.ts (API) · context.tsx · components/
├── lib/                api.ts, env.ts, supabase.ts, navigation.ts, format/, live-format.ts, cpf/phone/money-input…
├── stores/             zustand: auth-flow, chat-panel, privacy, settings, saved-simulations, profile-answers, onboarding-banks
├── hooks/              use-tween, use-active-indicator
└── types/              (vazio: só index.ts)
```

Alias `@/*` → `src/*`. Rotas e textos em **português** (`/gastos`, `/metas/nova`); código e tipos misturam.

## Layouts e porteiro de sessão

- `(app)/layout.tsx`: `<SessionGate area="app"><AppShell>`.
- `(onboarding)/onboarding/layout.tsx`: `SessionGate area="onboarding"` (exige conta). `entrar/layout.tsx`:
  `area="entrada"` (quem já entrou volta). `boas-vindas/layout.tsx` existe também.
- `SessionGate` (`features/acesso/components/session-gate.tsx`, regra pura `redirectFor`):
  - sem sessão → `/boas-vindas`; sem plano → `/onboarding/cpf`; com plano → app; `entrada` com sessão → `/`.
  - `loading`: "Preparando sua conta…"; `unavailable`: aviso + "Tentar de novo". **No protótipo não faz nada.**
- `(app)/error.tsx`: erro inesperado dentro do shell (`StateBlock` + retry).

### AppShell (`components/layout/app-shell.tsx`)

Responsivo por container queries (`@container` no `<main>`; breakpoints `@tab`, `@desk`):
compacto <600 (BottomNav) · médio 600–1199 (Rail + atalho do chat na borda) · ≥1200 (Sidebar +
painel de conversas à direita; conversa fixa a partir de 1600). Comportamento por rota em
`lib/navigation.ts → shellConfig(pathname)`: `aside` (`history`|`home`|false), `fab`, `bottomNav`,
`mobileFab`, `tabletChat`. Formulários (`isForm`) não têm barra inferior (ação fixa no rodapé).
O chat fecha ao entrar em `/perfil*` e `/configuracoes`. `?valores=ocultos` oculta valores;
`?chat=historico|nova|<uuid>` abre o painel de conversa (histórico, conversa nova ou uma conversa).

### Navegação (`lib/navigation.ts`)

`mainNav` (Início, Gastos, Assinaturas, Investimentos, Simulador, Metas, Relatórios, Alertas),
`bottomNav` (Início, Gastos, **Conversar** central, Investir, Alertas com contador), `accountMenu` (Assinaturas, Simulador, Metas, Relatórios),
`accountLinks` (Meu perfil, Configurações), `isActive` (prefixos `match`/`exclude`).
Breadcrumb: obrigatório nas telas do app (ver `CLAUDE.md`). O badge "2" de Alertas é **fixo no código**.

## Páginas (76 `page.tsx`)

Padrão: `page.tsx` fino → `<Algo>Screen` (client). Abas principais em `<rota>-screen.tsx` com prop
`estado`; `page.tsx` não lê `searchParams` (rota estática). `[param]` usa `generateStaticParams` com
ids do protótipo (só `conversas/[id]` tem `dynamicParams=false`).

### Área logada `(app)`

| Rota                                                                            | Tela                                      | Dados                                                                                                      |
| ------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`                                                                             | InicioScreen (blocos editáveis)           | **API**                                                                                                    |
| `/notificacoes`                                                                 | Notificações                              | protótipo (`notificacoes/data.ts`)                                                                         |
| `/gastos`                                                                       | GastosScreen (blocos editáveis)           | **API**                                                                                                    |
| `/gastos/lancamentos`, `/gastos/lancamentos/[id]`                               | Lista (paginada) e detalhe de lançamento  | **API**                                                                                                    |
| `/gastos/categorias/[categoria]`                                                | Gastos de uma categoria                   | **API**                                                                                                    |
| `/assinaturas`, `/assinaturas/[id]`, `/assinaturas/calendario`                  | Assinaturas                               | **API** (lista, detalhe com cobranças, calendário, "não é assinatura")                                     |
| `/investimentos`                                                                | Visão geral + globo                       | **API**                                                                                                    |
| `/investimentos/posicoes`                                                       | Tabela de posições + ajustar risco        | **API** (`features/investimentos/posicoes.ts`; `PATCH` do risco)                                           |
| `/investimentos/novo`                                                           | Adicionar investimento                    | **API** (`POST /positions`, prévia)                                                                        |
| `/investimentos/[ativo]` + `/eventos`, `/detalhes`, `/grafico`                  | Página do ativo (id da posição)           | **API** (`features/ativo/live.ts`, `facts.ts`: posição, mercado, histórico; corrigir, movimentar, remover) |
| `/investimentos/duplicidade`                                                    | Manual igual a posição do Open Finance    | **API** (`features/investimentos/duplicates.ts`: excluir o manual ou manter separados)                     |
| `/investimentos/alocacao`, `/alocacao/perfis`                                   | Alocação × perfil (4 classes)             | **API** (`features/alocacao/live.ts`)                                                                      |
| `/investimentos/bens/[bem]`, `/bens/imovel/novo`, `/bens/veiculo/novo`          | Bens                                      | **API** (`features/bens/live.ts`, `/v1/belongings`)                                                        |
| `/simulador`, `/simulador/corte`, `/simulador/objetivo`, `/simulador/salvas`    | Simulador                                 | premissas da **API**; cálculo local; salvas: **API** (aposentadoria local)                                 |
| `/metas`                                                                        | Lista ("X de N metas do plano")           | **API** (limite do plano: 2/4/8)                                                                           |
| `/metas/[id]`, `/metas/nova`                                                    | Detalhe (corrigir/excluir) e criação      | **API** (`features/metas/live.ts`, `/v1/goals`)                                                            |
| `/relatorio`, `/relatorio/linha-do-tempo`                                       | Relatório                                 | **API** (períodos 7d/mês/3m/12m, exportação PDF/CSV)                                                       |
| `/alertas`                                                                      | Hub (tetos + preços + avisos)             | **API**                                                                                                    |
| `/alertas/precos`, `/precos/[id]`, `/precos/[id]/editar`, `/alertas/novo-preco` | Alertas de preço                          | **API** (criar/listar/ver); editar: protótipo                                                              |
| `/alertas/tetos`, `/tetos/[id]`, `/tetos/[id]/editar`, `/alertas/novo-teto`     | Tetos de gasto                            | leitura **API**; criar/editar: protótipo                                                                   |
| `/conversas`, `/conversas/[id]`, `/conversas/historico`                         | Chat                                      | **API** (`/v1/chat`: conversas, mensagens em SSE, busca, renomear/excluir)                                 |
| `/perfil`, `/perfil/editar`, `/editar/email`, `/senha`, `/excluir-conta`        | Conta                                     | nome/CPF/celular via **API**; senha via Supabase; excluir-conta: só tela                                   |
| `/perfil/planos`                                                                | Planos                                    | plano via **API**; resto protótipo                                                                         |
| `/perfil/bancos/[banco]/renovar`                                                | Renovar banco                             | protótipo                                                                                                  |
| `/perfil/investidor` (`?pergunta=`), `/investidor/resultado`                    | Refazer perfil de investidor              | **API** (questionário, prévia e gravação em `/v1/investor-profile`)                                        |
| `/configuracoes`                                                                | Preferências                              | `localStorage` (store `settings`)                                                                          |
| `/previa/[estado]/[[...rota]]`                                                  | Estados do protótipo (Relatório, Alertas) | interna (via `proxy.ts`)                                                                                   |

### Onboarding/entrada `(onboarding)`

`/boas-vindas` (+`/criar`, `/codigo`), `/entrar` (+`/email`, `/codigo`, `/esqueci`, `/nova-senha`),
`/desbloqueio`, `/onboarding/cpf`, `/onboarding/perfil` (+`/[pergunta]`, `/resultado`),
`/onboarding/bancos` (+`/[banco]`, `/conectando`, `/erro`, `/sucesso`), `/onboarding/avisos`,
`/onboarding/plano`, `/termos`, `/privacidade`.
Reais: login/cadastro (Supabase + `/v1/auth/*`), CPF, plano, **questionário de perfil** (perguntas, prévia e gravação pela API, `features/onboarding/questionnaire.ts`). Etapas: 1 Plano, 2 Bancos, 3 Perfil, 4 Avisos (sem escolha de assistentes). **Conexão de banco (Malvo) é protótipo**; no sucesso da conexão, só o aviso de duplicidade é real.
Telas desenhadas ainda sem dado real: [08-funcionalidades-futuras.md](08-funcionalidades-futuras.md).

## O que é real e o que é protótipo

Real = lê/escreve a API com sessão. Confirmado por: `useSession().live` nas telas e chamadas
`apiRequest` (lista em [04](04-integracao-api.md)). A classificação acima vem de imports e chamadas;
telas sem `live`/`context` foram tratadas como protótipo (não executei o app).

## Estados de tela

Protótipo: `?estado=carregando|erro|sem-internet|vazio|vazio-filtro|excluida|novo` (`parseScreenState`).
Real: `carregando` enquanto a query não responde, `erro` se alguma falha, `vazio`/`novo` quando a
API diz que não há dados (`semDados`, `hasAccounts=false`).
