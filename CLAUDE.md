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
