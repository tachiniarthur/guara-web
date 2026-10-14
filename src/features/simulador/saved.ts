import type { IconName } from "@/components/ui/icon";

/** Simulações salvas (cada uma abre o simulador com os números do dia em que foi salva). */
export type SavedSimulation = {
  id: string;
  tipo: "Aposentadoria" | "Objetivo" | "Corte de gasto";
  icone: IconName;
  href: string;
  nome: string;
  valor: string;
  resumo: string;
  salva: string;
};

export const savedSimulations: SavedSimulation[] = [
  {
    id: "aposentadoria-55",
    tipo: "Aposentadoria",
    icone: "loader",
    href: "/simulador",
    nome: "Aposentadoria aos 55",
    valor: "R$ 5.640/mês",
    resumo: "para R$ 10.000 de renda em 2051",
    salva: "Salva em 23/09/2026",
  },
  {
    id: "japao",
    tipo: "Objetivo",
    icone: "target",
    href: "/simulador/objetivo",
    nome: "Viagem para o Japão",
    valor: "R$ 1.310/mês",
    resumo: "R$ 30.000 em abril de 2028",
    salva: "Salva em 23/09/2026 · virou meta",
  },
  {
    id: "transporte",
    tipo: "Corte de gasto",
    icone: "trending-up",
    href: "/simulador/corte",
    nome: "Cortar transporte por app",
    valor: "R$ 312/mês",
    resumo: "R$ 46 mil em 10 anos",
    salva: "Salva em 20/09/2026",
  },
  {
    id: "aposentadoria-60",
    tipo: "Aposentadoria",
    icone: "loader",
    href: "/simulador",
    nome: "Aposentadoria aos 60",
    valor: "R$ 4.150/mês",
    resumo: "mesma renda, 5 anos depois",
    salva: "Salva em 12/09/2026",
  },
];
