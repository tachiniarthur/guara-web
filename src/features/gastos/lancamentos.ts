/** Formatos e contas dos lançamentos (lista completa, por categoria e detalhe). */

export type Transaction = {
  id: string;
  descricao: string;
  hora?: string;
  /** Conta ou cartão ("Nubank crédito", "Itaú débito"). */
  conta: string;
  categoria: string;
  /** Meta própria (ex.: Pix recebido), no lugar de conta · categoria. */
  meta?: string;
  valor: string;
  tipo: "saida" | "entrada";
  foraDoPadrao?: boolean;
};

export type TransactionDay = {
  id: string;
  titulo: string;
  total: string;
  itens: Transaction[];
};

/** "02:14 · Nubank crédito · Eletrônicos" (lista completa) ou sem categoria (por categoria). */
export function transactionMeta(item: Transaction, withCategory = true) {
  if (item.meta) return item.meta;
  return [item.hora, item.conta, withCategory ? item.categoria : undefined]
    .filter(Boolean)
    .join(" · ");
}

/** Detalhes completos de um lançamento (o que o banco informa). */
export type TransactionDetails = {
  data: string;
  contaCompleta: string;
  fatura?: string;
  forma?: string;
  descricaoBanco: string;
  origem: string;
  /** Linha do topo no desktop ("Terça, 23/09/2026 · 02:14 · Nubank crédito"). */
  resumo: string;
  /** Categoria principal do lançamento (`null` sem categoria) e as que dá para escolher. */
  categoriaId: string | null;
  opcoes: { id: string; nome: string }[];
  /** Pergunta "foi você?" ainda sem resposta (compra fora do padrão); `null` sem nenhuma. */
  anomaliaId: string | null;
  semTeto?: string;
};

/** Lançamentos de uma categoria (ex.: Alimentação), com o resumo do mês. */
export type CategoryLedger = {
  id: string;
  nome: string;
  /** Mês mostrado ("setembro"). */
  mes?: string;
  lancamentos: number;
  total: string;
  comparacao: { parte: string; variacao: string; antes: string };
  teto?: { valor: string; estado: string; percentual: number; marcos: number[]; nota: string };
  dica?: string;
  onde: { nome: string; lancamentos: number; valor: string; percentual: string }[];
  dias: TransactionDay[];
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "−R$ 1.249,90" → -1249.9 */
export function parseAmount(value: string) {
  const sign = value.trim().startsWith("+") ? 1 : -1;
  const digits = value.replace(/[^\d,]/g, "").replace(",", ".");
  return sign * Number(digits);
}

/** Total de um dia com sinal ("−R$ 1.259,40"). */
export function formatDayTotal(total: number) {
  const formatted = brl.format(Math.abs(total)).replace(/ /g, " ");
  return `${total < 0 ? "−" : "+"}${formatted}`;
}
