import { describe, expect, it } from "vitest";

import { colors } from "./colors.ts";
import { toCss, toCssVariables } from "./css.ts";

describe("toCssVariables", () => {
  it("gera variáveis no padrão de nomes do shadcn/ui", () => {
    const vars = toCssVariables();
    expect(vars["--background"]).toBe(colors.background);
    expect(vars["--card-foreground"]).toBe(colors.cardForeground);
    expect(vars["--chart-1"]).toBe(colors.chart1);
    expect(vars["--radius"]).toBe("0.625rem");
    expect(vars["--guara-spacing-unit"]).toBe("0.25rem");
  });

  it("gera um bloco :root com todas as cores", () => {
    const css = toCss();
    expect(css).toMatch(/^\/\*.*\*\/\n:root \{/);
    for (const value of Object.values(colors)) expect(css).toContain(value);
  });
});
