import { labelsOfMonth, shiftMonth } from "@/lib/live-format";

import { PROJECTION_MONTHS, type PlannedExpense, type Projection, type Suggestion } from "./api";

/** Protótipo (sem login): a tela mostra setembro de 2026. */
export const PROTOTYPE_MONTH = "2026-09";

export const prototypePlanned: PlannedExpense[] = [
  {
    id: "carro",
    name: "Parcela do carro",
    amountCents: 152_000,
    categoryId: null,
    startMonth: "2026-10",
    endMonth: "2031-06",
    source: "manual",
  },
  {
    id: "ingles",
    name: "Curso de inglês",
    amountCents: 38_900,
    categoryId: null,
    startMonth: "2026-10",
    endMonth: "2027-03",
    source: "manual",
  },
];

const prototypeSubscriptions = [
  { id: "smartfit", name: "Smart Fit", amountCents: 11_990 },
  { id: "netflix", name: "Netflix", amountCents: 4_490 },
  { id: "spotify", name: "Spotify", amountCents: 2_190 },
];

export const prototypeSuggestions: Suggestion[] = [
  {
    key: "condominio",
    name: "Condomínio Edifício Jardins",
    amountCents: 62_000,
    categoryId: null,
    months: ["2026-07", "2026-08", "2026-09"],
  },
];

/** A mesma regra da API, com os dados do protótipo. */
export function prototypeProjection(): Projection {
  const months = Array.from({ length: PROJECTION_MONTHS }, (_, index) => {
    const month = shiftMonth(PROTOTYPE_MONTH, index + 1);
    const planned = prototypePlanned
      .filter((p) => month >= p.startMonth && (p.endMonth === null || month <= p.endMonth))
      .map((p) => ({
        kind: "planned" as const,
        id: p.id,
        name: p.name,
        amountCents: p.amountCents,
      }));
    const subscriptions = prototypeSubscriptions.map((s) => ({
      kind: "subscription" as const,
      ...s,
    }));
    const sum = (items: { amountCents: number }[]) =>
      items.reduce((total, item) => total + item.amountCents, 0);
    return {
      month,
      totalCents: sum(planned) + sum(subscriptions),
      subscriptionsCents: sum(subscriptions),
      plannedCents: sum(planned),
      items: [...planned, ...subscriptions].sort((a, b) => b.amountCents - a.amountCents),
    };
  });
  return { currentMonth: PROTOTYPE_MONTH, months };
}

/** "setembro, outubro e novembro" (os meses de uma sugestão, os 3 mais recentes). */
export function monthsSentence(months: readonly string[]): string {
  const names = months.slice(-3).map((month) => labelsOfMonth(month).name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names.at(-1)}`;
}

/** "até junho de 2031" / "sem data de fim". */
export function untilLabel(endMonth: string | null): string {
  if (!endMonth) return "sem data de fim";
  const { long } = labelsOfMonth(endMonth);
  return `até ${long.toLowerCase().replace(" ", " de ")}`;
}
