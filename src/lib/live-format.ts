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

const isMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

/** O mês `yyyy-MM` deslocado em `delta` meses (`-1` = o anterior). */
export function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number) as [number, number];
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Quantos meses de `from` até `to` (`yyyy-MM`; negativo se `to` vem antes). */
export function monthsBetween(from: string, to: string) {
  const [fy, fm] = from.split("-").map(Number) as [number, number];
  const [ty, tm] = to.split("-").map(Number) as [number, number];
  return (ty - fy) * 12 + (tm - fm);
}

/** Último dia do mês `yyyy-MM` ("2026-02-28"). */
export function lastDayOf(month: string) {
  const [year, m] = month.split("-").map(Number) as [number, number];
  const day = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return `${month}-${String(day).padStart(2, "0")}`;
}

/** Rótulos de um mês `yyyy-MM`, como `monthLabels`. */
export function labelsOfMonth(month: string) {
  return monthLabels(new Date(`${month}-15T12:00:00-03:00`));
}

/**
 * Mês `yyyy-MM` válido entre `oldest` meses atrás e o mês atual (São Paulo); fora disso, `null`.
 * Para o mês vindo do endereço (`?mes=`) ou guardado.
 */
export function pastMonthOrNull(value: string | null | undefined, now: Date, oldest = 11) {
  if (!value || !isMonth(value)) return null;
  const back = monthsBetween(value, formatDate(now, "yyyy-MM"));
  return back >= 0 && back <= oldest ? value : null;
}

/**
 * Mês `yyyy-MM` depois do atual (São Paulo), até `ahead` meses à frente; fora disso, `null`. Para
 * o mês da projeção escolhido em Gastos.
 */
export function futureMonthOrNull(value: string | null | undefined, now: Date, ahead = 12) {
  if (!value || !isMonth(value)) return null;
  const forward = monthsBetween(formatDate(now, "yyyy-MM"), value);
  return forward >= 1 && forward <= ahead ? value : null;
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

/**
 * Monta a tela com os dados da API sem derrubar o site: se a conversão falhar (dado num formato
 * inesperado), a tela mostra "Não deu para carregar" e o erro vai para o console.
 */
export function buildView<T>(
  screen: string,
  build: () => T,
): { data: T | undefined; error: Error | null } {
  try {
    return { data: build(), error: null };
  } catch (error) {
    console.error(`[${screen}] dados da API num formato inesperado`, error);
    return { data: undefined, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
