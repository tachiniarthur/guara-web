import type { BlockDef } from "@/features/layout/model";

/** Blocos de Gastos que a pessoa pode mover, redimensionar e ocultar, na ordem do design. */
export const SPENDING_BLOCKS: readonly BlockDef[] = [
  {
    id: "ritmo",
    label: "Ritmo do mês",
    defaultSize: "s",
    sizes: ["s", "m", "l", "xl"],
    tablet: "full",
  },
  { id: "meses", label: "Últimos 6 meses", defaultSize: "s", sizes: ["s", "m", "l", "xl"] },
  { id: "semana", label: "Por dia da semana", defaultSize: "s", sizes: ["s", "m", "l", "xl"] },
  {
    id: "categorias",
    label: "Por categoria",
    defaultSize: "m",
    sizes: ["m", "l", "xl"],
    tablet: "full",
  },
  {
    id: "lancamentos",
    label: "Lançamentos",
    defaultSize: "m",
    sizes: ["s", "m", "l", "xl"],
    tablet: "full",
  },
  { id: "tetos", label: "Tetos do mês", defaultSize: "m", sizes: ["s", "m", "l", "xl"] },
  { id: "previsao", label: "Previsão do mês", defaultSize: "m", sizes: ["s", "m", "l", "xl"] },
];
