import { lastDayOf, monthsBetween, pastMonthOrNull, shiftMonth } from "./live-format";

describe("meses (yyyy-MM)", () => {
  it("desloca, conta e acha o último dia, virando o ano", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-11", -11)).toBe("2025-12");
    expect(shiftMonth("2025-12", 1)).toBe("2026-01");
    expect(monthsBetween("2025-12", "2026-11")).toBe(11);
    expect(lastDayOf("2028-02")).toBe("2028-02-29");
    expect(lastDayOf("2026-02")).toBe("2026-02-28");
  });

  it("aceita só mês válido entre 11 meses atrás e o atual", () => {
    const now = new Date("2026-11-17T12:00:00-03:00");
    expect(pastMonthOrNull("2026-10", now)).toBe("2026-10");
    expect(pastMonthOrNull("2025-12", now)).toBe("2025-12");
    expect(pastMonthOrNull("2025-11", now)).toBeNull();
    expect(pastMonthOrNull("2026-12", now)).toBeNull();
    expect(pastMonthOrNull("2026-13", now)).toBeNull();
    expect(pastMonthOrNull("abc", now)).toBeNull();
    expect(pastMonthOrNull(null, now)).toBeNull();
  });
});
