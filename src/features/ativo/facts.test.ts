import { rateText, toAssetFacts } from "./facts";
import { periodStats } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));

const cdb = {
  id: "3f1c2b8e-9a4d-4c55-8f0e-2b7d9c1a6e42",
  assetClass: "fixed_income",
  instrumentType: "cdb",
  name: "CDB Banco X 2028",
  symbol: null,
  risk: "low" as const,
  quantity: "1.00000000",
  averagePriceCents: 500_000,
  costCents: 500_000,
  valueCents: 540_000,
  valuationSource: "open_finance",
  valuedOn: "2026-11-16",
  returnPct: 8,
  portfolioPct: 5,
  country: "BR",
  source: "open_finance",
  updatedAt: "2026-11-16T12:00:00Z",
  issuer: "Banco X",
  issuedOn: "2025-03-10",
  maturesOn: "2028-03-10",
  ratePct: "110",
  rateIndex: "cdi",
  fixedAnnualRatePct: null,
};

describe("taxa da renda fixa", () => {
  it("pós-fixado, IPCA + taxa e prefixado", () => {
    expect(rateText(cdb)).toBe("110% do CDI");
    expect(rateText({ ratePct: null, rateIndex: "ipca", fixedAnnualRatePct: "6.2" })).toBe(
      "IPCA + 6,2% a.a.",
    );
    expect(rateText({ ratePct: "12.5", rateIndex: "prefixed", fixedAnnualRatePct: null })).toBe(
      "12,5% a.a.",
    );
    expect(rateText({ ratePct: null, rateIndex: null, fixedAnnualRatePct: null })).toBeNull();
  });
});

describe("mais detalhes do ativo", () => {
  it("só mostra os campos que a API manda", () => {
    const facts = plain(toAssetFacts(cdb, null));
    expect(facts.map((s) => s.titulo)).toEqual(["Identificação", "Negociação", "Custos", "Risco"]);
    const labels = facts.flatMap((s) => s.linhas.map((l) => l.label));
    expect(labels).toContain("Emissor");
    expect(labels).toContain("Vencimento");
    expect(labels).not.toContain("Ticker");
    expect(labels).not.toContain("Cotação");
    expect(labels).not.toContain("Quantidade");
    expect(facts[1]!.linhas).toContainEqual({ label: "Taxa", value: "110% do CDI" });
    expect(facts[1]!.linhas).toContainEqual({ label: "Vencimento", value: "10/03/2028" });
  });
});

describe("resumo do período do gráfico", () => {
  it("variação, máxima e mínima", () => {
    expect(periodStats([{ value: 10 }, { value: 14 }, { value: 8 }, { value: 12 }])).toEqual({
      variacao: 20,
      max: 14,
      min: 8,
    });
  });

  it("sem pontos suficientes ou começando em zero", () => {
    expect(periodStats([{ value: 10 }])).toBeNull();
    expect(periodStats([{ value: 0 }, { value: 5 }])?.variacao).toBeNull();
  });
});
