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
  profile: {
    profile: {
      profile: "moderate",
      label: "Moderado",
      targetAllocation: [],
      createdAt: "2026-10-01T12:00:00Z",
    },
  },
  allocation: {
    profile: "moderate",
    investedCents: 2_200_000,
    unvaluedPositions: 0,
    items: [
      {
        assetClass: "fixed_income",
        label: "Renda fixa",
        valueCents: 1_100_000,
        currentPct: 50,
        targetPct: 40,
        differencePp: 10,
        status: "above",
        message: "Renda fixa está 10,0 p.p. acima do alvo do seu perfil.",
      },
      {
        assetClass: "equities",
        label: "Renda variável",
        valueCents: 700_000,
        currentPct: 31.82,
        targetPct: 35,
        differencePp: -3.18,
        status: "below",
        message: "Renda variável está 3,2 p.p. abaixo do alvo do seu perfil.",
      },
      {
        assetClass: "real_estate",
        label: "Imobiliário",
        valueCents: 400_000,
        currentPct: 18.18,
        targetPct: 15,
        differencePp: 3.18,
        status: "above",
        message: "Imobiliário está 3,2 p.p. acima do alvo do seu perfil.",
      },
      {
        assetClass: "alternatives",
        label: "Alternativos",
        valueCents: 0,
        currentPct: 0,
        targetPct: 10,
        differencePp: -10,
        status: "below",
        message: "Alternativos está 10,0 p.p. abaixo do alvo do seu perfil.",
      },
    ],
  },
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

  it("alocação nas classes da API, contra o alvo do perfil, e exposição por país", () => {
    expect(view.alocacao.perfil).toMatchObject({ kind: "moderate", nome: "Moderado" });
    expect(view.alocacao.classes.map((c) => [c.nome, c.atual, c.alvo])).toEqual([
      ["Renda fixa", 50, 40],
      ["Renda variável", 31.82, 35],
      ["Imobiliário", 18.18, 15],
      ["Alternativos", 0, 10],
    ]);
    // Fora do alvo, da maior diferença para a menor; a distância em reais segue o alvo.
    expect(view.alocacao.foraDoAlvo.map((c) => c.nome)).toEqual([
      "Renda fixa",
      "Alternativos",
      "Renda variável",
      "Imobiliário",
    ]);
    expect(view.alocacao.classes[0]!.distanciaCents).toBe(220_000);
    expect(view.countryExposure.map((c) => [c.pais, c.percentual])).toEqual([
      ["Brasil", 68],
      ["Estados Unidos", 32],
    ]);
    expect(view.countryExposure[0]!.detalhe).toMatch(/^\d+ posições?: /);
  });

  it("sem perfil respondido: sem alvo e sem classes fora do alvo", () => {
    const noProfile = plain(
      toInvestimentosView(
        {
          ...responses,
          profile: { profile: null },
          allocation: {
            ...responses.allocation,
            profile: null,
            items: responses.allocation.items.map((item) => ({
              ...item,
              targetPct: null,
              differencePp: null,
              status: null,
              message: null,
            })),
          },
        },
        now,
      ),
    );
    expect(noProfile.alocacao.perfil).toBeNull();
    expect(noProfile.alocacao.foraDoAlvo).toEqual([]);
    expect(noProfile.alocacao.classes[0]).toMatchObject({ alvo: null, distanciaCents: null });
  });

  it("posições por classe, variação vazia como travessão e bens", () => {
    expect(view.positionGroups.map((g) => g.classe)).toEqual([
      "Renda fixa",
      "Renda variável",
      "Imobiliário",
    ]);
    const fii = view.positionGroups[2]!.posicoes[0]!;
    expect(fii).toMatchObject({ nome: "HGLG11", quantidade: "2", rentabilidade: { valor: "—" } });
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
