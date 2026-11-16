@AGENTS.md

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
  alça), a altura (automática, P, M, G, GG ou XG, pela alça de baixo; dois cliques voltam à
  automática) e ocultar/reexibir. **A largura é sempre a do design** (`defaultSize`/`tablet`):
  o redimensionamento horizontal foi removido de propósito, porque causava problemas de layout.
  Não reintroduza largura editável.
- **A altura é mínima:** o bloco nunca corta o conteúdo, os gráficos crescem até ela
  (`components/charts/chart-box.tsx`).
- **Onde fica salvo:** `PUT/GET /v1/me/layouts/:screen` (`home` ou `spending`), com cópia em
  `localStorage` (`guara:layout:<tela>`) que sincroniza depois se estiver sem conta ou internet.
  O site nunca chama o `DELETE` (o `apiRequest` não lê 204): "Restaurar padrão" grava o padrão.
- **Formato salvo:** `minHeight` (px, só os presets), com `size`/`height`/`compact` preenchidos
  para leitores antigos. `columns` de layouts antigos e `height: "short"` (que cortava o bloco)
  são ignorados ao ler (`mergeLayout`).
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
