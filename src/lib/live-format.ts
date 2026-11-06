import { z } from "zod";

import { formatCurrency, formatDate } from "@/lib/format";

/** Formatos dos textos montados com os dados da API (modo real). */

/** "R$ 1.249" (sem centavos), como os cards resumidos do design. */
export const formatWhole = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : formatCurrency(Math.round(value / 100) * 100).replace(/,00$/, "");

export const percent = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
export const signed = (value: number, text: string) =>
  value > 0 ? `+${text}` : value < 0 ? `−${text.replace("-", "")}` : text;

export const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Mês de São Paulo de uma data: "novembro", "Nov 2026", "Novembro 2026". */
export function monthLabels(now: Date) {
  const [year, month] = formatDate(now, "yyyy-MM").split("-").map(Number) as [number, number];
  const name = MONTHS[month - 1]!;
  return {
    name,
    short: `${capitalize(name.slice(0, 3))} ${year}`,
    long: `${capitalize(name)} ${year}`,
  };
}

export function greeting(now: Date) {
  const hour = Number(formatDate(now, "H"));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function relativeDay(isoDay: string, now: Date) {
  const today = formatDate(now, "yyyy-MM-dd");
  const yesterday = formatDate(new Date(now.getTime() - 86_400_000), "yyyy-MM-dd");
  if (isoDay === today) return "Hoje";
  if (isoDay === yesterday) return "Ontem";
  return formatDate(`${isoDay}T12:00:00-03:00`, "d MMM").replace(".", "");
}

export function chargeDay(isoDay: string) {
  return formatDate(`${isoDay}T12:00:00-03:00`, "d 'de' MMM").replace(".", "");
}

export function since(iso: string | null, now: Date) {
  if (!iso) return null;
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `Atualizado há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Atualizado há ${hours} h`;
  return `Atualizado em ${formatDate(iso, "d/MM")}`;
}

/**
 * Percentual como a API manda: texto com 2 casas (`"93.33"`), em pontos percentuais. Aceita
 * também número e converte; `null` continua `null` (a tela mostra "—").
 */
export const apiPercent = z.union([z.string(), z.number()]).transform((value) => Number(value));
