import { redirectFor } from "./session-gate";

describe("porteiro da sessão", () => {
  it("app: sem login vai para a entrada; sem plano, para a etapa de plano", () => {
    expect(redirectFor("app", "signedOut")).toBe("/boas-vindas");
    expect(redirectFor("app", "onboarding")).toBe("/onboarding/plano");
    expect(redirectFor("app", "signedIn")).toBeNull();
    expect(redirectFor("app", "loading")).toBeNull();
  });

  it("entrada: quem já entrou vai para o app ou para o plano", () => {
    expect(redirectFor("entrada", "signedIn")).toBe("/");
    expect(redirectFor("entrada", "onboarding")).toBe("/onboarding/plano");
    expect(redirectFor("entrada", "signedOut")).toBeNull();
  });

  it("onboarding: só para quem tem conta (com ou sem plano)", () => {
    expect(redirectFor("onboarding", "signedOut")).toBe("/boas-vindas");
    expect(redirectFor("onboarding", "onboarding")).toBeNull();
    expect(redirectFor("onboarding", "signedIn")).toBeNull();
  });
});
