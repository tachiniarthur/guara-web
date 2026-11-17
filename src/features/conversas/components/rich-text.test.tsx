import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RichText, parseBlocks } from "./rich-text";

describe("texto do Guará", () => {
  it("separa parágrafos, listas e títulos", () => {
    expect(parseBlocks("# Resumo\nOi.\nTudo certo.\n\n- um\n- dois\n1. primeiro")).toEqual([
      { kind: "h", text: "Resumo" },
      { kind: "p", lines: ["Oi.", "Tudo certo."] },
      { kind: "ul", items: ["um", "dois"] },
      { kind: "ol", items: ["primeiro"] },
    ]);
  });

  it("mostra negrito e nunca interpreta HTML da resposta", () => {
    const { container } = render(
      <RichText text={"Você gastou **R$ 742,18**. <img src=x onerror=alert(1)>"} />,
    );
    expect(screen.getByText("R$ 742,18").tagName).toBe("STRONG");
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});
