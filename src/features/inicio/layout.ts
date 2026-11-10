import type { BlockDef } from "@/features/layout/model";

/**
 * Blocos do Início que a pessoa pode mover, mudar de altura e ocultar, na ordem padrão (a do
 * design). Os grupos são as seções da tela: um bloco troca de lugar dentro da sua seção.
 */
export const HOME_BLOCKS: readonly BlockDef[] = [
  {
    id: "resumo",
    label: "Resumo do mês",
    defaultSize: "l",
    group: "resumo",
  },
  {
    id: "pendencias",
    label: "Pendências",
    defaultSize: "s",
    group: "resumo",
    tablet: "full",
  },
  {
    id: "investimentos",
    label: "Investimentos",
    defaultSize: "xs",
    group: "visao",
  },
  {
    id: "cobrancas",
    label: "Próximas cobranças",
    defaultSize: "xs",
    group: "visao",
  },
  { id: "metas", label: "Metas", defaultSize: "xs", group: "visao" },
  {
    id: "alertas",
    label: "Alertas de preço",
    defaultSize: "xs",
    group: "visao",
  },
  {
    id: "categorias",
    label: "Gastos por categoria",
    defaultSize: "l",
    group: "detalhes",
  },
  {
    id: "lancamentos",
    label: "Últimos lançamentos",
    defaultSize: "s",
    group: "detalhes",
    tablet: "full",
  },
];
