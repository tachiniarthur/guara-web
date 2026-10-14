/** Lançamentos de setembro (lista completa, por categoria e detalhe). */

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

const day = (id: string, titulo: string, total: string, itens: Transaction[]): TransactionDay => ({
  id,
  titulo,
  total,
  itens,
});

const t = (
  id: string,
  descricao: string,
  conta: string,
  categoria: string,
  valor: string,
  extra: Partial<Transaction> = {},
): Transaction => ({
  id,
  descricao,
  conta,
  categoria,
  valor,
  tipo: valor.startsWith("+") ? "entrada" : "saida",
  ...extra,
});

export const transactionDays: TransactionDay[] = [
  day("23", "Hoje · 23 de setembro", "−R$ 1.259,40", [
    t(
      "eletronicos-online",
      "Loja de eletrônicos online",
      "Nubank crédito",
      "Eletrônicos",
      "−R$ 1.249,90",
      {
        hora: "02:14",
        foraDoPadrao: true,
      },
    ),
    t("cafe-esquina", "Café da esquina", "Nubank crédito", "Alimentação", "−R$ 9,50", {
      hora: "08:40",
    }),
  ]),
  day("22", "Ontem · 22 de setembro", "−R$ 513,00", [
    t("casa-bela", "Presentes Casa Bela", "Nubank crédito", "Compras", "−R$ 220,00"),
    t("sabor-da-vila", "Restaurante Sabor da Vila", "Nubank crédito", "Alimentação", "−R$ 163,10"),
    t("bem-estar", "Farmácia Bem Estar", "Itaú débito", "Saúde", "−R$ 87,60"),
    t("app-22", "Transporte por app", "Nubank crédito", "Transporte", "−R$ 23,90"),
    t("padaria-central", "Padaria Central", "Itaú débito", "Alimentação", "−R$ 18,40"),
  ]),
  day("21", "Domingo · 21 de setembro", "−R$ 166,10", [
    t("pizza", "Delivery de pizza", "Nubank crédito", "Alimentação", "−R$ 72,90"),
    t("cine-max", "Cine Max", "Nubank crédito", "Lazer", "−R$ 56,00"),
    t("app-21", "Transporte por app", "Nubank crédito", "Transporte", "−R$ 37,20"),
  ]),
  day("20", "Sábado · 20 de setembro", "−R$ 198,40", [
    t("bar-do-ze", "Bar do Zé", "Nubank crédito", "Lazer", "−R$ 88,00"),
    t("mercado-bairro", "Mercado do bairro", "Itaú débito", "Alimentação", "−R$ 74,10"),
    t("app-20", "Transporte por app", "Nubank crédito", "Transporte", "−R$ 36,30"),
  ]),
  day("19", "Sexta · 19 de setembro", "−R$ 154,62", [
    t("japones", "Delivery japonês", "Nubank crédito", "Alimentação", "−R$ 95,72"),
    t("hamburgueria", "Hamburgueria", "Nubank crédito", "Alimentação", "−R$ 58,90"),
  ]),
  day("18", "Quinta · 18 de setembro", "+R$ 907,70", [
    t("freela", "Freela · site institucional", "Itaú", "Entrada", "+R$ 1.000,00", {
      meta: "Pix recebido · Itaú · Entrada",
    }),
    t("posto", "Posto de combustível", "Itaú débito", "Transporte", "−R$ 92,30"),
  ]),
];

/** "02:14 · Nubank crédito · Eletrônicos" (lista completa) ou sem categoria (por categoria). */
export function transactionMeta(item: Transaction, withCategory = true) {
  if (item.meta) return item.meta;
  return [item.hora, item.conta, withCategory ? item.categoria : undefined]
    .filter(Boolean)
    .join(" · ");
}

export const allTransactions = transactionDays.flatMap((d) =>
  d.itens.map((item) => ({ ...item, dia: d })),
);

export function findTransaction(id: string) {
  return allTransactions.find((item) => item.id === id);
}

export const monthTotals = {
  entrou: "R$ 8.200,00",
  saiu: "R$ 5.912,47",
  sobrou: "R$ 2.287,53",
  lancamentos: 118,
};

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
  categorias: string[];
  semTeto?: string;
};

export const transactionDetails: Record<string, TransactionDetails> = {
  "eletronicos-online": {
    data: "Terça, 23/09/2026 · 02:14",
    contaCompleta: "Nubank · cartão de crédito",
    fatura: "Outubro · vence em 10/10",
    forma: "À vista",
    descricaoBanco: "LOJAELETRON*ONLINE SP",
    origem: "Open Finance · Nubank",
    resumo: "Terça, 23/09/2026 · 02:14 · Nubank crédito",
    categorias: ["Eletrônicos", "Compras", "Lazer", "Casa"],
    semTeto: "Esta compra não entra em nenhum teto. Você não tem teto para Eletrônicos.",
  },
};

