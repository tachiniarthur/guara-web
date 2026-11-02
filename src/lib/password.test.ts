import { PASSWORD_MAX_LENGTH, passwordProblem } from "./password";

describe("passwordProblem", () => {
  it.each(["abc12345", "Senha2026", "ção12345", "a1a1a1a1"])("aceita %s", (password) => {
    expect(passwordProblem(password)).toBeNull();
  });

  it("pede pelo menos 8 caracteres", () => {
    expect(passwordProblem("abc123")).toBe("Use pelo menos 8 caracteres.");
    expect(passwordProblem("")).toBe("Use pelo menos 8 caracteres.");
  });

  it("pede letras e números", () => {
    expect(passwordProblem("12345678")).toBe("Misture letras e números.");
    expect(passwordProblem("abcdefgh")).toBe("Misture letras e números.");
  });

  it("limita o tamanho", () => {
    expect(passwordProblem(`a1${"x".repeat(PASSWORD_MAX_LENGTH)}`)).toBe(
      "Use no máximo 72 caracteres.",
    );
  });
});
