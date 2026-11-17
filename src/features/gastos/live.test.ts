import { gastosMonthOptions, gastosPaths, toGastosView, type GastosResponses } from "./live";

const now = new Date("2026-11-05T15:00:00-03:00");
const daily = (month: string, days: number[], daysInMonth = 30) => ({
  hasAccounts: true,
  month,
  daysInMonth,
  throughDay: days.length,
  days: days.map((spent, i) => ({ day: i + 1, incomeCents: 0, spentCents: spent })),
});
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));

const responses: GastosResponses = {
  current: daily("2026-11", [10_000, 0, 20_000, 0, 30_000]),
  previous: daily(
    "2026-10",
    Array.from({ length: 31 }, () => 10_000),
    31,
  ),
  older: [daily("2026-09", Array(30).fill(0)), daily("2026-08", Array(31).fill(0), 31)],
  monthly: {
    hasAccounts: true,
    months: [
      { month: "2026-09", spentCents: 200_000 },
      { month: "2026-10", spentCents: 310_000 },
      { month: "2026-11", spentCents: 60_000 },
    ],
  },
  summary: {
    hasAccounts: true,
    spentCents: 60_000,
    categories: [
      { categoryId: "food", name: "Alimentação", spentCents: 40_000, count: 3, sharePct: 66.7 },
      { categoryId: null, name: "Sem categoria", spentCents: 20_000, count: 1, sharePct: 33.3 },
    ],
  },
  budgets: {
    items: [
      {
        budget: { id: "b1", categoryId: "food", limitCents: 50_000 },
        categoryName: "Alimentação",
        spentCents: 40_000,
        usedPct: 80,
        projectedCents: null,
        status: "attention",
        noticesSent: [80],
      },
    ],
  },
  transactions: {
    data: [
      {
        id: "t1",
        accountId: "a1",
        occurredOn: "2026-11-05",
        occurredAt: "2026-11-05T11:40:00Z",
        amountCents: 950,
        direction: "debit",
        description: "CAFE",
        merchantName: "Café",
        categoryId: "bakery",
      },
    ],
  },
  anomalies: { data: [] },
  accounts: { data: [{ id: "a1", type: "credit_card", institutionName: "Banco Dev" }] },
  categories: {
    data: [
      {
        id: "food",
        name: "Alimentação",
        subcategories: [{ id: "bakery", name: "Padaria e café" }],
      },
    ],
  },
};

describe("Gastos com os dados da API", () => {
  const view = plain(toGastosView(responses, now));

  it("ritmo acumulado e comparação com o mês anterior no mesmo dia", () => {
    expect(view.spendingPace.atual).toEqual([100, 100, 300, 300, 600]);
    expect(view.spendingPace.nomeAnterior).toBe("Outubro");
    expect(view.rodapes.ritmo.map((part) => part.texto).join("")).toBe(
      "R$ 100 acima de outubro no mesmo dia.",
    );
  });

  it("previsão pelo ritmo do mês e média dos meses fechados", () => {
    expect(view.monthlySpending.previsao).toBe(3600);
    expect(view.monthlySpending.media).toBe(2550);
    expect(view.monthlySpending.rotuloMedia).toBe("Média de set a out");
    expect(view.monthForecast.contraMedia).toBe(41);
  });

  it("categorias (sem categoria vai para outros), tetos com o aviso de 80% e lançamentos", () => {
    expect(view.categorySpending.map((c) => c.id)).toEqual(["food"]);
    expect(view.otherSpending.valorFormatado).toBe("R$ 200,00");
    expect(view.tetos[0]).toMatchObject({ id: "b1", estado: "atenção", percentual: 80 });
    expect(view.tetos[0]!.marcos.map((m) => m.atingido)).toEqual([true, false]);
    expect(view.ledger[0]).toMatchObject({
      descricao: "Café",
      detalhe: "Hoje, 08:40 · Banco Dev crédito · Padaria e café",
    });
  });
});

describe("Gastos num mês anterior (seletor de mês)", () => {
  // Outubro escolhido em 5 de novembro: mês fechado, comparado com setembro.
  const closed: GastosResponses = {
    ...responses,
    current: daily(
      "2026-10",
      Array.from({ length: 31 }, () => 10_000),
      31,
    ),
    previous: daily("2026-09", Array(30).fill(5_000)),
    monthly: {
      hasAccounts: true,
      months: [
        { month: "2026-08", spentCents: 200_000 },
        { month: "2026-09", spentCents: 150_000 },
        { month: "2026-10", spentCents: 310_000 },
      ],
    },
  };
  const view = plain(toGastosView(closed, now));

  it("o mês mostrado é o escolhido, fechado, sem previsão", () => {
    expect(view.mes).toEqual({ name: "outubro", short: "Out 2026", long: "Outubro 2026" });
    expect(view.mesFechado).toBe(true);
    expect(view.spendingPace.fechado).toBe(true);
    expect(view.spendingPace.hoje).toBe(31);
    expect(view.monthlySpending.previsao).toBeNull();
    expect(view.monthlySpending.descricao).not.toContain("previsão");
  });

  it("rodapé e fechamento comparam o total do mês com a média", () => {
    expect(view.rodapes.meses.map((part) => part.texto).join("")).toBe(
      "Outubro fechou em R$ 3.100, 77% acima da média dos últimos meses.",
    );
    expect(view.monthForecast).toMatchObject({ fechado: true, ateHoje: 3100, contraMedia: 77 });
    expect(view.monthForecast.restante).toBeNull();
  });

  it("o mês atual continua em andamento", () => {
    expect(plain(toGastosView(responses, now)).mesFechado).toBe(false);
  });
});

describe("Endereços de Gastos por mês", () => {
  it("o mês atual usa os mesmos endereços do pré-carregamento", () => {
    expect(gastosPaths(now)).toEqual(gastosPaths(now, "2026-11"));
    expect(gastosPaths(now)).toMatchObject({
      current: "/v1/insights/spending/daily?month=2026-11",
      monthly: "/v1/insights/spending/monthly?months=12",
      budgets: "/v1/budgets/summary",
      transactions: "/v1/transactions?limit=8",
    });
  });

  it("num mês anterior, tudo daquele mês (e os 6 meses até ele)", () => {
    expect(gastosPaths(now, "2026-02")).toMatchObject({
      current: "/v1/insights/spending/daily?month=2026-02",
      previous: "/v1/insights/spending/daily?month=2026-01",
      older3: "/v1/insights/spending/daily?month=2025-11",
      monthly: "/v1/insights/spending/monthly?months=15",
      summary: "/v1/insights/spending?month=2026-02",
      budgets: "/v1/budgets/summary?month=2026-02",
      transactions: "/v1/transactions?from=2026-02-01&to=2026-02-28&limit=8",
    });
  });

  it("o seletor oferece o mês atual e os 11 anteriores", () => {
    const options = gastosMonthOptions(now);
    expect(options).toHaveLength(12);
    expect(options[0]).toMatchObject({ value: "2026-11", long: "Novembro 2026" });
    expect(options[11]).toMatchObject({ value: "2025-12", long: "Dezembro 2025" });
  });
});
