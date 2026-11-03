# UX, movimento e consistência visual

Referência única de movimento e interação do site, e o acompanhamento da revisão de UX/UI.
Antes de animar algo ou criar um componente interativo, leia **Padrão de movimento**; ao terminar
um item, atualize **Acompanhamento**.

Skills usadas na revisão (Claude Code): `emil-design-eng` (princípios), `improve-animations` +
`find-animation-opportunities` (diagnóstico consolidado abaixo), `web-design-engineer` (modo
"Redesign · Preserve": evoluir sem trocar a identidade), `frontend-design` (restrição: movimento que
responde a uma ação; nada de hover e entrada decorativa em tudo), `dataviz` (gráficos),
`mobile-native` (toque), `animation-performance` e `break-ui` (validação).

## Padrão de movimento (Motion Design System)

Tudo vive em `src/app/globals.css` (tokens no `@theme`, comportamentos globais no fim do arquivo)
e em poucos componentes de `src/components`. **Não crie keyframes, curvas ou durações por tela.**

### Princípios

1. **Movimento responde à pessoa.** Apertar, abrir, fechar, expandir, trocar de opção e passar o
   ponteiro num dado mostram o que mudou. Movimento sozinho (decorativo) só em momentos raros
   (onboarding, conquista).
2. **Rápido.** Interface abaixo de 300 ms; saída mais rápida que a entrada. Ações de teclado não
   animam.
3. **Sai como entrou.** Quem entra deslizando de baixo sai para baixo; nada some "seco".
4. **Só `transform` e `opacity`** (e `clip-path`), salvo exceção registrada aqui.
5. **Menos movimento pedido no sistema:** sem deslocamentos; trocas de cor e opacidade continuam
   (o bloco `prefers-reduced-motion` no fim do `globals.css` zera as durações).
6. **Hover só com mouse:** efeitos de hover que movem algo ficam em
   `@media (hover: hover) and (pointer: fine)` (as variantes `hover:` do Tailwind 4 já fazem isso;
   o CSS escrito à mão precisa do media query). Nada depende só de hover.

### Curvas (`--ease-*`, viram `ease-*` no Tailwind)

| Token                | Valor                             | Uso                                                 |
| -------------------- | --------------------------------- | --------------------------------------------------- |
| `--ease-out-soft`    | `cubic-bezier(0.22, 1, 0.36, 1)`  | Entradas, saídas, resposta ao toque (padrão)        |
| `--ease-in-out-soft` | `cubic-bezier(0.77, 0, 0.175, 1)` | Algo que **anda** na tela (indicador de aba, morph) |
| `--ease-drawer`      | `cubic-bezier(0.32, 0.72, 0, 1)`  | Gavetas e painéis que deslizam (chat, folhas)       |
| `ease` (CSS)         | —                                 | Só troca de cor no hover                            |

### Durações (`--duration-*`, use `duration-(--duration-press)` no Tailwind)

| Token                | Valor   | Uso                                                      |
| -------------------- | ------- | -------------------------------------------------------- |
| `--duration-press`   | 140 ms  | Encolher ao apertar (`scale 0.97`) e voltar              |
| `--duration-hover`   | 180 ms  | Cor, fundo e borda no hover e no foco                    |
| `--duration-move`    | 240 ms  | Indicador de aba/segmento, interruptor, morph de valores |
| `--duration-popover` | 200 ms  | Menus e popovers (crescem a partir do gatilho)           |
| `--duration-dialog`  | 260 ms  | Diálogos centralizados                                   |
| `--duration-sheet`   | 380 ms  | Gavetas e painéis (chat, folha de baixo)                 |
| `--duration-exit`    | 170 ms  | Toda saída (diálogo, menu, gaveta, aviso)                |
| `--duration-expand`  | 300 ms  | Expandir e recolher (`Collapse`)                         |
| `--duration-enter`   | 420 ms  | Conteúdo da página entrando (cascata)                    |
| `--duration-chart`   | 1200 ms | Gráfico se desenhando ao entrar (linhas: 1800 ms)        |

