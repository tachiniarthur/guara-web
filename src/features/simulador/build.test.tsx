import {
  buildCut,
  buildGoal,
  buildRetirement,
  CUT_START,
  GOAL_START,
  RETIREMENT_START,
} from "./build";

const plain = (text: string) => text.replace(/ /g, " ");

describe("simulador", () => {
  it("com as premissas do design, mostra os números do design", () => {
    const retirement = buildRetirement(RETIREMENT_START);
    expect(plain(retirement.result.metric)).toBe("R$ 5.640");
    // Aposentadoria não compara perfis: vale a rentabilidade escolhida nas premissas.
    expect(retirement.result.scenarios).toEqual([]);
    expect(plain(buildGoal(GOAL_START).result.metric)).toBe("R$ 1.310");
    expect(plain(buildCut(CUT_START).result.metric)).toBe("R$ 312");
  });

  it("mexer numa premissa recalcula o resultado", () => {
    const later = buildRetirement({ ...RETIREMENT_START, years: 30 });
    expect(plain(later.result.metric)).toBe("R$ 4.150");
    expect(later.result.subtitle).toBe("Aposentadoria em 30 anos, em valores de hoje");

    const set = vi.fn();
    const slider = buildRetirement(RETIREMENT_START, set).premises.fields[0]!;
    if (slider.kind !== "slider") throw new Error("o primeiro campo é o prazo");
    slider.onChange?.(30);
    expect(set).toHaveBeenCalledWith({ years: 30 });

    expect(plain(buildGoal({ ...GOAL_START, months: 24 }).result.metric)).toBe("R$ 940");
    expect(plain(buildCut({ ...CUT_START, percent: 50 }).result.metric)).toBe("R$ 195");
  });

  it("corte sem histórico mostra a mensagem, sem inventar valores", () => {
    const cut = buildCut({ ...CUT_START, category: "Delivery" });
    expect(cut.result.metric).toBe("—");
    expect(cut.result.empty).toMatch(/Sem histórico desse gasto/);
  });
});
