import { describe, expect, it } from "vitest";

import {
  type BlockDef,
  defaultLayout,
  heightForDrag,
  isDefaultLayout,
  mergeLayout,
  moveBlock,
  shiftBlock,
  snapHeight,
  stepHeight,
  tabletHalf,
  toStored,
  updateBlock,
} from "./model";

const defs: BlockDef[] = [
  { id: "resumo", label: "Resumo", defaultSize: "l", group: "a" },
  { id: "pendencias", label: "Pendências", defaultSize: "s", group: "a", tablet: "full" },
  { id: "metas", label: "Metas", defaultSize: "xs", group: "b" },
  { id: "alertas", label: "Alertas", defaultSize: "xs", group: "b" },
];

describe("layout editável", () => {
  it("padrão: na ordem da tela, nada oculto, altura automática", () => {
    expect(defaultLayout(defs).map((b) => [b.id, b.minHeight, b.hidden])).toEqual([
      ["resumo", null, false],
      ["pendencias", null, false],
      ["metas", null, false],
      ["alertas", null, false],
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
    // Oculto continua oculto; "baixo" antigo (que cortava) vira automático.
    expect(merged.find((b) => b.id === "metas")).toEqual({
      id: "metas",
      hidden: true,
      minHeight: null,
    });
    expect(merged.find((b) => b.id === "resumo")).toEqual({
      id: "resumo",
      hidden: false,
      minHeight: null,
    });
  });

  it("largura é sempre a do design: a salva antes (size e columns) é ignorada", () => {
    const merged = mergeLayout(defs, [
      { id: "resumo", size: "xl", hidden: false, compact: false, columns: 12, minHeight: 400 },
    ]);
    expect(merged.find((b) => b.id === "resumo")).toEqual({
      id: "resumo",
      hidden: false,
      minHeight: 400,
    });
    // Salva a largura do design, sem a largura livre.
    const [resumo] = toStored(defs, merged);
    expect(resumo).toEqual({
      id: "resumo",
      size: "l",
      hidden: false,
      compact: false,
      height: "tall",
      minHeight: 400,
    });
    expect(tabletHalf(defs[0]!)).toBe(false);
    expect(tabletHalf(defs[1]!)).toBe(false);
    expect(tabletHalf(defs[2]!)).toBe(true);
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
