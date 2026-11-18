import { formatQuantity, isPositionId, perShare, toAssetView, toMarketView } from "./live";

const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value).replaceAll("\u00a0", " "));

const position = {
  id: "3f1c2b8e-9a4d-4c55-8f0e-2b7d9c1a6e42",
  assetClass: "equities",
  instrumentType: "stock",
  name: "Petrobras PN",
  symbol: "PETR4",
  risk: "high" as const,
  quantity: "100.00000000",
  averagePriceCents: 3_000,
  costCents: 300_000,
  priceCents: 3_600,
  valueCents: 360_000,
  valuationSource: "quote",
  valuedOn: "2026-11-16",
  returnPct: 20,
  portfolioPct: 12.5,
  country: "BR",
  micCode: null,
  currency: "BRL",
  gainCents: 60_000,
  manualValueCents: null,
  manualValueStale: false,
  source: "manual",
  updatedAt: "2026-11-16T12:00:00Z",
};

describe("página do ativo com os dados da API", () => {
  it("só uuid vira chamada à API", () => {
    expect(isPositionId(position.id)).toBe(true);
    expect(isPositionId("petr4")).toBe(false);
    expect(isPositionId("../me")).toBe(false);
  });

  it("posição com ticker: valor, ganho, rentabilidade e cadastro", () => {
    expect(plain(toAssetView(position))).toMatchObject({
      nome: "PETR4",
      descricao: "Petrobras PN",
      classe: "Renda variável",
      risco: "Alto",
      manual: true,
      mercado: true,
      cotado: true,
      valor: "R$ 3.600,00",
      ganho: { valor: "+R$ 600,00", alta: true },
      rentabilidade: { valor: "20%", alta: true },
      quantidade: "100",
      precoMedio: "R$ 30,00",
      cotacao: "R$ 36,00",
      valorEm: "Cotação de 16/11",
    });
  });

  it("renda fixa sem ticker: sem quantidade nem página de mercado", () => {
    const view = toAssetView({
      ...position,
      assetClass: "fixed_income",
      instrumentType: "cdb",
      name: "CDB Banco X",
      symbol: null,
      valuationSource: "manual",
      manualValueStale: true,
      gainCents: -1_000,
      returnPct: -0.5,
    });
    expect(plain(view)).toMatchObject({
      nome: "CDB Banco X",
      descricao: "CDB",
      mercado: false,
      cotado: false,
      quantidade: "—",
      valorEm: "Valor informado em 16/11",
      desatualizado: true,
      ganho: { valor: "−R$ 10,00", alta: false },
      rentabilidade: { valor: "0,5%", alta: false },
    });
  });

  it("mercado: faixa de 52 semanas, desempenho e proventos", () => {
    const view = toMarketView({
      asset: {
        symbol: "PETR4",
        name: "Petrobras",
        longName: null,
        assetType: "stock",
        sector: "Energia",
      },
      quote: {
        priceCents: 3_600,
        changePercent: -1.25,
        dayHighCents: 3_650,
        dayLowCents: 3_550,
        week52HighCents: 4_000,
        week52LowCents: 3_000,
        quotedAt: null,
      },
      performance: [
        { period: "1y", returnPct: 12.3, cdiPct: 10.8, volatilityPct: 28.4, sharpe: 0.21 },
      ],
      fundamentals: null,
      dividends: {
        last12Months: [
          {
            label: "Dividendo",
            ratePerShare: "0.47156696",
            lastDatePrior: "2026-08-20",
            exDate: "2026-08-21",
            paymentDate: "2026-09-10",
          },
        ],
        totalPerShare: "0.47156696",
        dividendYieldPct: 1.31,
      },
      corporateEvents: null,
      dataPlanLimits: ["fundamentals"],
    });
    expect(plain(view)).toMatchObject({
      variacaoDia: { valor: "1,3%", alta: false },
      faixa52: { min: "R$ 30,00", max: "R$ 40,00", posicao: 60 },
      desempenho: [{ periodo: "12 meses", retorno: "+12,3%", cdi: "+10,8%" }],
      proventos: { porCota: "R$ 0,4716", dy: "1,3%" },
      limites: ["dados do balanço"],
    });
  });

  it("quantidade e valor por cota sem float sobrando", () => {
    expect(formatQuantity("0.50000000")).toBe("0,5");
    expect(plain(perShare("1.2"))).toBe("R$ 1,20");
  });
});
