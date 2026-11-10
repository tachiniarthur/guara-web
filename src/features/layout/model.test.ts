import { describe, expect, it } from "vitest";

import {
  type BlockDef,
  defaultLayout,
  isDefaultLayout,
  mergeLayout,
  moveBlock,
  shiftBlock,
  sizeForColumns,
  heightForDrag,
  snapColumns,
  snapHeight,
  stepColumns,
  stepHeight,
  tabletHalf,
  toStored,
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
    expect(defaultLayout(defs).map((b) => [b.id, b.columns, b.minHeight, b.hidden])).toEqual([
      ["resumo", 8, null, false],
      ["pendencias", 4, null, false],
      ["metas", 3, null, false],
      ["alertas", 3, null, false],
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
      hidden: true,
      columns: 6,
      minHeight: null,
    });
    // "xs" não é aceito pelo resumo: volta ao padrão (8 colunas); "baixo" vira automático.
    expect(merged.find((b) => b.id === "resumo")).toMatchObject({ columns: 8, minHeight: null });
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
    expect(tabletHalf(resumo, 7)).toBe(false);
    expect(sizeForColumns(resumo, 9)).toBe("l");
    expect(sizeForColumns(resumo, 2)).toBe("m");
  });

  it("formato salvo: campos novos e os antigos preenchidos para quem só lê esses", () => {
    const layout = updateBlock(defaultLayout(defs), "resumo", { columns: 9, minHeight: 400 });
    const [resumo, pendencias] = toStored(defs, layout);
    expect(resumo).toEqual({
      id: "resumo",
      size: "l",
      hidden: false,
      compact: false,
      height: "tall",
      columns: 9,
      minHeight: 400,
    });
    expect(pendencias).not.toHaveProperty("minHeight");
    expect(mergeLayout(defs, toStored(defs, layout))).toEqual(layout);
  });

  it("ocultar e reexibir não mexe no resto", () => {
    const hidden = updateBlock(defaultLayout(defs), "metas", { hidden: true });
    expect(updateBlock(hidden, "metas", { hidden: false })).toEqual(defaultLayout(defs));
  });

  it("altura entre a automática e as pré-definidas (P a XG)", () => {
    expect(snapHeight(333)).toBe(320);
    expect(snapHeight(10)).toBe(320);
    expect(snapHeight(99999)).toBe(640);
    expect(heightForDrag(250)).toBeNull();
    expect(heightForDrag(450)).toBe(480);
    // Da automática para cima: a primeira maior que a altura atual do bloco.
    expect(stepHeight(null, 300, 1)).toBe(320);
    expect(stepHeight(null, 450, 1)).toBe(480);
    expect(stepHeight(null, 450, -1)).toBeNull();
    expect(stepHeight(400, 0, -1)).toBe(320);
    expect(stepHeight(320, 0, -1)).toBeNull();
    expect(stepHeight(640, 0, 1)).toBe(640);
  });
});
