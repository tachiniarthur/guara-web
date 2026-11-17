import { describe, expect, it } from "vitest";

import { calendarMonth, calendarNote, monthFrom, toAssinaturasView } from "./live";

const now = new Date("2026-11-17T12:00:00-03:00");
const plain = (value: unknown) => JSON.parse(JSON.stringify(value).replace(/ /g, " "));

const sub = (
  id: string,
  name: string,
  amountCents: number,
  nextChargeOn: string,
  extra: Partial<{ period: "monthly" | "yearly"; previous: number }> = {},
) => ({
  id,
  name,
  detectedName: name.toUpperCase(),
  categoryId: "streaming",
  accountId: "acc1",
  period: extra.period ?? ("monthly" as const),
  amountCents,
  monthlyAmountCents: extra.period === "yearly" ? Math.round(amountCents / 12) : amountCents,
  lastChargeOn: null,
  nextChargeOn,
  priceIncrease: extra.previous
    ? { previousAmountCents: extra.previous, changedOn: "2026-10-01", pct: 10 }
    : null,
  status: "active",
  source: "detected" as const,
});

const responses = {
  subscriptions: {
    data: [
      sub("s2", "Spotify", 2_190, "2026-11-28"),
      sub("s1", "Netflix", 4_475, "2026-11-20", { previous: 3_990 }),
      sub("s3", "Antivírus", 12_000, "2027-03-10", { period: "yearly" }),
    ],
    monthlyTotalCents: 7_665,
  },
  accounts: { data: [{ id: "acc1", type: "credit_card", institutionName: "Banco Aurora" }] },
  categories: { data: [{ id: "streaming", name: "Streaming", subcategories: [] }] },
} as unknown as Parameters<typeof toAssinaturasView>[0];

describe("toAssinaturasView", () => {
  const view = toAssinaturasView(responses, now);

  it("ordena pela próxima cobrança e traz conta, categoria e período", () => {
    expect(view.items.map((i) => i.nome)).toEqual(["Netflix", "Spotify", "Antivírus"]);
    expect(plain(view.items[0])).toMatchObject({
      conta: "Banco Aurora crédito",
      categoria: "Streaming",
      valor: "R$ 44,75",
      periodo: "por mês",
      dia: 20,
    });
    expect(view.items[2]?.periodo).toBe("por ano");
    expect(view.stats).toEqual({ ativas: 3, mensal: 7_665, anual: 91_980, media: 2_555 });
  });

  it("a dica fala do maior aumento de preço", () => {
    expect(plain(view.dica)).toMatchObject({
      texto: expect.stringContaining("Netflix subiu 10%"),
      acao: { href: "/assinaturas/s1" },
    });
  });

  it("calendário: mensais todo mês, anual só no mês dela", () => {
    expect(view.calendario.cobrancas.map((c) => c.item.nome)).toEqual(["Netflix", "Spotify"]);
    const march = calendarMonth(view.subs, view.items, 2027, 3);
    expect(march.cobrancas.map((c) => [c.dia, c.item.nome])).toEqual([
      [10, "Antivírus"],
      [20, "Netflix"],
      [28, "Spotify"],
    ]);
    // Fevereiro tem 28 dias: a do dia 28 continua no dia 28.
    expect(calendarMonth(view.subs, view.items, 2027, 2).dias).toBe(28);
    expect(plain(calendarNote(march))).toBe(
      "R$ 120,00 até o dia 15 (1 cobrança) e R$ 66,65 depois (2 cobranças).",
    );
  });

  it("meses à frente atravessam o ano", () => {
    expect(monthFrom(now, 2)).toEqual({ year: 2027, month: 1 });
  });
});
