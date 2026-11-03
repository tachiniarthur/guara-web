import { formatPhone, phoneProblem, toE164 } from "./phone";

describe("phoneProblem", () => {
  it("aceita celular com DDD em uso, com ou sem máscara", () => {
    expect(phoneProblem("11987654321")).toBeNull();
    expect(phoneProblem("(99) 91234-5678")).toBeNull();
  });

  it("diz o que falta ou o que está errado", () => {
    expect(phoneProblem("")).toBe("Informe o celular com DDD.");
    expect(phoneProblem("1198765")).toBe("Faltam números: o celular tem DDD e 9 dígitos.");
    expect(phoneProblem("20987654321")).toBe("Esse DDD não existe. Confira os números.");
    expect(phoneProblem("11387654321")).toBe("Informe um celular: o número começa com 9.");
  });
});

describe("formatPhone", () => {
  it("põe a máscara aos poucos e corta depois do 11º dígito", () => {
    expect(formatPhone("1")).toBe("(1");
    expect(formatPhone("1198")).toBe("(11) 98");
    expect(formatPhone("119876543")).toBe("(11) 98765-43");
    expect(formatPhone("119876543210")).toBe("(11) 98765-4321");
  });
});

it("toE164 põe o +55", () => {
  expect(toE164("(11) 98765-4321")).toBe("+5511987654321");
});
