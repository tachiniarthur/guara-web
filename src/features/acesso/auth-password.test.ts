import { ApiError } from "@/lib/api";

import { PasswordAuthError, toPasswordAuthError } from "./auth";

describe("toPasswordAuthError", () => {
  it.each([
    ["invalid_credentials", "credenciais"],
    ["rate_limited", "muitos"],
    ["network", "sem-internet"],
    ["internal", "indisponivel"],
    ["unavailable", "indisponivel"],
  ] as const)("erro da API %s vira %s", (apiCode, expected) => {
    expect(toPasswordAuthError(new ApiError(apiCode)).code).toBe(expected);
  });

  it("mantém os próprios erros e trata o desconhecido como indisponível", () => {
    const own = new PasswordAuthError("ja-existe");
    expect(toPasswordAuthError(own)).toBe(own);
    expect(toPasswordAuthError(new Error("boom")).code).toBe("indisponivel");
  });
});
