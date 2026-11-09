import type { BlockDef } from "@/features/layout/model";

/**
 * Blocos do Início que a pessoa pode mover, redimensionar e ocultar, na ordem padrão (a do
 * design). Os grupos são as seções da tela: um bloco troca de lugar dentro da sua seção.
 */
export const HOME_BLOCKS: readonly BlockDef[] = [
  {
    id: "resumo",
    label: "Resumo do mês",
    defaultSize: "l",
    sizes: ["m", "l", "xl"],
    group: "resumo",
  },
  {
    id: "pendencias",
    label: "Pendências",
    defaultSize: "s",
    sizes: ["s", "m", "l", "xl"],
    group: "resumo",
    tablet: "full",
  },
  {
    id: "investimentos",
    label: "Investimentos",
    defaultSize: "xs",
    sizes: ["xs", "s", "m"],
    group: "visao",
  },
  {
    id: "cobrancas",
    label: "Próximas cobranças",
    defaultSize: "xs",
    sizes: ["xs", "s", "m"],
    group: "visao",
  },
  { id: "metas", label: "Metas", defaultSize: "xs", sizes: ["xs", "s", "m"], group: "visao" },
  {
    id: "alertas",
    label: "Alertas de preço",
    defaultSize: "xs",
    sizes: ["xs", "s", "m"],
    group: "visao",
  },
  {
    id: "categorias",
    label: "Gastos por categoria",
    defaultSize: "l",
    sizes: ["m", "l", "xl"],
    group: "detalhes",
  },
  {
    id: "lancamentos",
    label: "Últimos lançamentos",
    defaultSize: "s",
    sizes: ["s", "m", "l", "xl"],
    group: "detalhes",
    tablet: "full",
  },
];
