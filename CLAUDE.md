@AGENTS.md

## Contexto do projeto (ler primeiro)

Web = Next.js 16 / React 19 / Tailwind 4 / TanStack Query / zod; **único escopo de implementação**.
`../guara-api` (NestJS 11) é só consulta. App **híbrido**: sem as 3 variáveis `NEXT_PUBLIC_*` é protótipo
(`features/*/data.ts`); com elas, só parte das telas lê a API (`features/*/live.ts` + `context.tsx`).
Toda chamada HTTP passa por `lib/api.ts` (`apiRequest` + schema zod); Supabase só para login.
Mapa completo em `docs/contexto/README.md` (visão geral, rotas, componentes, integração com a API,
fluxos, padrões, pontos de atenção). Confira sempre o código atual antes de alterar.

## Movimento, interação e consistência visual

Antes de animar algo ou criar um componente interativo, leia `docs/ux/README.md` (padrão global de
movimento, componentes compartilhados e o acompanhamento da revisão de UX/UI). Não crie curvas,
durações ou keyframes por tela.

## Desempenho da navegação

Detalhes e medições em `docs/performance.md`.

- **Abas e telas frequentes são geradas no build** (○/● no `next build`): a página não lê
  `searchParams`. Elas são pré-carregadas pelos links e servidas da borda, então o clique não
  espera o servidor. Ler `searchParams` numa `page.tsx` torna a rota dinâmica (ƒ) e devolve o
  atraso de uma ida e volta ao servidor a cada clique.
- **Estados do protótipo (`?estado=`)**: a tela fica em `<rota>-screen.tsx` com a prop `estado`;
  a `page.tsx` só renderiza a tela sem estado. Com `?estado=`, o `src/proxy.ts` reescreve para
  `/previa/<estado>/<rota>`, que desenha a mesma tela no estado pedido (o endereço não muda).
  Tela nova com estados: registre em `app/(app)/previa/[estado]/[[...rota]]/page.tsx` e no
  `matcher` do proxy.
- As funções da Vercel rodam em São Paulo (`vercel.json`, `gru1`).

## Breadcrumbs

Toda tela do app (área logada) tem `<Breadcrumb>` (`components/ui/breadcrumb.tsx`), visível a
partir do tablet (`className="hidden flex-wrap @tab:flex"`), como primeiro item do conteúdo. O
componente já começa em "Início" (link para `/`): passe só o caminho depois dele, terminando na
tela atual sem `href` (ex.: `[{ label: "Investimentos", href: "/investimentos" }, { label:
"Adicionar investimento" }]`). Tela raiz de um módulo: `[{ label: "Metas" }]`; Início: `[]`.

## Editor de layout (Início e Gastos)

Código em `src/features/layout`; os blocos de cada tela em `src/features/inicio/layout.ts` e
`src/features/gastos/layout.ts` (`BlockDef`). O app mobile tem o mesmo editor
(`apps/mobile/src/features/layout`, repositório do app) e **os ids dos blocos são iguais nos dois**:
o layout é da conta, e o que se salva num aparece igual no outro.

- **O que a pessoa muda:** a ordem (arrastar com mouse, toque longo de 250 ms ou teclado pela
  alça), a largura (1/4, 1/3, metade, 2/3, 3/4 ou toda, entre o menor e o maior de `sizes` do
  bloco; alça do lado ou − e +, só no tablet e no desktop) e ocultar/reexibir. **A altura é
  sempre a do conteúdo:** a escolha de altura foi removida a pedido (17/11/2026). Não
  reintroduza altura editável.
- **No tablet:** na largura padrão vale `tablet` do `BlockDef`; depois de mudar, até 6 colunas é
  metade, acima disso a largura toda. No celular, todo bloco ocupa a largura toda.
- **Onde fica salvo:** `PUT/GET /v1/me/layouts/:screen` (`home` ou `spending`), com cópia em
  `localStorage` (`guara:layout:<tela>`) que sincroniza depois se estiver sem conta ou internet.
  O site nunca chama o `DELETE` (o `apiRequest` não lê 204): "Restaurar padrão" grava o padrão.
- **Formato salvo:** `columns` (colunas de 12, só as pré-definidas), com `size`/`height: "auto"`/
  `compact` preenchidos para leitores antigos. `minHeight` e `height` salvos antes (ou pelo app)
  são ignorados ao ler (`mergeLayout`); sem `columns`, `size` vira colunas.
- **App mobile:** o editor do app ainda muda a altura e não a largura. Como o layout é da conta,
  salvar no site descarta as alturas do app; se o app não preservar `columns` ao salvar, as
  larguras do site voltam ao `size` (não confirmado: o código do app não está nesta pasta).
- **Bloco novo:** `BlockDef` com o mesmo id no app, `case` no `renderBlock` da tela. Layouts
  salvos antes recebem o bloco na posição padrão.
- **Campo novo no bloco salvo:** a API valida com `strictObject`, então **publique a API antes**
  do site e do app, senão o `PUT` falha com 422.
- Movimento do editor (dnd-kit + Motion): exceção registrada em `docs/ux/README.md`.

## Gráficos (`src/components/charts`)

- **Largura real:** `ChartBox` + `ChartSvg fill` desenham o gráfico na largura e na altura que o
  bloco tem (1 unidade = 1 px), então o texto fica sempre em tamanho de leitura. `ChartFit`
  escolhe a variante pela largura do próprio bloco, não da tela.
- **Barras com valor do dado** (`style={{ width }}`): sempre por `barWidth()` (`lib/bar-width.ts`,
  limita a 0–100%); um teto estourado (R$ 1.064 de R$ 750) não pode sair do card.
- **Rótulos nunca se sobrepõem:** use as regras puras e testadas (`paceLabels`, `endLabels`,
  `halo`, `textWidth`) em vez de posições fixas do design. O valor do mês atual fica na barra
  dele, não na previsão.
- **Escalas seguem o dado:** os números do design são só exemplo; um gráfico com preço acima do
  alvo, retorno negativo ou meta acima da projeção precisa continuar dentro da área.
- Ao mexer num gráfico, teste com dados extremos (valor perto do outro, negativo, muito maior que o
  padrão) editando `data.ts` só localmente, e confira em celular, tablet e desktop.
