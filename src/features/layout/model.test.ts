import { describe, expect, it } from "vitest";

import {
  type BlockDef,
  defaultLayout,
  isDefaultLayout,
  mergeLayout,
  moveBlock,
  shiftBlock,
  sizeForColumns,
  stepSize,
  updateBlock,
} from "./model";

const defs: BlockDef[] = [
  { id: "resumo", label: "Resumo", defaultSize: "l", sizes: ["m", "l", "xl"], group: "a" },
  { id: "pendencias", label: "Pendências", defaultSize: "s", sizes: ["s", "m", "l"], group: "a" },
  { id: "metas", label: "Metas", defaultSize: "xs", sizes: ["xs", "s", "m"], group: "b" },
  { id: "alertas", label: "Alertas", defaultSize: "xs", sizes: ["xs", "s", "m"], group: "b" },
];

describe("layout editável", () => {
  it("padrão: na ordem da tela, nada oculto", () => {
    expect(defaultLayout(defs).map((b) => [b.id, b.size, b.hidden])).toEqual([
      ["resumo", "l", false],
      ["pendencias", "s", false],
      ["metas", "xs", false],
      ["alertas", "xs", false],
    ]);
  });

  it("layout salvo de outra versão: sai o bloco desconhecido, entra o novo no lugar padrão", () => {
    const merged = mergeLayout(defs, [
      { id: "metas", size: "m", hidden: true, compact: false },
      { id: "grafico-antigo", size: "xl", hidden: false, compact: false },
      { id: "resumo", size: "xs", hidden: false, compact: true },
    ]);
    // Novos entram logo depois do vizinho que vinha antes deles no padrão.
    expect(merged.map((b) => b.id)).toEqual(["metas", "alertas", "resumo", "pendencias"]);
    // Oculto continua oculto (volta idêntico ao reexibir); tamanho que o bloco não aceita volta ao padrão.
    expect(merged.find((b) => b.id === "metas")).toEqual({
      id: "metas",
      size: "m",
      hidden: true,
      compact: false,
    });
    expect(merged.find((b) => b.id === "resumo")).toMatchObject({ size: "l", compact: true });
  });

  it("sem layout salvo: o padrão", () => {
    expect(mergeLayout(defs, null)).toEqual(defaultLayout(defs));
    expect(isDefaultLayout(defs, mergeLayout(defs, []))).toBe(true);
  });

  it("arrastar troca de posição; teclado anda um passo dentro do grupo", () => {
    const layout = defaultLayout(defs);
    expect(moveBlock(layout, "alertas", "metas").map((b) => b.id)).toEqual([
      "resumo",
      "pendencias",
      "alertas",
      "metas",
    ]);
    // "metas" é o primeiro do grupo b: não pula para o grupo a.
    expect(shiftBlock(layout, defs, "metas", -1).map((b) => b.id)).toEqual(layout.map((b) => b.id));
    expect(shiftBlock(layout, defs, "metas", 1).map((b) => b.id)).toEqual([
      "resumo",
      "pendencias",
      "alertas",
      "metas",
    ]);
  });

  it("tamanho só entre os aceitos, e a alça encaixa no mais perto", () => {
    const resumo = defs[0]!;
    expect(stepSize(resumo, "l", 1)).toBe("xl");
    expect(stepSize(resumo, "xl", 1)).toBe("xl");
    expect(stepSize(resumo, "m", -1)).toBe("m");
    expect(sizeForColumns(resumo, 9)).toBe("l");
    expect(sizeForColumns(resumo, 2)).toBe("m");
  });

  it("ocultar e reexibir não mexe no resto", () => {
    const hidden = updateBlock(defaultLayout(defs), "metas", { hidden: true });
    expect(updateBlock(hidden, "metas", { hidden: false })).toEqual(defaultLayout(defs));
  });
});
