import { redirectFor } from "./session-gate";

describe("porteiro da sessão", () => {
  it("app: sem login vai para a entrada; sem plano, para o início do onboarding (CPF)", () => {
    expect(redirectFor("app", "signedOut")).toBe("/boas-vindas");
    expect(redirectFor("app", "onboarding")).toBe("/onboarding/cpf");
    expect(redirectFor("app", "signedIn")).toBeNull();
    expect(redirectFor("app", "loading")).toBeNull();
  });

  it("entrada: quem já entrou vai para o app ou para o plano", () => {
    expect(redirectFor("entrada", "signedIn")).toBe("/");
    expect(redirectFor("entrada", "onboarding")).toBe("/onboarding/cpf");
    expect(redirectFor("entrada", "signedOut")).toBeNull();
  });

  it('entrada: depois do código do "Esqueci minha senha", fica para criar a senha nova', () => {
    expect(redirectFor("entrada", "signedIn", { passwordPending: true })).toBeNull();
    expect(redirectFor("entrada", "onboarding", { passwordPending: true })).toBeNull();
    expect(redirectFor("entrada", "signedIn", { passwordPending: false })).toBe("/");
  });

  it("entrada: depois do código do cadastro, espera o nome, o CPF e o celular chegarem à conta", () => {
    expect(redirectFor("entrada", "onboarding", { signUpPending: true })).toBeNull();
    expect(redirectFor("entrada", "onboarding", { signUpPending: false })).toBe("/onboarding/cpf");
  });

  it("onboarding: só para quem tem conta (com ou sem plano)", () => {
    expect(redirectFor("onboarding", "signedOut")).toBe("/boas-vindas");
    expect(redirectFor("onboarding", "onboarding")).toBeNull();
    expect(redirectFor("onboarding", "signedIn")).toBeNull();
  });
});
