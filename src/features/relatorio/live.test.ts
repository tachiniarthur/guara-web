import { describe, expect, it } from "vitest";

import { axisMoney, niceScale } from "./components/charts";
import { reportPaths, toReportView, toTimelineDays, type ReportResponses } from "./live";

const now = new Date("2026-11-17T12:00:00-03:00");
// O Intl separa "R$" do número com espaço não separável (U+00A0): os testes comparam com espaço.
const plain = (value: unknown) => JSON.parse(JSON.stringify(value).replace(/\u00a0/g, " "));

const days = (count: number, fill: (day: number) => [number, number]) =>
  Array.from({ length: count }, (_, i) => {
    const [incomeCents, spentCents] = fill(i + 1);
    return { day: i + 1, incomeCents, spentCents };
  });

const tx = (
  id: string,
  occurredOn: string,
  amountCents: number,
  direction: "credit" | "debit",
  extra: Partial<{ kind: string; merchantName: string | null; categoryId: string | null }> = {},
) => ({
  id,
  accountId: "acc1",
  occurredOn,
  occurredAt: `${occurredOn}T13:14:00Z`,
  amountCents,
  direction,
  kind: extra.kind ?? (direction === "credit" ? "income" : "purchase"),
  description: `Lançamento ${id}`,
  merchantName: extra.merchantName ?? null,
  categoryId: extra.categoryId ?? null,
});

const responses: ReportResponses = {
  dashboard: { accounts: { data: { totalCents: 1_000_000 } } },
  // Novembro até o dia 17: salário de R$ 8.000 no dia 5 e R$ 100 de gasto por dia.
  current: {
    hasAccounts: true,
    month: "2026-11",
    daysInMonth: 30,
    throughDay: 17,
    days: days(17, (day) => [day === 5 ? 800_000 : 0, 10_000]),
  },
  previous: {
    hasAccounts: true,
    month: "2026-10",
    daysInMonth: 31,
    throughDay: 31,
    days: days(31, (day) => [day === 5 ? 700_000 : 0, 8_000]),
  },
  monthly: {
    hasAccounts: true,
    months: [
      { month: "2026-09", incomeCents: 700_000, spentCents: 600_000 },
      { month: "2026-10", incomeCents: 700_000, spentCents: 248_000 },
      { month: "2026-11", incomeCents: 800_000, spentCents: 170_000 },
    ],
  },
  summaries: [
    {
      month: "2026-11",
      hasAccounts: true,
      spentCents: 170_000,
      incomeCents: 800_000,
      categories: [
        {
          categoryId: "food",
          name: "Alimentação",
          spentCents: 100_000,
          averageCents: 80_000,
          changePct: 25,
        },
        {
          categoryId: "transport",
          name: "Transporte",
          spentCents: 70_000,
          averageCents: 70_000,
          changePct: 0,
        },
      ],
    },
  ],
  transactions: {
    data: [
      tx("t1", "2026-11-05", 800_000, "credit", { merchantName: "Salário" }),
      tx("t2", "2026-11-10", 10_000, "debit", { categoryId: "food" }),
      tx("t3", "2026-11-12", 500_000, "debit", { kind: "transfer_own" }),
    ],
    nextCursor: null,
  },
  accounts: {
    data: [{ id: "acc1", type: "checking", institutionName: "Banco Aurora" }],
  } as unknown as ReportResponses["accounts"],
  categories: {
    data: [{ id: "food", name: "Alimentação", subcategories: [] }],
  } as unknown as ReportResponses["categories"],
  anomalies: { data: [] },
};

