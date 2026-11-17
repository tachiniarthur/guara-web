import type { IconName } from "@/components/ui/icon";

/** O formato do Relatório na tela: o protótipo e o modo real montam este mesmo objeto. */

export type ReportTone = "arara" | "sand" | "folha" | "urucum" | "tucano" | "caption";

/** Trecho de um texto montado, com o destaque em negrito. */
export type TextPart = { texto: string; forte?: boolean };

export type ReportStat = { label: string; value: string; tone: ReportTone };

export type BalanceEvent = {
  /** Posição do ponto na série. */
  index: number;
  label: string;
  tone: "arara" | "urucum";
  labelRow: 0 | 1;
};

/** Saldo ponto a ponto (dia ou mês), em reais, com a previsão tracejada depois do último. */
export type BalanceSeries = {
  values: number[];
  /** Começa no último valor real; vazio sem previsão. */
  projection: number[];
  /** Nome de cada ponto real e de cada ponto da previsão (sem o primeiro, que é o real). */
  titles: string[];
  projectionTitles: string[];
  events: BalanceEvent[];
  axis: { index: number; label: string; strong?: boolean }[];
  label: string;
};

/** Entradas e saídas por grupo (dia, semana ou mês), em reais. */
export type FlowSeries = {
  groups: { label: string; short: string; entrou: number; saiu: number }[];
  label: string;
};

export type TimelineEntry = {
  date: string;
  title: string;
  detail: string;
  amount: string;
  tone: "urucum" | "arara" | "neutral";
  outlier?: boolean;
};

export type CategoryChange = {
  label: string;
  detail: string;
  change: string;
  icon: IconName;
  tone: ReportTone;
};

export type MonthBarRow = { month: string; value: string; width: number };

export type MonthComparisonGroup = {
  label: string;
  change: string;
  tone: ReportTone;
  color: string;
  current: MonthBarRow;
  previous: MonthBarRow;
};

export type ReportView = {
  period: { title: string; range: string; scope: string };
  /** Sem nenhuma entrada nem saída no período. */
  empty: boolean;
  totals: { label: string; value: string; tone: ReportTone; note?: string }[];
  breakdown: { label: string; value: number; percent: string; color: string }[];
  balance: {
    title: string;
    subtitle: string;
    stats: ReportStat[];
    series: BalanceSeries;
    /** Legenda da previsão; `null` sem previsão. */
    projectionLegend: string | null;
    footer: TextPart[];
  };
  flow: {
    title: string;
    subtitle: { short: string; long: string };
    stats: ReportStat[];
    series: FlowSeries;
    /** "*semana em andamento"; `null` sem grupo pela metade. */
    partialNote: string | null;
    footer: TextPart[];
  };
  timeline: {
    entries: TimelineEntry[];
    /** Texto do link para a linha do tempo completa no tablet ("Ver 118 lançamentos"). */
    more: string;
    /** Saldo no fim de cada dia ("2026-11-17" → "R$ 12.480,32"); vazio nos períodos por mês. */
    dayEnds?: Record<string, string>;
  };
  comparison: {
    title: string;
    categories: CategoryChange[];
    /** "Até o dia 23, em cada mês". */
    until: string;
    groups: MonthComparisonGroup[];
    footer: TextPart[];
  };
};