### Comportamentos globais (use em vez de reinventar)

| Precisa de…                                           | Use                                                                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Resposta ao apertar (botão, chip, ícone)              | utilitário `pressable` (já está em `Button`, `IconButton`, controles segmentados, chips)                                      |
| Card ou linha clicável                                | `rounded-card` / `rounded-tile` / `rounded-bubble` em `a`/`button`: sobe 2px no hover (mouse) e afunda ao apertar, automático |
| Abrir e fechar overlay (diálogo, menu, gaveta, aviso) | `<Presence show={…}>` em volta + `data-motion="dialog                                                                         | sheet | panel | menu | toast-top | toast-bottom | backdrop"` no elemento: entrada e saída vêm do CSS |
| Expandir e recolher                                   | `<Collapse open={…}>` (`components/ui/collapse.tsx`)                                                                          |
| Valor que muda (outro perfil, outro período)          | `useTween` / `useTweenNumber` (`src/hooks/use-tween.ts`)                                                                      |
| Botão que navega e espera                             | `PendingLinkButton` (spinner até a tela abrir)                                                                                |
| Gráfico com leitura ao passar o ponteiro              | `ChartInspector` (`components/charts/inspector.tsx`)                                                                          |
| Conteúdo da página entrando                           | `Page` já aplica `stagger`; cards de grade usam `card-enter` (via `Card`)                                                     |

## Diagnóstico consolidado

`improve-animations` (o que já existe) + `find-animation-opportunities` (o que falta), sem
repetição. Frequência: **alta** = várias vezes por dia; **ocasional** = diálogos, menus; **rara** =
onboarding.

| #    | Onde                                                        | Achado                                                                         | Propósito             | Freq.     |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------- | --------- |
| M-01 | Diálogos, chat, menus, avisos, termo de troca de perfil     | Entram animados e **somem de uma vez** ao fechar                               | Continuidade espacial | Ocasional |
| M-02 | `IconButton`, segmentados, pílulas, chips, linhas clicáveis | Sem resposta ao apertar (só `Button` tinha)                                    | Feedback              | Alta      |
| M-03 | Cards clicáveis (`globals.css`)                             | Elevação no hover sem `hover: hover` → fica "presa" depois do toque no celular | Acessibilidade/toque  | Alta      |
| M-04 | Links e botões com `hover:` sem `transition`                | Cor troca seca                                                                 | Feedback              | Alta      |
| M-05 | `Switch`                                                    | A bolinha teletransporta                                                       | Indicar estado        | Ocasional |
| M-06 | `SegmentedControl`, `PillToggle`                            | A opção marcada teletransporta                                                 | Indicar estado        | Alta      |
| M-07 | 18 gráficos                                                 | Nenhuma leitura ao passar o ponteiro/tocar (sem tooltip, destaque ou teclado)  | Compreensão dos dados | Alta      |
| M-08 | Blocos que expandem                                         | Abrem e fecham secos                                                           | Indicar estado        | Ocasional |
| M-09 | Durações espalhadas (0.15s, 0.2s, 200/300/500/700 ms…)      | Sem tokens de duração; curvas de gaveta/movimento faltando                     | Coesão                | —         |
| M-10 | Campos (`inputClass`)                                       | Borda troca seca no hover/foco                                                 | Feedback              | Alta      |
| M-11 | Entrada das páginas (`stagger` + `card-enter`)              | Até ~1,2 s até o último card assentar em toda navegação                        | Evitar lentidão       | Alta      |
| M-12 | Chat fixo à direita (≥ 1600 px)                             | Troca histórico ↔ conversa seca                                                | Continuidade espacial | Ocasional |

**Rejeitados (de propósito):**

- Busca "⌘K" e atalhos de teclado: **não animam** (ação de teclado, alta frequência).
- Escala no hover de cards e ícones (`hover:scale-*`): decorativo em superfície vista dezenas de
  vezes por dia; fica só a elevação de 2px já existente.
