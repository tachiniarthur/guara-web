# Desempenho da navegação

Auditoria de 04/11/2026. Medido com Playwright num build de produção (`next build` + `next start`,
modo protótipo), clicando no menu lateral de uma aba para a outra. A rede foi simulada com 200 ms de
latência, o tempo que as funções da Vercel levavam para responder (elas rodavam nos EUA,
`gru1::iad1`). Valores são a mediana de 5 rodadas. Scripts de medição: `nav.js`, `idle.js`,
`parity.js` (fora do repositório).

## O que causava a lentidão

1. **Abas renderizadas no servidor a cada clique.** Início, Gastos, Assinaturas, Investimentos,
   Metas, Relatórios, Alertas, Conversas, Posições e o detalhe do ativo liam `searchParams` (para
   os estados do protótipo, `?estado=erro` etc.). Isso as tornava dinâmicas (ƒ): o Next não as
   pré-carrega, e cada clique esperava uma ida ao servidor (nos EUA) para o conteúdo e outra para
   o JavaScript da página, sem nada na tela até a resposta. Simulador e Assistentes, que não liam
   a URL, já eram geradas no build e abriam em ~40–70 ms.
2. **Investimentos era a maior**: 470 KB de HTML e ~2.800 nós no DOM (as outras: 120–280 KB e
   600–1.200 nós), por isso a mais lenta das dinâmicas.
3. **Globo de Investimentos** redesenhava ~12 mil pontos a cada quadro (60 por segundo) enquanto
   gira sozinho, criando objetos e textos por ponto e medindo os rótulos a cada quadro (o que força
   o layout). Custava ~8% da thread principal o tempo todo num computador rápido.

Não havia back-end envolvido na troca de abas: as telas usam dados do protótipo e a API só é
chamada uma vez por sessão (`GET /v1/me`, com cache de 30 min).

## O que mudou

- **Telas geradas no build.** A tela de cada aba foi para `<rota>-screen.tsx` (com a prop `estado`)
  e a `page.tsx` só a renderiza sem estado. Com `?estado=`, o `src/proxy.ts` reescreve a requisição
  para `/previa/<estado>/<rota>`, que desenha a mesma tela no estado pedido; o endereço não muda.
  Assim os estados do protótipo continuam funcionando, e a navegação normal não passa pelo
  servidor: os links pré-carregam a página inteira e ela é servida da borda.
- **Globo:** laço dos pontos sem alocação (projeção no próprio laço, cor como índice), tamanho dos
  rótulos medido uma vez, e 30 quadros por segundo no giro automático (60 ao arrastar, na inércia e
  ao girar até um país). O desenho é o mesmo (conferido em captura).
- **Região das funções da Vercel em São Paulo** (`vercel.json`, `gru1`) para as rotas que ainda
  são dinâmicas.

## Antes × depois

Clique no menu até a tela nova (ms):

| Aba           | Antes | Depois |
| ------------- | ----: | -----: |
| Início        |   270 |     60 |
| Gastos        |   486 |     78 |
| Assinaturas   |   473 |     64 |
| Investimentos |   506 |     98 |
| Simulador     |    66 |     72 |
| Metas         |   261 |     55 |
| Relatórios    |   466 |     59 |
| Alertas       |   257 |     48 |
| Assistentes   |    38 |     41 |

- Tempo até a página ficar interativa: igual ao da tela (sem tarefas longas depois do clique, nos
  dois casos).
- Requisições por navegação: de 1–16 para 0–13. As que sobram são pré-carregamentos dos links da
  página nova, que não bloqueiam a tela.
- Commits do React por navegação: iguais (3–6).
- Memória JS: de 14 para 12 MB.
- Globo com Investimentos parada: thread principal ocupada de ~7,8% para ~2,4%.
- Paridade: 135 combinações (15 rotas × 9 estados) comparadas entre o build antigo e o novo; 134
  idênticas em texto, status e endereço. A diferença foi um erro de hidratação intermitente em
  `/investimentos/posicoes?estado=erro`, que não se repetiu em 6 tentativas nos dois builds.

## Atenção na medição

O primeiro desenho num canvas leva ~4 ms normalmente, mas ~2.100 ms no Chrome headless com a CPU
desacelerada pelo DevTools (inicialização gráfica). Com CPU 4× mais lenta, Investimentos chegava a
4–26 s por causa disso, o que não acontece num aparelho real. Por isso a comparação acima é sem
desaceleração de CPU.

## Pendências

- **API no plano gratuito do Render:** dorme após 15 min sem uso; a primeira chamada levou 33,6 s
  (as seguintes, ~0,5 s). Com login de verdade, isso aparece como "Preparando sua conta…" ao abrir
  o site. Resolve com plano pago (decisão de custo).
- **API na Virgínia e banco em São Paulo:** cada `GET /v1/me` faz 5 idas e voltas sequenciais ao
  banco (transação, papel, claims, consulta, commit). Juntar papel e claims num comando economiza
  uma por requisição; mexe no caminho do RLS e precisa dos testes e2e (Docker) antes.
- **Rotas ainda dinâmicas** (menos usadas): lançamentos e detalhe, alertas de preço e tetos,
  metas (detalhe e nova), notificações, configurações, simulações salvas, gráfico do ativo e
  `perfil/investidor`. Estão em São Paulo agora; podem seguir o mesmo caminho da prévia.
- **Três variantes no DOM:** as telas desenham celular, tablet e desktop e escondem por CSS
  (Investimentos tem ~2.800 nós por isso). Trocar por renderização por largura no cliente
  mudaria o layout no primeiro quadro; fica como está.
