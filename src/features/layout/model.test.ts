import { describe, expect, it } from "vitest";

import {
  type BlockDef,
  defaultLayout,
  isDefaultLayout,
  mergeLayout,
  moveBlock,
  shiftBlock,
  sizeForColumns,
  snapColumns,
  stepColumns,
  tabletHalf,
  toStored,
  updateBlock,
} from "./model";

const defs: BlockDef[] = [
  { id: "resumo", label: "Resumo", defaultSize: "l", sizes: ["m", "l", "xl"], group: "a" },
  {
    id: "pendencias",
    label: "Pendências",
    defaultSize: "s",
    sizes: ["s", "m", "l"],
    group: "a",
    tablet: "full",
  },
  { id: "metas", label: "Metas", defaultSize: "xs", sizes: ["xs", "s", "m"], group: "b" },
  { id: "alertas", label: "Alertas", defaultSize: "xs", sizes: ["xs", "s", "m"], group: "b" },
];

describe("layout editável", () => {
  it("padrão: na ordem da tela, nada oculto, na largura do design", () => {
    expect(defaultLayout(defs).map((b) => [b.id, b.columns, b.hidden])).toEqual([
      ["resumo", 8, false],
      ["pendencias", 4, false],
      ["metas", 3, false],
      ["alertas", 3, false],
    ]);
  });

  it("layout salvo de outra versão: sai o bloco desconhecido, entra o novo no lugar padrão", () => {
    const merged = mergeLayout(defs, [
      { id: "metas", size: "m", hidden: true, compact: false },
      { id: "grafico-antigo", size: "xl", hidden: false, compact: false },
      { id: "resumo", size: "xs", hidden: false, compact: true, height: "short" },
    ]);
    // Novos entram logo depois do vizinho que vinha antes deles no padrão.
    expect(merged.map((b) => b.id)).toEqual(["metas", "alertas", "resumo", "pendencias"]);
    // Oculto continua oculto (volta idêntico ao reexibir); `size` antigo vira colunas.
    expect(merged.find((b) => b.id === "metas")).toEqual({
      id: "metas",
      hidden: true,
      columns: 6,
    });
    // "xs" não é aceito pelo resumo: volta ao padrão (8 colunas).
    expect(merged.find((b) => b.id === "resumo")).toEqual({
      id: "resumo",
      hidden: false,
      columns: 8,
    });
  });

  it("altura escolhida antes (ou no app) é ignorada; largura fora do que o bloco aceita encaixa", () => {
    const merged = mergeLayout(defs, [
      { id: "resumo", size: "l", hidden: false, compact: false, height: "tall", minHeight: 400 },
      { id: "metas", size: "xs", hidden: false, compact: false, columns: 12, minHeight: 640 },
    ]);
    expect(merged.find((b) => b.id === "resumo")).toEqual({
      id: "resumo",
      hidden: false,
      columns: 8,
    });
    // Metas aceita até a metade.
    expect(merged.find((b) => b.id === "metas")).toEqual({
      id: "metas",
      hidden: false,
      columns: 6,
    });
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

  it("largura entre as pré-definidas que o bloco aceita; no tablet, metade ⇄ tudo", () => {
    const resumo = defs[0]!;
    expect(stepColumns(resumo, 8, 1, "desk")).toBe(9);
    expect(stepColumns(resumo, 9, 1, "desk")).toBe(12);
    expect(stepColumns(resumo, 12, 1, "desk")).toBe(12);
    expect(stepColumns(resumo, 8, -1, "desk")).toBe(6);
    expect(stepColumns(resumo, 6, -1, "desk")).toBe(6);
    // Arrastar encaixa na mais perto; layouts com a largura livre de antes também.
    expect(snapColumns(resumo, 7.2)).toBe(8);
    expect(snapColumns(resumo, 10.4)).toBe(9);
    expect(snapColumns(resumo, 2)).toBe(6);
    expect(stepColumns(resumo, 8, -1, "tablet")).toBe(6);
    expect(stepColumns(resumo, 6, 1, "tablet")).toBe(12);
    // Metas só aceita até a metade: no tablet não vira largura toda.
    expect(stepColumns(defs[2]!, 3, 1, "tablet")).toBe(3);
    expect(sizeForColumns(resumo, 9)).toBe("l");
    expect(sizeForColumns(resumo, 2)).toBe("m");
  });

  it("tablet: na largura padrão vale a do design; depois de mudar, até metade fica metade", () => {
    expect(tabletHalf(defs[0]!, 8)).toBe(false);
    expect(tabletHalf(defs[0]!, 6)).toBe(true);
    // Pendências: design pede a largura toda no tablet, mesmo com 1/3 no desktop.
    expect(tabletHalf(defs[1]!, 4)).toBe(false);
    expect(tabletHalf(defs[1]!, 6)).toBe(true);
    expect(tabletHalf(defs[2]!, 3)).toBe(true);
  });

  it("formato salvo: colunas e os campos antigos preenchidos, sem altura escolhida", () => {
    const layout = updateBlock(defaultLayout(defs), "resumo", { columns: 9 });
    const [resumo] = toStored(defs, layout);
    expect(resumo).toEqual({
      id: "resumo",
      size: "l",
      hidden: false,
      compact: false,
      height: "auto",
      columns: 9,
    });
    expect(mergeLayout(defs, toStored(defs, layout))).toEqual(layout);
  });

  it("ocultar e reexibir não mexe no resto", () => {
    const hidden = updateBlock(defaultLayout(defs), "metas", { hidden: true });
    expect(updateBlock(hidden, "metas", { hidden: false })).toEqual(defaultLayout(defs));
  });
});
