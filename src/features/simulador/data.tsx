import type { ReactNode } from "react";

import type { IconName } from "@/components/ui/icon";
import type { AgentId } from "@/features/assistentes/data";

import {
  buildCut,
  buildGoal,
  buildRetirement,
  CUT_START,
  GOAL_START,
  RETIREMENT_START,
} from "./build";
import type { ProjectionSeries } from "./projection";

export type SimulatorId = "aposentadoria" | "objetivo" | "corte";

export const simulators: { id: SimulatorId; href: string; label: string; shortLabel: string }[] = [
  { id: "aposentadoria", href: "/simulador", label: "Aposentadoria", shortLabel: "Aposentadoria" },
  {
    id: "objetivo",
    href: "/simulador/objetivo",
    label: "Juntar para um objetivo",
    shortLabel: "Objetivo",
  },
  { id: "corte", href: "/simulador/corte", label: "Cortar um gasto", shortLabel: "Cortar gasto" },
];

export type Tone = "sand" | "folha" | "urucum" | "arara" | "tucano" | "caption";

/** Bloco de destaque com ícone (fundo rebaixado). */
export type Tip = { icon: IconName; color: string; content: ReactNode };

/** Controles das premissas. Com `onChange`/`onToggle`, mexer recalcula a simulação na hora. */
export type PremiseField =
  | {
      kind: "slider";
      id: string;
      label: string;
      /** Valor escrito ao lado do rótulo ("25 anos", "R$ 10.000"). */
      display: string;
      value: number;
      min: number;
      max: number;
      step: number;
      hint: string;
      onChange?: (value: number) => void;
    }
  | {
      kind: "text";
      id: string;
      label: string;
      value: string;
      hint?: string;
      onChange?: (value: string) => void;
    }
  | {
      kind: "chips";
      label: string;
      options: readonly string[];
      pressed: readonly string[];
      multiple?: boolean;
      onToggle?: (option: string) => void;
    }
  | { kind: "note"; text: string }
  | { kind: "tip"; tip: Tip };

export type InfoRow = { title: string; detail?: string; value: string; tone: Tone };

export type DetailSection =
  | {
      kind: "timeline";
      title: string;
      subtitle: string;
      /** Largura da coluna de datas. */
      labelWidth: "narrow" | "wide";
      color: "arara" | "folha";
      items: { when: string; title: string; note: string; done?: boolean }[];
    }
  | {
      kind: "composition";
      title: string;
      subtitle: string;
      slices: { label: string; amount: string; percent: string; width: number; color: string }[];
      tip: Tip;
    }
  | {
      kind: "rows";
      title: string;
      subtitle: string;
      rows: InfoRow[];
      tip?: Tip;
      action?: { label: string; icon: IconName; href: string };
    };

export type Simulation = {
  id: SimulatorId;
  subtitle: string;
  premises: { fields: PremiseField[]; summary: [string, string][] };
  result: {
    /** Sem dados para simular (corte de um gasto sem histórico): só a mensagem. */
    empty?: string;
    title: string;
    subtitle: string;
    metricLabel: string;
    metric: string;
    detail: ReactNode;
    chart: {
      series: ProjectionSeries;
      color: "arara" | "folha";
      goal?: { value: number; label: string };
      ticks: { index: number; label: string }[];
      /** Nome de cada ponto da série na leitura do gráfico. */
      pointLabels: string[];
      label: string;
    };
    legend: { label: string; swatch: "line" | "dashed"; color: string }[];
    scenarios: { name: string; detail: string; value: string; current?: boolean }[];
    primary: { label: string; href?: string };
    disclaimer: string;
  };
  /** Três cards do meio (desktop: em linha; tablet: dois lado a lado e um inteiro). */
  details: [DetailSection, DetailSection, DetailSection];
  /** Card ao lado da conversa, no fim da página. */
  closing: DetailSection;
  agent: { id: AgentId; name: string; questions: string[] };
};

/** As três simulações com as premissas do design (cards fora do simulador, como o do chat). */
export const simulations: Record<SimulatorId, Simulation> = {
  aposentadoria: buildRetirement(RETIREMENT_START),
  objetivo: buildGoal(GOAL_START),
  corte: buildCut(CUT_START),
};
