# Funcionalidades futuras (desenhadas, ainda sem dado real)

Telas e partes de tela que **existem no design e precisam voltar** quando a API tiver o dado
(cotações e dados de mercado contratados, mais campos do Open Finance, etc.). Elas saíram das telas
reais porque mostravam números inventados, **não porque deixaram de fazer parte do produto**.
Antes de remover qualquer coisa do protótipo, registre aqui o que era e onde recuperar.

Recuperar o código original: `git show "db0c927^:<caminho>"` (commit que tirou os dados fixos de
Investimentos e Metas, 17/11/2026). Exemplo:
`git show "db0c927^:src/features/ativo/components/stock-detail.tsx"`.

## Página do ativo (`/investimentos/<id da posição>`)

Hoje a página, **Mais detalhes** (`/detalhes`) e **Gráfico** (`/grafico`) mostram só o que a API
manda (posição, cotação, histórico, desempenho, proventos, eventos). Falta, do design:

| O que                                                                 | Precisa de                                 | Onde estava (db0c927^)                                                       |
| --------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| "Sobre a empresa" e indicadores (P/L, P/VP, ROE…)                     | fundamentos completos por ativo            | `src/features/ativo/components/stock-detail.tsx`, `components/parts.tsx`     |
| Indicadores por período em tabela (1M…5A)                             | desempenho por período de qualquer ativo   | `IndicatorsTable`/`IndicatorsList` em `components/parts.tsx`                 |
| Fundos, ETF, FII e cripto comparados ao CDI                           | série do ativo e do CDI, taxas e condições | `components/compared-detail.tsx`, `ComparedChart` em `components/charts.tsx` |
| Gráfico de proventos (barras por pagamento)                           | histórico de proventos por ativo           | `DividendsChart` em `src/features/ativo/components/charts.tsx`               |
| Gráfico ampliado comparando com Ibovespa/CDI/IFIX                     | séries de índices                          | `src/features/ativo/more.ts` (`compareOptions`, `chartDetails`)              |
| Histórico ajustado por proventos                                      | série ajustada                             | `line-compare-chart.tsx`, `chart-controls.tsx`                               |
| Ficha completa com campos do fundo (taxa de adm., carência, liquidez) | cadastro do fundo                          | `assetFacts` em `src/features/ativo/more.ts`                                 |

Os dados fixos de referência (PETR4, séries de 200 pontos) estão em `src/features/ativo/data.ts`
e `src/features/ativo/series.ts` no mesmo commit.

## Alocação em 5 grupos e perfil Sofisticado

A API tem 3 perfis (Conservador, Moderado, Arrojado) e 4 classes. O design tem 5 grupos com
subclasses e um 4º perfil (Sofisticado). O protótipo continua no código como referência:
`src/features/alocacao/prototype.ts`; os componentes originais em
`db0c927^:src/features/alocacao/components/allocation-parts.tsx` e `profile-card.tsx`.
Precisa de: subclasses na API e o perfil a mais no questionário (`guara-api`,
`src/shared/investor-profile/questionnaire.ts`).

## Metas

- **"Como guardar"**: dia do depósito, lembretes e valor mensal combinado
  (`db0c927^:src/features/metas/components/how-to-save.tsx`). Precisa de campos e lembretes na
  API de metas.
- **Projeção** da meta (quando chega no ritmo atual) e "Onde guardar" com as aplicações livres
  (`db0c927^:src/features/metas/data.ts`, `ownSaveOptions`).

## Investimento duplicado

A tela real (`/investimentos/duplicidade`) oferece **Excluir o cadastro manual** ou **Manter
separados**. O design tinha também **Somar os dois**; ficou de fora porque o valor do Open Finance
é sobrescrito a cada sincronização (a soma se perderia). O nome do banco na etiqueta do Open
Finance também falta: a posição ainda não diz de qual conexão veio.

## Bens (imóveis e veículos)

Campos do formulário original que a API ainda não guarda (endereço, área, financiamento, placa,
etc.): `db0c927^:src/features/bens/data.ts` (`propertyDraft`, `vehicleDraft`, `propertyDetail`,
`vehicleDetail`).

## Cadastro de investimento

Prévia do efeito na carteira enquanto se cadastra:
`db0c927^:src/features/investimentos/components/position-preview.tsx`. A API já tem
`/v1/investments/positions/preview`; falta religar a tela.

## Onboarding

`/onboarding/bancos/<banco>/sucesso` ainda mostra o resumo fixo do design ("O que encontramos",
"Bancos conectados"). O aviso de duplicidade nessa tela já é real (só aparece se a API achar).
