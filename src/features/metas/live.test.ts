import { toMetasView } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));
const goal = (over: Record<string, unknown>, progress: Record<string, unknown>) => ({
  id: "g",
  name: "Meta",
  targetCents: 1_000_000,
  targetDate: "2027-06-30",
  progressSource: "manual",
  positionIds: [],
  ...over,
  progress: {
    currentCents: 500_000,
    pct: 50,
    achieved: false,
    monthsLeft: 8,
    requiredContribution: { monthlyTodayCents: 62_500 },
    ...progress,
  },
});

describe("Metas com os dados da API", () => {
  const view = plain(
    toMetasView(
      {
        goals: {
          data: [
            goal(
              {
                id: "a",
                name: "Reserva de emergência",
                progressSource: "positions",
                positionIds: ["p1"],
              },
              {},
            ),
            goal(
              { id: "b", name: "Bicicleta", targetDate: "2026-12-01" },
              { currentCents: 1_050_000, pct: 105, achieved: true, requiredContribution: null },
            ),
          ],
        } as never,
        positions: { data: [{ id: "p1", name: "Tesouro Selic 2029", symbol: null }] },
        monthly: { months: [{ month: "2026-11", balanceCents: 742_500 }] },
      },
      new Date("2026-11-06T15:00:00-03:00"),
    ),
  );

  it("cada meta com onde está, status, progresso e aporte mensal", () => {
    expect(view.goals[0]).toMatchObject({
      nome: "Reserva de emergência",
      onde: "Tesouro Selic 2029",
      icone: "shield-check",
      status: { texto: "Em andamento" },
      guardado: "R$ 5.000",
      percentual: 50,
      mensal: "R$ 625/mês",
      previsao: "até jun/2027",
    });
    expect(view.goals[1]).toMatchObject({
      status: { texto: "Concluída" },
      percentual: 100,
      mensal: "meta atingida",
    });
  });

  it("resumo: guardado, planejado só das metas em andamento e sobra do mês", () => {
    expect(view.summary).toMatchObject({
      guardado: "R$ 15.500",
      mensal: "R$ 625/mês",
      mensalNota: "para 1 meta em andamento",
      sobrou: "R$ 7.425",
      sobrouQuando: "em novembro",
      proximo: "—",
    });
  });
});
