/** Formatos que as telas de Gastos desenham (montados em `live.ts` a partir da API). */

export type CategoryBudget = {
  id: string;
  nome: string;
  gasto: string;
  teto: string;
  percentual: number;
};

export type Transaction = {
  id: string;
  descricao: string;
  detalhe: string;
  valor: string;
  tipo: "saida" | "entrada";
  foraDoPadrao?: boolean;
};

export interface SpendingPace {
  /** Último dia com dado: hoje no mês atual, o último dia num mês fechado. */
  hoje: number;
  /** Mês já terminado (escolhido no seletor): o último dia não é "hoje". */
  fechado?: boolean;
  /** Gasto acumulado por dia (reais) do mês atual até hoje e do anterior completo. */
  atual: number[];
  anterior: number[];
  nomeAtual: string;
  nomeAnterior: string;
  /** Topo da escala do gráfico (reais). */
  maximo: number;
  descricao: string;
}

export interface MonthlySpending {
  meses: { rotulo: string; nome: string; valor: number }[];
  /** Previsão do mês atual (o último), em reais; `null` sem dado para prever. */
  previsao: number | null;
  /** Média dos meses fechados mostrados; `null` sem nenhum. */
  media: number | null;
  rotuloMedia: string;
  rotuloPrevisao: string;
  maximo: number;
  descricao: string;
}

export interface WeekdaySpending {
  dias: { rotulo: string; nome: string; valor: number }[];
  maximo: number;
  descricao: string;
}

export type CategorySpending = {
  id: string;
  nome: string;
  lancamentos: number;
  percentual: number;
  valor: number;
  valorFormatado: string;
  cor: string;
};

export type TetoMilestone = { percentual: number; rotulo: string; atingido: boolean };

export type TetoProgress = {
  id: string;
  categoria: string;
  gasto: string;
  teto: string;
  percentual: number;
  estado: "tranquilo" | "atenção" | "apertado";
  marcos: TetoMilestone[];
};

export type LedgerEntry = {
  id: string;
  descricao: string;
  /** Detalhe completo (desktop e tablet) e curto (mobile). */
  detalhe: string;
  detalheCurto: string;
  valor: string;
  tipo: "saida" | "entrada";
  foraDoPadrao?: boolean;
};

export type MonthForecastData = ReturnType<typeof forecastFrom>;

/**
 * "Previsão do mês" (Gastos): calculada do ritmo do mês e dos últimos meses, nada escrito à mão.
 * Valores em reais inteiros, como o resto dos gráficos. `null` sem previsão ou sem média.
 */
export function forecastFrom(pace: SpendingPace, monthly: MonthlySpending, diasNoMes: number) {
  const { hoje, atual, anterior, nomeAnterior, fechado = false } = pace;
  const ateHoje = atual[hoje - 1] ?? 0;
  const anteriorMesmoDia = anterior[Math.min(hoje, anterior.length) - 1] ?? 0;
  const { previsao, media } = monthly;
  // Mês fechado: compara o total do mês com a média; em andamento, a previsão.
  const comparado = fechado ? ateHoje : previsao;
  return {
    fechado,
    hoje,
    diasNoMes,
    diasRestantes: diasNoMes - hoje,
    ateHoje,
    porDia: Math.round(ateHoje / Math.max(hoje, 1)),
    previsao,
    media,
    /** Previsão (ou o total, no mês fechado) contra a média dos meses anteriores, em %. */
    contraMedia:
      comparado !== null && media !== null && media > 0
        ? Math.round((comparado / media - 1) * 100)
        : null,
    nomeAnterior,
    anteriorMesmoDia: anterior.length > 0 ? anteriorMesmoDia : null,
    contraAnterior: anterior.length > 0 ? ateHoje - anteriorMesmoDia : null,
    /** Quanto ainda deve sair até o fim do mês. */
    restante: previsao === null ? null : Math.max(0, previsao - ateHoje),
  };
}
