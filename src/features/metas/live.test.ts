import { ApiError } from "@/lib/api";

import { goalLimitOf, isGoalId, planLimitText, toGoalDetail, toMetasView } from "./live";

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
      icone: "trending-up",
      href: "/metas/a",
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

  it("dica com a meta mais próxima e quantas já foram atingidas", () => {
    expect(view.summary.dica).toBe(
      "Uma meta já foi atingida. A mais próxima é Reserva de emergência, até jun/2027: pede cerca de R$ 625 por mês.",
    );
  });

  it("resumo: guardado, planejado só das metas em andamento e sobra do mês", () => {
    expect(view.summary).toMatchObject({
      guardado: "R$ 15.500",
      mensal: "R$ 625/mês",
      mensalNota: "para 1 meta em andamento",
      sobrou: "R$ 7.425",
      sobrouQuando: "em novembro",
    });
  });
});

describe("detalhe da meta", () => {
  const detail = plain(
    toGoalDetail(
      {
        ...(goal(
          { id: "a", name: "Reserva", progressSource: "positions", positionIds: ["p1"] },
          { remainingCents: 500_000, unvaluedPositions: 0 },
        ) as never as Parameters<typeof toGoalDetail>[0]),
        targetTodayCents: 950_000,
        assumptions: {
          annualReturnPct: "10.50",
          annualInflationPct: "4.00",
          annualReturnReason: "Prazo curto: CDI.",
        },
        createdAt: "2026-10-01T12:00:00Z",
      },
      { data: [{ id: "p1", name: "Tesouro Selic", symbol: null, valueCents: 500_000 }] },
    ),
  );

  it("faltam, prazo, posições e premissas", () => {
    expect(detail).toMatchObject({
      faltam: "R$ 5.000,00",
      prazo: "30/06/2027",
      meses: "faltam 8 meses",
      alvoHoje: "R$ 9.500,00",
      posicoes: [{ id: "p1", nome: "Tesouro Selic", valor: "R$ 5.000,00" }],
      premissas: [
        { label: "Rendimento estimado", value: "10,5% ao ano" },
        { label: "Inflação estimada", value: "4% ao ano" },
      ],
      criada: "Criada em 01/10/2026",
    });
  });

  it("só uuid vira chamada à API", () => {
    expect(isGoalId("reserva")).toBe(false);
  });
});

describe("limite de metas do plano", () => {
  it("lê o limite que a API manda no erro", () => {
    const limited = new ApiError("plan_limit_reached", "Limite", 403, { limit: 2 });
    expect(goalLimitOf(limited)).toBe(2);
    expect(planLimitText(limited)).toBe(
      "Seu plano permite até 2 metas. Exclua uma meta ou veja os planos em Meu perfil.",
    );
    const noGoals = new ApiError("plan_limit_reached", "Limite", 403);
    expect(goalLimitOf(noGoals)).toBeNull();
    expect(planLimitText(noGoals)).toContain("outro plano");
    expect(goalLimitOf(new ApiError("conflict"))).toBeNull();
  });
});
