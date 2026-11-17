import { labelsOfMonth } from "@/lib/live-format";

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
