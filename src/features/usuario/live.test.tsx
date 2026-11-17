import { describe, expect, it } from "vitest";

import { EMPTY_VALUE } from "@/lib/format";

import { initialsOf, withFirstName } from "./live";

describe("nome de quem está logado", () => {
  it("saudação com o primeiro nome; sem nome no perfil, só a saudação", () => {
    expect(withFirstName("Oi", "Marina")).toBe("Oi, Marina");
    expect(withFirstName("Boa tarde", EMPTY_VALUE)).toBe("Boa tarde");
    expect(withFirstName("Olá", "")).toBe("Olá");
  });

  it("iniciais do nome completo", () => {
    expect(initialsOf("Marina Duarte")).toBe("MD");
    expect(initialsOf("Tiago")).toBe("TI");
  });
});