describe("toReportView", () => {
  it("este mês: totais, saldo voltando do de hoje e previsão até o fim do mês", () => {
    const view = toReportView(responses, "mes", now);
    expect(view.period.range).toBe("1 a 17 de novembro");
    expect(plain(view.totals.map((t) => t.value))).toEqual([
      "R$ 8.000,00",
      "R$ 1.700,00",
      "R$ 6.300,00",
    ]);
    expect(view.totals[2]?.note).toBe("79% do que entrou");
    // Começou = hoje − o que sobrou no mês.
    expect(plain(view.balance.stats[0])).toMatchObject({
      label: "Começou o mês",
      value: "R$ 3.700,00",
    });
    expect(view.balance.series.values).toHaveLength(17);
    expect(view.balance.series.values.at(-1)).toBe(10_000);
    // 13 dias à frente, a R$ 100 por dia.
    expect(view.balance.series.projection).toHaveLength(14);
    expect(view.balance.series.projection.at(-1)).toBe(8_700);
    expect(view.balance.series.events.find((e) => e.tone === "arara")?.label).toBe("Salário");
    expect(view.flow.series.groups.map((g) => g.short)).toEqual(["1–7", "8–14", "15–17*"]);
    // A transferência entre contas próprias não entra.
    expect(plain(view.timeline.entries.map((e) => e.amount))).toEqual([
      "−R$ 100,00",
      "+R$ 8.000,00",
    ]);
    expect(view.timeline.more).toBe("Ver 2 lançamentos");
    expect(view.comparison.title).toBe("Comparado com outubro");
    expect(view.comparison.categories[0]).toMatchObject({ label: "Alimentação", change: "+25%" });
  });

  it("3 meses: um ponto por mês, sem previsão", () => {
    const view = toReportView(responses, "3m", now);
    expect(view.period.range).toBe("setembro a novembro de 2026");
    expect(view.balance.series.values).toHaveLength(3);
    expect(view.balance.series.projection).toEqual([]);
    expect(view.flow.series.groups.map((g) => g.short)).toEqual(["set", "out", "nov*"]);
    expect(view.flow.title).toBe("Entradas e saídas por mês");
  });

  it("7 dias e sem números de exemplo", () => {
    const view = toReportView(responses, "7d", now);
    expect(view.period.range).toBe("11 a 17 de novembro");
    expect(view.flow.series.groups).toHaveLength(7);
    expect(JSON.stringify(view)).not.toMatch(/setembro|Itaú|Nubank/);
  });

  it("sem conta conectada: vazio", () => {
    const view = toReportView(
      { ...responses, current: { ...responses.current, hasAccounts: false, days: [] } },
      "mes",
      now,
    );
    expect(view.empty).toBe(true);
  });

  it("endereços do período", () => {
    expect(reportPaths(now, "3m").summaries).toEqual([
      "/v1/insights/spending?month=2026-11",
      "/v1/insights/spending?month=2026-10",
      "/v1/insights/spending?month=2026-09",
    ]);
    expect(reportPaths(now, "7d").transactions).toBe("/v1/transactions?from=2026-11-11&limit=100");
  });
});

describe("toTimelineDays", () => {
  it("agrupa por dia, do mais recente, e filtra por tipo", () => {
    const base = {
      accounts: responses.accounts,
      categories: responses.categories,
      anomalies: responses.anomalies,
      dayEnds: { "2026-11-10": "R$ 9.000,00" },
    };
    const all = toTimelineDays(responses.transactions.data, { ...base, kind: "Tudo" });
    expect(all.map((d) => d.dia)).toEqual(["10 nov · ter", "5 nov · qui"]);
    expect(plain(all[0])).toMatchObject({ saldo: "R$ 9.000,00" });
    expect(all[0]?.itens[0]?.meta).toContain("Alimentação");
    const credits = toTimelineDays(responses.transactions.data, { ...base, kind: "Entradas" });
    expect(plain(credits.flatMap((d) => d.itens.map((i) => i.valor)))).toEqual(["+R$ 8.000,00"]);
  });
});

describe("escala dos gráficos", () => {
  it("cobre os valores com passos redondos", () => {
    expect(niceScale([10_060, 15_120])).toEqual({
      min: 10_000,
      max: 16_000,
      ticks: [10_000, 12_000, 14_000, 16_000],
    });
    expect(niceScale([0, 7_200], 2, true)).toEqual({
      min: 0,
      max: 10_000,
      ticks: [0, 5_000, 10_000],
    });
    expect(niceScale([-500, 300]).min).toBeLessThanOrEqual(-500);
    expect(niceScale([]).max).toBeGreaterThan(0);
  });

  it("rótulos curtos", () => {
    expect(axisMoney(16_000)).toBe("16 mil");
    expect(axisMoney(1_200_000)).toBe("1,2 mi");
    expect(axisMoney(-2_000)).toBe("−2 mil");
    expect(axisMoney(800)).toBe("800");
  });
});
