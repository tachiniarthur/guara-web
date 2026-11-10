import { describe, expect, it } from "vitest";

import { barWidth } from "./bar-width";

describe("barWidth", () => {
  it("nunca passa de 100% nem fica negativa", () => {
    expect(barWidth(142)).toBe("100.0%");
    expect(barWidth(101.4)).toBe("100.0%");
    expect(barWidth(-5)).toBe("0.0%");
    expect(barWidth(Number.NaN)).toBe("0.0%");
    expect(barWidth(37.25)).toBe("37.3%");
  });
});
