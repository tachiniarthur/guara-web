import { toGastosView, type GastosResponses } from "./live";

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
