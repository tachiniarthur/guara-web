import { describe, expect, it } from "vitest";

import {
  buildCut,
  buildGoal,
  buildRetirement,
  cutStart,
  goalStart,
  retirementStart,
} from "./build";
import { toSavedFromApi, toSimulatorContext } from "./live";

const now = new Date("2026-11-17T12:00:00-03:00");

const goal = (
  name: string,
  {
    target,
    current,
    achieved = false,
    monthsLeft = 12,
    monthly = 50_000,
  }: {
    target: number;
    current: number;
    achieved?: boolean;
    monthsLeft?: number;
    monthly?: number;
  },
) => ({
  id: name,
  name,
  targetCents: target,
  progress: {
    currentCents: current,
    pct: (current / target) * 100,
    achieved,
    monthsLeft,
    requiredContribution: { monthlyTodayCents: monthly },
  },
});

const responses = {
  defaults: { portfolio: { investedCents: 19_276_670 } },
  suggestions: {
    hasAccounts: true,
    categories: [{ categoryId: "food", name: "Alimentação", monthlyAverageCents: 186_572 }],
    subscriptions: [{ subscriptionId: "s1", name: "Netflix", monthlyAmountCents: 4_475 }],
  },
  monthly: {
    months: [
      { month: "2026-08", incomeCents: 900_000, balanceCents: 200_000 },
      { month: "2026-09", incomeCents: 900_000, balanceCents: 300_000 },
      { month: "2026-10", incomeCents: 1_000_000, balanceCents: 100_000 },
      { month: "2026-11", incomeCents: 500_000, balanceCents: 400_000 },
    ],
  },
  profile: { profile: { profile: "aggressive", label: "Arrojado" } },
  belongings: {
    data: [
      { kind: "real_estate", valueCents: 50_000_000 },
      { kind: "vehicle", valueCents: 8_000_000 },
    ],
  },
  goals: {
    data: [
      goal("Celular novo", { target: 500_000, current: 520_000, achieved: true }),
      goal("Reserva de emergência", { target: 3_000_000, current: 1_000_000, monthly: 80_000 }),
      goal("Viagem para Patagônia", { target: 2_900_000, current: 1_682_000, monthsLeft: 23 }),
    ],
  },
};

describe("toSimulatorContext", () => {
  const ctx = toSimulatorContext(responses, now);

  it("usa o mês que vem, o último mês fechado e a média de sobra dos 3 últimos fechados", () => {
    expect(ctx.start).toEqual({ year: 2026, month: 11 });
    expect(ctx.startLabel).toBe("dezembro");
    expect(ctx.firstDepositLabel).toBe("Dezembro de 2026");
    expect(ctx.lastMonthName).toBe("outubro");
    expect(ctx.household.income).toBe(10_000);
    expect(ctx.household.surplus).toBe(2_000);
  });

  it("traz perfil, investido, imóveis, reserva e metas em andamento da pessoa", () => {
    expect(ctx.household.profile).toBe("Arrojado");
    expect(ctx.retirementRate).toBe(5);
    expect(ctx.household.invested).toBe(192_766.7);
    expect(ctx.household.properties).toBe(500_000);
    expect(ctx.reserve).toEqual({ saved: 10_000, target: 30_000, monthly: 800, place: "" });
    expect(ctx.goalDefaults).toMatchObject({
      name: "Viagem para Patagônia",
      cost: 29_000,
      months: 23,
    });
    expect(ctx.cutDestinations).toEqual([
      "Aposentadoria",
      "Reserva de emergência",
      "Viagem para Patagônia",
    ]);
    expect(ctx.cutCategories.map((c) => c.label)).toEqual(["Alimentação", "Netflix"]);
    expect(ctx.otherCutsTotal).toBeCloseTo(44.75);
  });

  it("monta as três simulações sem os números do protótipo", () => {
    const texts = JSON.stringify([
      buildRetirement(retirementStart(ctx), undefined, ctx).premises,
      buildGoal(goalStart(ctx), undefined, ctx).result.save,
      buildCut(cutStart(ctx), undefined, ctx).result.save,
    ]);
    expect(texts).not.toMatch(/setembro|outubro de 2026|Japão/);
  });

  it("sem histórico, metas nem perfil: valores neutros", () => {
    const empty = toSimulatorContext(
      {
        ...responses,
        suggestions: { hasAccounts: false, categories: [], subscriptions: [] },
        monthly: { months: [] },
        profile: { profile: null },
        belongings: { data: [] },
        goals: { data: [] },
      },
      now,
    );
    expect(empty.household.surplus).toBe(0);
    expect(empty.reserve).toBeNull();
    expect(empty.retirementRate).toBe(4);
    expect(empty.goalDefaults.name).toBe("Meu objetivo");
    expect(empty.otherCutsTotal).toBeNull();
    expect(buildCut(cutStart(empty), undefined, empty).result.empty).toBeTruthy();
  });
});

describe("toSavedFromApi", () => {
  it("objetivo: aporte necessário e prazo", () => {
    const item = toSavedFromApi({
      id: "abc",
      kind: "goal",
      name: "Viagem",
      createdAt: "2026-11-16T22:05:57.339Z",
      input: { targetCents: 2_900_000, months: 23 },
      result: { required: { monthlyTodayCents: 37_320 } },
    });
    expect(item).toMatchObject({
      id: "api:abc",
      apiId: "abc",
      tipo: "Objetivo",
      valor: "R$ 373/mês",
      resumo: "R$ 29.000 em 23 meses",
      salva: "Salva em 16/11/2026",
    });
  });

  it("corte e aposentadoria", () => {
    expect(
      toSavedFromApi({
        id: "c",
        kind: "spending_cut",
        name: "Menos delivery",
        createdAt: "2026-11-16T22:05:57.102Z",
        input: { monthlyAmountCents: 36_000, months: 6, description: "streaming" },
        result: {},
      }),
    ).toMatchObject({
      tipo: "Corte de gasto",
      valor: "R$ 360/mês",
      resumo: "streaming · por 6 meses",
    });
    expect(
      toSavedFromApi({
        id: "r",
        kind: "retirement",
        name: "Aposentadoria aos 58",
        createdAt: "2026-11-16T22:05:56.607Z",
        input: {
          retirementAge: 58,
          monthlyContributionCents: 260_000,
          desiredMonthlyIncomeCents: 1_400_000,
        },
        result: {},
      }),
    ).toMatchObject({
      tipo: "Aposentadoria",
      valor: "R$ 2.600/mês",
      resumo: "aos 58 anos · renda de R$ 14.000",
    });
  });
});
