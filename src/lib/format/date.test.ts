import { describe, expect, it } from "vitest";

import { formatDate, formatDateTime } from "./date";

describe("formatDate", () => {
  it("formata no fuso America/Sao_Paulo, independente do fuso do sistema", () => {
    // 02:30 UTC de 01/01 ainda é 31/12 em São Paulo (UTC-3).
    expect(formatDate("2026-01-01T02:30:00Z")).toBe("31/12/2025");
  });

  it("aceita Date, timestamp e padrão customizado com locale pt-BR", () => {
    const date = new Date("2026-03-15T15:00:00Z");
    expect(formatDate(date, "d 'de' MMMM 'de' yyyy")).toBe("15 de março de 2026");
    expect(formatDate(date.getTime(), "EEEE")).toBe("domingo");
  });

  it("formata data e hora", () => {
    expect(formatDateTime("2026-10-02T12:15:00Z")).toBe("02/10/2026 09:15");
  });

  it("retorna travessão para nulo, indefinido ou data inválida", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("não é data")).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
  });
});
