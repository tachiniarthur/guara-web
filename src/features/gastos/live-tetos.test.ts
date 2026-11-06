import { toTetosView } from "./live-tetos";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));
const month = (m: string, spent: number) => ({
  month: m,
  categories: [{ categoryId: "food", spentCents: spent }],
});

describe("Tetos com os dados da API", () => {
  const view = plain(
    toTetosView(
      {
        budgets: {
          items: [
            {
              budget: { id: "b1", categoryId: "food", limitCents: 100_000 },
              categoryName: "Alimentação",
              spentCents: 74_200,
              usedPct: 74.2,
              projectedCents: 96_000,
              status: "ok",
              noticesSent: [],
            },
            {
              budget: { id: "b0", categoryId: null, limitCents: 600_000 },
              categoryName: null,
              spentCents: 300_000,
              usedPct: 50,
              projectedCents: null,
              status: "ok",
              noticesSent: [],
            },
          ],
        },
        months: [
          month("2026-11", 74_200),
          month("2026-10", 120_000),
          month("2026-09", 80_000),
          month("2026-08", 0),
          month("2026-07", 0),
          month("2026-06", 0),
        ],
      },
      new Date("2026-11-05T15:00:00-03:00"),
    ),
  );

  it("só os tetos por categoria, com resumo, ritmo e histórico do mais antigo ao atual", () => {
    expect(view.items).toHaveLength(1);
    expect(view.items[0]).toMatchObject({
      id: "b1",
      categoryId: "food",
      status: "perto",
      resumo: "74% · Faltam R$ 258,00 · no ritmo atual, fecha perto de R$ 960",
    });
    expect(view.items[0]!.historico.map((h) => h.mes)).toEqual([
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov*",
    ]);
    expect(view.summary).toMatchObject({ ativos: 1, total: "R$ 1.000,00" });
    expect(view.recomeco).toBe("1º de dezembro");
  });

  it("meses anteriores contam o teto estourado", () => {
    expect(view.previousMonths).toEqual([
      { mes: "Outubro", nota: "Alimentação: R$ 1.200 de R$ 1.000", status: "estourou" },
      { mes: "Setembro", nota: "Nenhum teto estourado", status: "no-ritmo" },
    ]);
  });
});
