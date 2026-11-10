import type { BlockDef } from "@/features/layout/model";

/** Blocos de Gastos que a pessoa pode mover, mudar de altura e ocultar, na ordem do design. */
export const SPENDING_BLOCKS: readonly BlockDef[] = [
  {
    id: "ritmo",
    label: "Ritmo do mês",
    defaultSize: "s",
    tablet: "full",
  },
  { id: "meses", label: "Últimos 6 meses", defaultSize: "s" },
  { id: "semana", label: "Por dia da semana", defaultSize: "s" },
  {
    id: "categorias",
    label: "Por categoria",
    defaultSize: "m",
    tablet: "full",
  },
  {
    id: "lancamentos",
    label: "Lançamentos",
    defaultSize: "m",
    tablet: "full",
  },
  { id: "tetos", label: "Tetos do mês", defaultSize: "m" },
  { id: "previsao", label: "Previsão do mês", defaultSize: "m" },
];
