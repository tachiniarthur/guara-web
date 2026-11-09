import { toInvestimentosView, type InvestimentosResponses } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll(" ", " "));
const now = new Date("2026-11-06T15:00:00-03:00");
const position = (over: Record<string, unknown>) => ({
  id: "p",
  assetClass: "fixed_income",
  instrumentType: "treasury",
  name: "Tesouro Selic 2029",
  symbol: null,
  risk: "low",
  quantity: "1",
  averagePriceCents: 1_000_000,
  costCents: 1_000_000,
  valueCents: 1_100_000,
  valuationSource: "manual",
  valuedOn: "2026-11-06",
  returnPct: 10,
  portfolioPct: 50,
  country: "BR",
  source: "manual",
  updatedAt: "2026-11-06T12:00:00Z",
  ...over,
});

const selic = position({ id: "a" });
const ivvb = position({
  id: "b",
  assetClass: "equities",
  instrumentType: "etf",
  name: "iShares S&P 500",
  symbol: "IVVB11",
  risk: "high",
  quantity: "20",
  averagePriceCents: 30_000,
  costCents: 600_000,
  valueCents: 700_000,
  returnPct: 16.67,
  portfolioPct: 31.82,
  country: "US",
});
const hglg = position({
  id: "c",
  assetClass: "real_estate",
  instrumentType: "fii",
  name: "CSHG Logística",
  symbol: "HGLG11",
  risk: "medium",
  quantity: "2",
  averagePriceCents: 200_000,
  costCents: 400_000,
  valueCents: 400_000,
  returnPct: null,
  portfolioPct: 18.18,
});

const responses = {
  summary: {
    investedCents: 2_200_000,
    costCents: 2_000_000,
    gainCents: 200_000,
    returnPct: 10,
    unvaluedPositions: 0,
    year: 2026,
    contributionsYearCents: 1_100_000,
    dividendsYearCents: null,
    totalNetWorthCents: 50_000_000,
  },
  evolution: {
    returnPct: 12.4,
    cdiPct: null,
    points: [
      { date: "2026-09-30", valueCents: 2_000_000, returnPct: 5, cdiPct: null },
      { date: "2026-10-31", valueCents: 2_100_000, returnPct: 9, cdiPct: null },
      { date: "2026-11-05", valueCents: 2_200_000, returnPct: 12.4, cdiPct: null },
    ],
  },
  positions: {
    data: [selic, ivvb, hglg],
    groups: [
      {
        assetClass: "fixed_income",
        label: "Renda fixa",
        valueCents: 1_100_000,
        pct: 50,
        positions: [selic],
      },
      {
        assetClass: "equities",
        label: "Renda variável",
        valueCents: 700_000,
        pct: 31.82,
        positions: [ivvb],
      },
      {
        assetClass: "real_estate",
        label: "Imobiliário",
        valueCents: 400_000,
        pct: 18.18,
        positions: [hglg],
      },
    ],
  },
  belongings: {
    data: [
      {
        id: "h",
        kind: "real_estate",
        name: "Apartamento",
        valueCents: 60_000_000,
        valueDate: "2026-08-01",
        debtCents: 20_000_000,
      },
    ],
  },
  alerts: { data: [] },
  profile: { profile: { profile: "moderate", createdAt: "2026-10-01T12:00:00Z" } },
  dashboard: { netWorth: { data: { investmentsMonthChangeCents: 100_000 } } },
} as unknown as InvestimentosResponses;

describe("Investimentos com os dados da API", () => {
  const view = plain(toInvestimentosView(responses, now));

  it("carteira, variação do mês, rentabilidade sem CDI e estatísticas", () => {
    expect(view.portfolio.patrimonio).toBe("R$ 22.000,00");
    expect(view.portfolio.variacaoMes).toBe("+R$ 1.000,00 em novembro (+4,8%)");
    expect(view.portfolio.rentabilidade.carteira).toEqual([5, 9, 12.4]);
    expect(view.portfolio.rentabilidade.cdi).toEqual([null, null, null]);
    expect(view.portfolio.stats.map((s) => s.valor)).toEqual(["+12,4%", "R$ 11.000", "—"]);
  });

  it("alocação nos 5 grupos do design, pelo instrumento e pelo país", () => {
    expect(view.portfolioAllocation.perfil).toBe("moderado");
    expect(view.portfolioAllocation.atual).toEqual({
      "rf-br": 50,
      "rf-int": 0,
      "rv-br": 18.2,
      "rv-int": 31.8,
      cripto: 0,
    });
    expect(view.countryExposure.map((c) => [c.pais, c.percentual])).toEqual([
      ["Brasil", 68],
      ["Estados Unidos", 32],
    ]);
  });

  it("posições por classe, variação vazia como travessão e bens", () => {
    expect(view.positionGroups.map((g) => g.classe)).toEqual([
      "Renda fixa",
      "Renda variável",
      "Imobiliário",
    ]);
    const fii = view.positionGroups[2]!.posicoes[0]!;
    expect(fii).toMatchObject({ nome: "HGLG11", quantidade: "2", hoje: { valor: "—" } });
    expect(view.otherAssets[0]).toMatchObject({
      nome: "Apartamento",
      extra: "Saldo devedor R$ 200.000",
    });
  });

  it("ativo dos EUA: bolsa na descrição, preço médio e valor em US$ ao lado dos reais", () => {
    const aapl = position({
      id: "us",
      assetClass: "equities",
      instrumentType: "stock",
      name: "Apple Inc.",
      symbol: "AAPL",
      risk: "high",
      quantity: "2",
      averagePriceCents: 161_994,
      valueCents: 377_942,
      country: "US",
      micCode: "XNAS",
      currency: "USD",
      originalAveragePrice: "300",
      originalValue: "701.58",
    });
    const us = plain(
      toInvestimentosView(
        {
          ...responses,
          positions: {
            data: [aapl],
            groups: [
              {
                assetClass: "equities",
                label: "Renda variável",
                valueCents: 377_942,
                pct: 100,
                positions: [aapl],
              },
            ],
          },
        } as unknown as InvestimentosResponses,
        now,
      ),
    );
    expect(us.positionGroups[0]!.posicoes[0]).toMatchObject({
      nome: "AAPL",
      descricao: "Apple Inc. · Nasdaq",
      precoMedio: "US$ 300,00",
      total: "R$ 3.779,42",
      totalOriginal: "US$ 701,58",
    });
  });
});
