import { tz } from "@date-fns/tz";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import { EMPTY_VALUE, isNil } from "./empty";

export const APP_TIME_ZONE = "America/Sao_Paulo";

const inSaoPaulo = tz(APP_TIME_ZONE);

type DateInput = Date | string | number;

/**
 * Formata uma data no fuso America/Sao_Paulo com locale pt-BR.
 * Retorna um travessão para valores nulos, indefinidos ou datas inválidas.
 *
 * @param pattern padrão do date-fns (padrão: "dd/MM/yyyy").
 */
export function formatDate(value: DateInput | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (isNil(value)) return EMPTY_VALUE;
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return EMPTY_VALUE;
  return format(date, pattern, { in: inSaoPaulo, locale: ptBR });
}

/** Data e hora no fuso America/Sao_Paulo (ex.: "02/10/2026 09:15"). */
export function formatDateTime(value: DateInput | null | undefined): string {
  return formatDate(value, "dd/MM/yyyy HH:mm");
}
