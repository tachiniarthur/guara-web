import { formatCpf, isValidCpf, onlyDigits } from "./cpf";

describe("cpf", () => {
  it.each(["52998224725", "529.982.247-25", "11144477735", "12345678909"])("aceita %s", (cpf) => {
    expect(isValidCpf(cpf)).toBe(true);
  });

  it.each(["", "123", "52998224726", "11111111111", "000.000.000-00", "529982247255", "abc"])(
    "recusa %j",
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(false);
    },
  );

  it("tira o que não é dígito", () => {
    expect(onlyDigits("529.982.247-25")).toBe("52998224725");
  });

  it.each([
    ["", ""],
    ["5", "5"],
    ["529", "529"],
    ["5299", "529.9"],
    ["529982", "529.982"],
    ["5299822", "529.982.2"],
    ["529982247", "529.982.247"],
    ["5299822472", "529.982.247-2"],
    ["52998224725", "529.982.247-25"],
    ["529982247259999", "529.982.247-25"],
    ["52a9.9", "529.9"],
  ])("mascara %j → %j", (input, output) => {
    expect(formatCpf(input)).toBe(output);
  });
});
