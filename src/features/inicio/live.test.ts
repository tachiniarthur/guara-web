import { type HomeResponses, toHomeView } from "./live";

const now = new Date("2026-11-05T15:00:00-03:00");
const block = <T>(data: T) => ({ data, reason: null });

const responses: HomeResponses = {
  dashboard: {
    netWorth: block({ investedCents: 5_000_000, investmentsMonthChangeCents: 100_000 }),
    accounts: block({
      totalCents: 1_248_032,
      items: [
        { type: "checking", institutionName: "Banco Dev" },
        { type: "credit_card", institutionName: "Banco Dev" },
      ],
    }),
    monthSpending: block({ spentCents: 300_000, budget: { projectedCents: 650_000 } }),
    upcomingSubscriptions: block({
      activeCount: 4,
      monthlyTotalCents: 15_490,
      items: [{ id: "s1", name: "Netflix", amountCents: 4_490, nextChargeOn: "2026-11-08" }],
    }),
    connectBanks: block({ connected: 1, lastSyncedAt: "2026-11-05T17:55:00Z" }),
    goals: block({
      count: 2,
      items: [
        {
          id: "g1",
          name: "Reserva",
          targetCents: 3_000_000,
          currentCents: 1_500_000,
          pct: 50,
        },
      ],
    }),
    priceAlerts: block({
      activeCount: 3,
      nearTarget: [
        {
          id: "a1",
          symbol: "PETR4",
          direction: "buy",
          targetPriceCents: 3_400,
          currentPriceCents: 3_782,
          distancePct: 10.1,
        },
      ],
    }),
    notifications: block({ unreadCount: 2 }),
  },
  daily: {
    hasAccounts: true,
    daysInMonth: 30,
    throughDay: 5,
    days: [
      { day: 1, incomeCents: 0, spentCents: 10_000 },
      { day: 2, incomeCents: 0, spentCents: 0 },
      { day: 3, incomeCents: 720_000, spentCents: 50_000 },
      { day: 4, incomeCents: 0, spentCents: 240_000 },
      { day: 5, incomeCents: 0, spentCents: 0 },
    ],
  },
  monthly: {
    hasAccounts: true,
    months: [
      { month: "2026-10", spentCents: 400_000, incomeCents: 800_000, balanceCents: 400_000 },
      { month: "2026-11", spentCents: 300_000, incomeCents: 720_000, balanceCents: 420_000 },
    ],
  },
  spending: { categories: [{ categoryId: "food", name: "Alimentação", spentCents: 74_200 }] },
  budgets: {
    items: [
      {
        budget: { id: "b1", categoryId: "food", limitCents: 100_000 },
        categoryName: "Alimentação",
        spentCents: 74_200,
        remainingCents: 25_800,
        usedPct: 74.2,
        status: "ok",
      },
      {
        budget: { id: "b2", categoryId: "transport", limitCents: 45_000 },
        categoryName: "Transporte",
        spentCents: 38_640,
        remainingCents: 6_360,
        usedPct: 85.9,
        status: "attention",
      },
    ],
  },
  transactions: {
    data: [
      {
        id: "t1",
        occurredOn: "2026-11-04",
        amountCents: 1_890,
        direction: "debit",
        description: "PADARIA",
        merchantName: "Padaria",
        categoryId: "bakery",
      },
    ],
  },
  anomalies: { data: [] },
  subscriptions: {
    data: [
      {
        id: "s1",
        name: "Netflix",
        amountCents: 4_490,
        nextChargeOn: "2026-11-08",
        status: "active",
        priceIncrease: { previousAmountCents: 3_990 },
      },
    ],
  },
  allocation: {
    items: [
      { assetClass: "fixed_income", label: "Renda fixa", currentPct: 60 },
      { assetClass: "equities", label: "Renda variável", currentPct: 40 },
      { assetClass: "alternatives", label: "Alternativos", currentPct: 0 },
    ],
  },
  goals: {
    data: [
      { id: "g1", progress: { currentCents: 1_500_000 } },
      { id: "g2", progress: { currentCents: 500_000 } },
    ],
  },
  categories: {
    data: [
      {
        id: "food",
        name: "Alimentação",
        subcategories: [{ id: "bakery", name: "Padaria e café" }],
      },
    ],
  },
  me: { displayName: "Gabriel Rodrigues" },
};

/** O Intl separa "R$" do número com espaço não separável; nos textos esperados vai espaço comum. */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll("\u00a0", " "));

describe("Início com os dados da API", () => {
  const view = plain(toHomeView(responses, now));

  it("saudação, data e pendências (teto em atenção + assinatura que subiu)", () => {
    expect(view.titulo).toBe("Boa tarde, Gabriel.");
    expect(view.data).toBe("Quinta, 5 de novembro");
    expect(view.pendencias).toBe(2);
    expect(view.pending.map((item) => item.titulo)).toEqual([
      "Transporte chegou a 85,9% do teto",
      "Netflix subiu R$ 5,00",
    ]);
    expect(view.atualizado).toBe("Atualizado há 5 min · 1 banco");
    expect(view.mes).toEqual({ name: "novembro", short: "Nov 2026", long: "Novembro 2026" });
  });

  it("resumo e gráfico acumulam os dias e comparam com o mês anterior", () => {
    expect(view.summary.saldoRotulo).toBe("Saldo em 1 banco");
    expect(view.summary.linhas.map((linha) => linha.variacao)).toEqual([
      "−10% vs outubro",
      "−25% vs outubro",
      "+R$ 200 vs outubro",
    ]);
    expect(view.cashFlow?.entradas).toEqual([0, 0, 7200, 7200, 7200]);
    expect(view.cashFlow?.saidas).toEqual([100, 100, 600, 3000, 3000]);
    expect(view.cashFlow?.previsaoSaidas).toBe(6500);
    expect(view.cashFlow?.maximo).toBe(8000);
  });

  it("visão geral, tetos por categoria e lançamentos com o nome da subcategoria", () => {
    expect(view.overview.metas.valor).toBe("R$ 20.000,00");
    expect(view.overview.metas.legenda).toBe("guardados em 2 metas");
    expect(view.overview.investimentos.alocacao.map((slice) => slice.classe)).toEqual([
      "Renda fixa",
      "Renda variável",
    ]);
    expect(view.categoryBudgets).toEqual([
      { id: "food", nome: "Alimentação", gasto: "R$ 742", teto: "R$ 1.000", percentual: 74 },
    ]);
    expect(view.recent[0]).toMatchObject({
      descricao: "Padaria",
      detalhe: "Padaria e café · Ontem",
      tipo: "saida",
    });
  });
});
