/**
 * Dados de exemplo que só as telas de tetos (`/alertas/tetos`, ainda com o modo protótipo) usam.
 * Nenhuma tela de Gastos, Início ou Assinaturas lê daqui. Sai quando Alertas passar a usar só a API.
 */

import {
  formatDayTotal,
  parseAmount,
  type CategoryLedger,
  type Transaction,
  type TransactionDay,
} from "./lancamentos";
import type { CategorySpending, TetoProgress } from "./types";

/** Tetos do mês com os marcos de aviso já disparados (✓). */
export const tetos: TetoProgress[] = [
  {
    id: "alimentacao",
    categoria: "Alimentação",
    gasto: "R$ 742",
    teto: "R$ 1.000",
    percentual: 74.2,
    estado: "atenção",
    marcos: [
      { percentual: 50, rotulo: "500", atingido: true },
      { percentual: 70, rotulo: "700", atingido: true },
      { percentual: 100, rotulo: "teto 1.000", atingido: false },
    ],
  },
  {
    id: "transporte",
    categoria: "Transporte",
    gasto: "R$ 386",
    teto: "R$ 450",
    percentual: 85.9,
    estado: "apertado",
    marcos: [
      { percentual: 66.67, rotulo: "300", atingido: true },
      { percentual: 100, rotulo: "teto 450", atingido: false },
    ],
  },
  {
    id: "lazer",
    categoria: "Lazer",
    gasto: "R$ 120",
    teto: "R$ 400",
    percentual: 30,
    estado: "tranquilo",
    marcos: [
      { percentual: 50, rotulo: "200", atingido: false },
      { percentual: 75, rotulo: "300", atingido: false },
      { percentual: 100, rotulo: "teto 400", atingido: false },
    ],
  },
];

/** Saídas do mês por categoria (as demais entram em "outros"). */
export const categorySpending: CategorySpending[] = [
  {
    id: "moradia",
    nome: "Moradia",
    lancamentos: 1,
    percentual: 36,
    valor: 2100,
    valorFormatado: "R$ 2.100,00",
    cor: "#6DB3EC",
  },
  {
    id: "eletronicos",
    nome: "Eletrônicos",
    lancamentos: 1,
    percentual: 21,
    valor: 1249.9,
    valorFormatado: "R$ 1.249,90",
    cor: "#FF6A50",
  },
  {
    id: "alimentacao",
    nome: "Alimentação",
    lancamentos: 31,
    percentual: 13,
    valor: 742.18,
    valorFormatado: "R$ 742,18",
    cor: "#F2C230",
  },
  {
    id: "transporte",
    nome: "Transporte",
    lancamentos: 22,
    percentual: 7,
    valor: 386.4,
    valorFormatado: "R$ 386,40",
    cor: "#6CC08E",
  },
  {
    id: "assinaturas",
    nome: "Assinaturas",
    lancamentos: 4,
    percentual: 2,
    valor: 101.6,
    valorFormatado: "R$ 101,60",
    cor: "#93A198",
  },
];

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

export const allTransactions = transactionDays.flatMap((d) =>
  d.itens.map((item) => ({ ...item, dia: d })),
);

export function findTransaction(id: string) {
  return allTransactions.find((item) => item.id === id);
}

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
