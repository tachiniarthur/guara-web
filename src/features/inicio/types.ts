/** Formatos que os cards do Início desenham (montados em `live.ts` a partir da API). */

export interface CashFlowData {
  /**
   * "mes" (padrão): um ponto por dia do mês. "ano": um ponto por mês, de janeiro a dezembro; aí
   * `diasNoMes` é 12 e `hoje` é o mês atual (1 a 12).
   */
  periodo?: "mes" | "ano";
  diasNoMes: number;
  /** Último dia com dado (hoje no mês atual). */
  hoje: number;
  /** Entradas e saídas acumuladas do dia 1 até `hoje`, em reais. */
  entradas: number[];
  saidas: number[];
  /** Saídas previstas no fim do mês, em reais; `null` sem previsão (sem teto total). */
  previsaoSaidas: number | null;
  sobrou: string;
  eixo: { valor: number; rotulo: string }[];
  maximo: number;
  descricao: string;
}

/** "Precisa de você": o que o Guará separou para a pessoa decidir. */
export type PendingItem = {
  id: string;
  titulo: string;
  detalhe: string;
  origem: string;
  acao: string;
  href: string;
  urgente?: boolean;
};