- Linhas de gráfico se redesenhando a cada troca de período: o dado está sendo lido; a troca é um
  esmaecer curto, não um novo desenho.
- Contagem dos números grandes: já existe e segue o app; não estender a valores de lista.
- Parallax e brilhos seguindo o ponteiro fora da textura Mata: decorativo em app financeiro.

## Acompanhamento

Status: **pendente** · **em andamento** · **implementado** · **validado** (visto no navegador).

| Item | Tela ou componente            | Melhoria planejada                                   | Status                                    | Alterações                                                                                                                                                                                                            | Validação                                                       |
| ---- | ----------------------------- | ---------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| M-09 | `globals.css`                 | Tokens de curva e duração                            | implementado                              | `--ease-in-out-soft`, `--ease-drawer`, `--duration-*` no `:root`                                                                                                                                                      | build e testes                                                  |
| M-02 | componentes de ação           | Utilitário `pressable`                               | implementado                              | `Button`, `IconButton`, `chip.ts` (chips, segmentos, menus em pílula), segmentados, pílulas, menu Exportar; linhas (`ListRow`, `ActionList`) escurecem ao apertar                                                     | build e testes                                                  |
| M-03 | `globals.css`                 | Hover de card só com mouse                           | implementado                              | `@media (hover: hover) and (pointer: fine)` + `translate: none` com menos movimento                                                                                                                                   | Playwright (desktop)                                            |
| M-04 | `globals.css`                 | Transição de cor padrão em `a`/`button`              | implementado                              | regra `:where(...)` na camada base                                                                                                                                                                                    | build                                                           |
| M-10 | `form.tsx`                    | Transição de borda nos campos                        | implementado                              | `inputClass`: borda `grid` no hover, `mist` no foco                                                                                                                                                                   | build                                                           |
| M-05 | `switch.tsx`                  | Bolinha desliza                                      | validado                                  | `translate` + `peer-active:scale-90`                                                                                                                                                                                  | Playwright: 15px → 2,9px (70 ms) → 0                            |
| M-06 | segmentados                   | Indicador que desliza                                | validado                                  | `SlidingGroup` + `useActiveIndicator`; em `SegmentedControl`, `PillToggle`, `SegmentedTiles` e `ViewModeToggle` (Gastos)                                                                                              | Playwright: 3px → 15,8px (90 ms) → 99px                         |
| M-01 | `Presence` + overlays         | Saída animada em todos os overlays                   | validado                                  | `data-motion` + `Presence` em `ConfirmDialog`/`UrlDialog`, risco, desconectar, comparar, exportar (diálogos e menu), menu da conta, ações da conversa, anexar, chat por cima, termo de troca de perfil, `StatusToast` | Playwright: `menu-out`, `panel-out` ao fechar; removidos depois |
| M-08 | `Collapse`                    | Expandir/recolher padrão                             | implementado                              | `components/ui/collapse.tsx`; comparação do perfil (onboarding) usa                                                                                                                                                   | testes                                                          |
| M-11 | `globals.css`                 | Entrada de página mais curta                         | implementado                              | `stagger` 40 ms (até 240 ms), `card-enter` 60 ms, sobe 0,5rem em `--duration-enter`                                                                                                                                   | build                                                           |
| M-12 | `chat-panel.tsx`              | Chat fixo entra deslizando                           | implementado                              | `data-motion="panel"` no `ChatPanel`                                                                                                                                                                                  | build                                                           |
| M-07 | gráficos                      | `ChartInspector` (tooltip, destaque, toque, teclado) | pendente                                  |                                                                                                                                                                                                                       |                                                                 |
| A-01 | Investimentos (`GroupToggle`) | "Lista / Por classe" parece clicável e não faz nada  | pendente (funcional: decidir com produto) |                                                                                                                                                                                                                       |                                                                 |
| A-*  | todas as telas                | Auditoria de espaçamento, tipografia e componentes   | pendente                                  |                                                                                                                                                                                                                       |                                                                 |
