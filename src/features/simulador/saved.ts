import type { IconName } from "@/components/ui/icon";

import type { Simulation, SimulatorId } from "./data";

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

const kinds: Record<SimulatorId, { tipo: SavedSimulation["tipo"]; icone: IconName; href: string }> =
  {
    aposentadoria: { tipo: "Aposentadoria", icone: "loader", href: "/simulador" },
    objetivo: { tipo: "Objetivo", icone: "target", href: "/simulador/objetivo" },
    corte: { tipo: "Corte de gasto", icone: "trending-up", href: "/simulador/corte" },
  };

const savedDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

/**
 * A simulação aberta como item de Simulações salvas. O `id` junta o tipo e os números, então
 * salvar de novo a mesma simulação não duplica.
 */
export function toSavedSimulation(simulation: Simulation, now = new Date()): SavedSimulation {
  const kind = kinds[simulation.id];
  const { result } = simulation;
  const { nome, resumo } = result.save;
  const valor = `${result.metric}/mês`;
  return {
    id: `${simulation.id}:${nome}:${valor}`,
    ...kind,
    nome,
    valor,
    resumo,
    salva: `Salva em ${savedDate.format(now)}`,
  };
}
