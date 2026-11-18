# 3. Componentes e identidade visual

Veja também `docs/ux/README.md` (movimento) e as regras de gráficos/breadcrumb/layout em `CLAUDE.md`.

## Layout (`components/layout`)

`AppShell`, `Sidebar` (desktop), `Rail` (tablet), `BottomNav` (mobile), `MobileHeader` (barra do
mobile; **toda tela leva `header={<MobileHeader …/>}`**), `Page` (respiros por classe: `default|list|
detail|form|none`; props `header`, `padding`, `zoom`, `fill`) + `PageTitle` + `DetailHeader`,
`AccountMenu`/`AccountActions`/`UserChip`, `PrivacyToggle` e `ValuesMask` (oculta "R$"), `CountUpNumbers`,
`SettingsEffects` (aplica tamanho de texto/reduzir movimento), `ChatPanel`/`ChatSheet`/`HistoryPanel`/
`ConversarFab` (chat), `Brand`.

## UI (`components/ui`, 40 arquivos, todos próprios)

- Ação: `Button`/`ButtonLink` (cva: `variant` primary|forest|…, `size`, `block`), `IconButton(Link)`,
  `PendingLinkButton`, `TextLink`.
- Superfícies: `Card/CardHeader`, `Panel/PanelHeader`, `StatTile`, `Note`, `GuidePanel`, `Collapse`, `SlideCell`.
- Formulário (`form.tsx`, `form-sections.tsx`): `Field`, `FieldLabel`, `FieldHint`, `TextInput`, `AmountInput`,
  `SelectInput`, `CheckboxRow`, `RadioCard`, `Legend`, `MobileActionBar`; `Switch/SwitchRow`,
  `SegmentedControl`, `SegmentedTiles`, `PillToggle`, `ToggleChips`, `FilterChips/AddChip`, `SearchField`, `ListFilter`.
- Listas: `ListRow/RowList`, `DetailList`, `ActionList`, `Tag` (tons tucano/urucum/folha/arara/neutral),
  `CountBadge`, `ProgressBar` (`Tone`, `tetoTone(%)`), `SectionHeader`.
- Diálogos: `ConfirmDialog` (props `title, heading, actions, onClose, centered`), `UrlDialog` (aberto por query param), `DialogText`.
- Navegação: `Breadcrumb` (`items: {label, href?}[]`), `Presence` (entrada/saída animada, `PANEL_EXIT_MS`).
- Marca/ícones: `Icon` (SVGs próprios por `IconName`), `BankMark`, `MataArt`, `BrandLogo`/`BrandLockup`.
- **Identidade do assistente** (único: o Guará): `features/guara/identity.ts` (`guara.nome = "Lobo Guará"`,
  `guara.curto = "Guará"`, retrato = `/images/marca/logo-guara.png`), `GuaraAvatar` (`size`, `variant: brush|ring`) e
  `GuaraTip` (`named`, `action`). Todo aviso, dica e mensagem do chat usa esses três. **Não existe mais catálogo de
  agentes** (`features/assistentes`, as imagens `assistentes/` e `cenas/` e os tokens `--guara-bioma-*` foram removidos
  em 16/11/2026). Não reintroduza bichos como remetentes.

## Estados (`components/states`)

`Skeleton`/`LoadingStatus`, `StateBlock`, `ErrorBlock`, `NoDataBlock`, `FilterEmptyBlock`, `StateSwap`,
`RetryButton`, `ScreenStateProvider`/`CardBody`/`WhenNoData`, `parseScreenState`, `StatusToast`
(`ErrorToast`, `OfflineToast`).

## Gráficos (`components/charts`)

`ChartBox`, `ChartFit`, `Donut`, `ValueBars`, `Inspector`, primitivos SVG. **Recharts não é usado.**

## Features: componentes específicos

Em `features/<dominio>/components` (ex.: `gastos/components/ledger-list`, `teto-meter`,
`investimentos/components/positions-table`, `world-card`, `acesso/components/login-form`,
`onboarding/components/*`, `perfil/components/*`, `layout/components/editable-grid`).
Telas de edição/detalhe frequentemente importam cards de outras features (`MataCard` de `gastos`).

## Identidade visual

- Tema "Mata à noite", único: canvas `#0b110e`, card `#121a16`, field `#16201b`, shade `#1a241f`, linhas
  `#25322b`/`#34443b`. Texto: sand `#f2efe6`, soft, mist, caption.
- Acentos (nomes da fauna, só como nomes de cor): **tucano** `#f2c230` (ação primária/atenção), **urucum** `#ff6a50` (alerta/excluir),
  **folha** `#6cc08e` (ganho), **arara** `#6db3ec` (dados), mata `#1b4535`; variações `*-bg`, `urucum-line`.
- Tokens: `:root` `--guara-*` + variáveis semânticas shadcn → `@theme inline` vira classes (`bg-card`,
  `text-mist`, `border-line`, `text-tucano`). Raio base `--radius: 1.5rem`; utilitário `rounded-bubble`.
- Tipografia: `font-display` (Fraunces) para títulos/números, `font-sans` (Figtree); escalas `text-13/15/30/36/44`
  (numéricas, definidas no CSS). Respiros/zoom por container (`@tab`, `@desk`, `zoom-area`).
- Responsivo por **container queries** (`@tab:`, `@desk:`) dentro de `<main class="@container">`, não por
  breakpoints de viewport (também há `md:`/`lg:` nos paddings do `Page` e no shell).
- Movimento: tokens `--duration-*`, `--ease-*`; só `transform`/`opacity`; `prefers-reduced-motion` zera;
  preferência "reduzir movimento" e tamanho de texto (1/1.1/1.2 via `rem`) vêm de `settings`.
- Ícones: `Icon` próprio (lucide **não** é usado apesar de `components.json`).

## Como criar uma tela nova coerente

1. `page.tsx` fino + `<Nome>Screen`; `Page` com `header={<MobileHeader/>}` e `Breadcrumb` primeiro.
2. Só tokens/classes existentes e componentes de `ui`; nada de keyframe/duração novos.
3. Se usa API: hook `live` com zod, estados carregando/erro/vazio via `states`.
   **Carregando nunca é tela vazia**: desenhe os cards de verdade com um placeholder de "—"
   (`EMPTY_*`) dentro de `<Skeleton active>`; cada card fica no lugar com o círculo girando, e
   `<LoadingStatus />` fica fora do `Skeleton` (dentro ele some para o leitor de tela). Vale também
   para telas por id e para partes que carregam depois (ex.: a cotação na página do ativo).
   Placeholders existentes: `EMPTY_ASSET`/`EMPTY_MARKET` (ativo), `EMPTY_FACTS`, `EMPTY_GOAL`,
   `EMPTY_BELONGING`, `EMPTY_ALLOCATION`, `EMPTY_PROFILE_TARGETS`; a lista de Metas desenha 3
   metas (`LOADING_GOALS`). **O card carregando tem o tamanho do card pronto**: o placeholder
   preenche as mesmas linhas com texto neutro do mesmo comprimento ("R$ 0.000,00", "00/00/0000",
   "mmm/aaaa"), que fica escondido e quebra nas mesmas linhas que o real. Ao mexer num card,
   confira carregando × pronto no celular, tablet e desktop (só a diferença que depende do dado,
   como o número de posições de uma meta, pode sobrar).
4. Formulário? Registre em `isForm` (`lib/navigation.ts`) para o shell.
5. Se tem `?estado=`, registre em `previa/...` e no `matcher` do `proxy.ts`.