/** Detalhes de qualquer lançamento (os que não têm cadastro próprio usam a lista). */
export function detailsFor(item: Transaction & { dia: TransactionDay }): TransactionDetails {
  const known = transactionDetails[item.id];
  if (known) return known;
  const banco = item.conta.split(" ")[0] ?? item.conta;
  const quando = item.dia.titulo.split(" · ")[1] ?? item.dia.titulo;
  return {
    data: [quando, item.hora].filter(Boolean).join(" · "),
    contaCompleta: item.conta,
    descricaoBanco: item.descricao.toUpperCase(),
    origem: `Open Finance · ${banco}`,
    resumo: [quando, item.hora, item.conta].filter(Boolean).join(" · "),
    categorias: Array.from(new Set([item.categoria, "Compras", "Lazer", "Casa"])),
  };
}

/** Lançamentos de uma categoria (ex.: Alimentação), com o resumo do mês. */
export type CategoryLedger = {
  id: string;
  nome: string;
  lancamentos: number;
  total: string;
  comparacao: { parte: string; variacao: string; antes: string };
  teto?: { valor: string; estado: string; percentual: number; marcos: number[]; nota: string };
  dica?: string;
  onde: { nome: string; lancamentos: number; valor: string; percentual: string }[];
  dias: TransactionDay[];
};

export const categoryLedgers: Record<string, CategoryLedger> = {
  alimentacao: {
    id: "alimentacao",
    nome: "Alimentação",
    lancamentos: 31,
    total: "R$ 742,18",
    comparacao: { parte: "13% das saídas", variacao: "+12%", antes: "que agosto (R$ 662)" },
    teto: {
      valor: "R$ 1.000",
      estado: "74% · atenção",
      percentual: 74.2,
      marcos: [50, 70],
      nota: "Avisos de R$ 500 e R$ 700 já enviados · no ritmo atual, fecha perto de R$ 960",
    },
    dica: "Restaurantes e delivery de sexta e domingo puxaram o aumento: R$ 227,52 este mês.",
    onde: [
      { nome: "Restaurantes e delivery", lancamentos: 14, valor: "R$ 398,52", percentual: "54%" },
      { nome: "Mercado", lancamentos: 6, valor: "R$ 271,48", percentual: "37%" },
      { nome: "Padaria e café", lancamentos: 11, valor: "R$ 72,18", percentual: "9%" },
    ],
    dias: [
      day("23", "Hoje · 23 de setembro", "−R$ 9,50", [
        t("cafe-esquina", "Café da esquina", "Nubank crédito", "Alimentação", "−R$ 9,50", {
          hora: "08:40",
        }),
      ]),
      day("22", "Ontem · 22 de setembro", "−R$ 181,50", [
        t(
          "sabor-da-vila",
          "Restaurante Sabor da Vila",
          "Nubank crédito",
          "Alimentação",
          "−R$ 163,10",
        ),
        t("padaria-central", "Padaria Central", "Itaú débito", "Alimentação", "−R$ 18,40"),
      ]),
      day("21", "Domingo · 21 de setembro", "−R$ 72,90", [
        t("pizza", "Delivery de pizza", "Nubank crédito", "Alimentação", "−R$ 72,90"),
      ]),
      day("20", "Sábado · 20 de setembro", "−R$ 74,10", [
        t("mercado-bairro", "Mercado do bairro", "Itaú débito", "Alimentação", "−R$ 74,10"),
      ]),
      day("19", "Sexta · 19 de setembro", "−R$ 154,62", [
        t("japones", "Delivery japonês", "Nubank crédito", "Alimentação", "−R$ 95,72"),
        t("hamburgueria", "Hamburgueria", "Nubank crédito", "Alimentação", "−R$ 58,90"),
      ]),
      day("10", "Quarta · 10 de setembro", "−R$ 311,20", [
        t("mercado-mes", "Mercado do mês", "Itaú débito", "Alimentação", "−R$ 311,20"),
      ]),
    ],
  },
};

/**
 * Lançamentos de qualquer categoria de Gastos: Alimentação tem o detalhamento completo; as
 * outras usam os números do mês e os lançamentos da lista.
 */
export function ledgerForCategory(
  id: string,
  summary: { nome: string; lancamentos: number; percentual: number; valorFormatado: string },
): CategoryLedger {
  const known = categoryLedgers[id];
  if (known) return known;
  const dias = transactionDays
    .map((d) => {
      const itens = d.itens.filter((item) => item.categoria === summary.nome);
      const total = itens.reduce((sum, item) => sum + parseAmount(item.valor), 0);
      return { ...d, itens, total: formatDayTotal(total) };
    })
    .filter((d) => d.itens.length > 0);
  return {
    id,
    nome: summary.nome,
    lancamentos: summary.lancamentos,
    total: summary.valorFormatado,
    comparacao: { parte: `${summary.percentual}% das saídas`, variacao: "", antes: "" },
    onde: [],
    dias,
  };
}

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
