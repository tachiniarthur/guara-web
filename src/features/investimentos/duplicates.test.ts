import { duplicateRows } from "./duplicates";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));

const base = {
  id: "3f1c2b8e-9a4d-4c55-8f0e-2b7d9c1a6e42",
  assetClass: "fixed_income",
  instrumentType: "treasury",
  name: "Tesouro Selic 2029",
  symbol: null,
  risk: "low" as const,
  quantity: "1.00000000",
  averagePriceCents: 1_000_000,
  costCents: 1_000_000,
  valueCents: 1_050_000,
  valuationSource: "manual",
  valuedOn: "2026-11-10",
  returnPct: 5,
  portfolioPct: 10,
  country: "BR",
  source: "manual",
  updatedAt: "2026-11-12T12:00:00Z",
  createdAt: "2026-10-01T12:00:00Z",
};

describe("investimento duplicado", () => {
  it("cadastro manual: valor informado e data do cadastro", () => {
    expect(plain(duplicateRows(base))).toEqual([
      { label: "Valor informado", value: "R$ 10.500,00" },
      { label: "Quantidade", value: "—" },
      { label: "Cadastrado", value: "01/10/2026 · à mão" },
    ]);
  });

  it("Open Finance com ticker: valor de hoje, quantidade e data da atualização", () => {
    const rows = duplicateRows({
      ...base,
      source: "open_finance",
      symbol: "PETR4",
      quantity: "100.00000000",
    });
    expect(plain(rows)).toEqual([
      { label: "Valor hoje", value: "R$ 10.500,00" },
      { label: "Quantidade", value: "100" },
      { label: "Atualizado", value: "10/11/2026 · sozinho" },
    ]);
  });
});
