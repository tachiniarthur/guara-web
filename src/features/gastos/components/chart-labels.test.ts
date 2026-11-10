import { describe, expect, it } from "vitest";

import { endLabels } from "@/features/inicio/components/cash-flow-chart";

import { paceLabels } from "./spending-charts";

describe("rótulos dos gráficos não se sobrepõem", () => {
  it("ritmo: o mês que gastou mais fica em cima, sempre uma linha de distância", () => {
    // Mês atual abaixo do anterior (y maior = valor menor): o anterior vai para cima.
    const below = paceLabels({ current: 120, previous: 110, left: false, top: 14, bottom: 190 });
    expect(below.previous).toBeLessThan(below.current);
    expect(below.current - below.previous).toBeGreaterThanOrEqual(15);
    const above = paceLabels({ current: 100, previous: 104, left: false, top: 14, bottom: 190 });
    expect(above.current).toBeLessThan(above.previous);
    expect(above.previous - above.current).toBeGreaterThanOrEqual(15);
    // Perto do topo, os dois continuam dentro da área.
    const top = paceLabels({ current: 14, previous: 15, left: false, top: 14, bottom: 190 });
    expect(top.current).toBeGreaterThanOrEqual(26);
  });

  it("entradas e saídas: valores parecidos afastam os rótulos (com espaço para a previsão)", () => {
    expect(endLabels(50, 120, true)).toEqual({ entradas: 50, saidas: 120 });
    const close = endLabels(60, 64, true);
    expect(close.saidas - close.entradas).toBeGreaterThanOrEqual(17);
    // Saídas acima: a nota da previsão fica entre os dois.
    const swapped = endLabels(64, 60, true);
    expect(swapped.entradas - swapped.saidas).toBeGreaterThanOrEqual(33);
  });
});
