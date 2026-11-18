import { isBelongingId, toBelongingView } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll("\u00a0", " "));

const base = {
  id: "0b6a3f5e-2c1d-4e8f-9a7b-6c5d4e3f2a1b",
  kind: "real_estate" as const,
  name: "Apartamento",
  valueCents: 60_000_000,
  valueDate: "2026-08-12",
  debtCents: 21_000_000,
  netCents: 39_000_000,
};

describe("bens com os dados da API", () => {
  it("financiado: saldo, líquido, quanto já é seu e parte do patrimônio", () => {
    expect(plain(toBelongingView(base, 78_000_000))).toMatchObject({
      tipo: "Imóvel",
      linha: "Imóvel · financiado",
      valor: "R$ 600.000,00",
      atualizacao: "Valor informado por você em 12/08/2026",
      financiado: true,
      saldo: "R$ 210.000,00",
      liquido: "R$ 390.000,00",
      quitado: 65,
      noPatrimonio: "50% do total",
    });
  });

  it("quitado e sem patrimônio conhecido", () => {
    const view = toBelongingView(
      { ...base, kind: "vehicle", debtCents: null, netCents: 60_000_000 },
      null,
    );
    expect(view).toMatchObject({ linha: "Veículo · quitado", quitado: null, noPatrimonio: null });
  });

  it("só uuid vira chamada à API", () => {
    expect(isBelongingId(base.id)).toBe(true);
    expect(isBelongingId("apto")).toBe(false);
  });
});
