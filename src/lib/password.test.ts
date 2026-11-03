import { PASSWORD_MAX_LENGTH, passwordChecks, passwordProblem } from "./password";

describe("passwordProblem", () => {
  it.each(["Senha@2026", "Ção#1234", "A1!aaaaa", "Guará 2026!"])("aceita %s", (password) => {
    expect(passwordProblem(password)).toBeNull();
  });

  it("pede pelo menos 8 caracteres", () => {
    expect(passwordProblem("Ab1!")).toBe("Use pelo menos 8 caracteres.");
    expect(passwordProblem("")).toBe("Use pelo menos 8 caracteres.");
  });

  it("pede letra maiúscula, número e caractere especial", () => {
    expect(passwordProblem("senha@2026")).toBe("Inclua pelo menos uma letra maiúscula.");
    expect(passwordProblem("Senha@abc")).toBe("Inclua pelo menos um número.");
    expect(passwordProblem("Senha2026")).toBe(
      "Inclua pelo menos um caractere especial (como ! @ # $).",
    );
    // Só um espaço não conta como caractere especial.
    expect(passwordProblem("Senha 2026")).toBe(
      "Inclua pelo menos um caractere especial (como ! @ # $).",
    );
  });

  it("limita o tamanho", () => {
    expect(passwordProblem(`A1!${"x".repeat(PASSWORD_MAX_LENGTH)}`)).toBe(
      "Use no máximo 72 caracteres.",
    );
  });
});

describe("passwordChecks", () => {
  const met = (password: string) =>
    passwordChecks(password)
      .filter((check) => check.ok)
      .map((check) => check.id);

  it("marca cada regra cumprida enquanto a pessoa digita", () => {
    expect(met("")).toEqual([]);
    expect(met("senha")).toEqual([]);
    expect(met("Senha")).toEqual(["upper"]);
    expect(met("Senha2026")).toEqual(["length", "upper", "digit"]);
    expect(met("Senha@2026")).toEqual(["length", "upper", "digit", "special"]);
  });
});
