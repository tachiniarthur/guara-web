export type Risk = "Baixo" | "Médio" | "Alto";
export type Origin =
  | { tipo: "open-finance"; texto: string }
  | { tipo: "manual"; texto: string; atualizado: string }
  | { tipo: "chat"; texto: string; atualizado: string };

export type Position = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  classe: string;
  instrumento: string;
  risco: Risk;
  origem: Origin;
  quantidade?: string;
  precoMedio?: string;
  total: string;
  percentual: string;
  hoje: { valor: string; alta: boolean };
};

export type PositionGroup = {
  classe: string;
  total: string;
  percentual: string;
  posicoes: Position[];
};

/** Carteira agrupada por classe (dados de exemplo dos protótipos). */
export const positionGroups: PositionGroup[] = [
  {
    classe: "Renda fixa",
    total: "R$ 22.222,10",
    percentual: "46,0%",
    posicoes: [
      {
        id: "tesouro-selic",
        slug: "tesouro-selic-2029",
        nome: "Tesouro Selic 2029",
        descricao: "Tesouro Direto · pós-fixado, vence em 2029",
        classe: "Renda fixa",
        instrumento: "Título público",
        risco: "Baixo",
        origem: { tipo: "open-finance", texto: "Itaú · Open Finance" },
        total: "R$ 15.892,10",
        percentual: "32,9%",
        hoje: { valor: "+0,04%", alta: true },
      },
      {
        id: "cdb",
        slug: "cdb-110-cdi",
        nome: "CDB 110% CDI",
        descricao: "Nubank · garantido pelo FGC",
        classe: "Renda fixa",
        instrumento: "CDB",
        risco: "Baixo",
        origem: { tipo: "open-finance", texto: "Nubank · Open Finance" },
        total: "R$ 6.330,00",
        percentual: "13,1%",
        hoje: { valor: "+0,04%", alta: true },
      },
    ],
  },
  {
    classe: "Renda variável",
    total: "R$ 10.691,50",
    percentual: "22,1%",
    posicoes: [
      {
        id: "petr4",
        slug: "petr4",
        nome: "PETR4",
        descricao: "Petrobras PN",
        classe: "Renda variável",
        instrumento: "Ação",
        risco: "Alto",
        origem: { tipo: "manual", texto: "Cadastro manual", atualizado: "Atualizado em 20/09" },
        quantidade: "200",
        precoMedio: "R$ 35,10",
        total: "R$ 7.564,00",
        percentual: "15,7%",
        hoje: { valor: "−1,12%", alta: false },
      },
      {
        id: "bova11",
        slug: "bova11",
        nome: "BOVA11",
        descricao: "iShares Ibovespa",
        classe: "Renda variável",
        instrumento: "ETF",
        risco: "Médio",
        origem: { tipo: "manual", texto: "Cadastro manual", atualizado: "Atualizado em 12/09" },
        quantidade: "25",
        total: "R$ 3.127,50",
        percentual: "6,5%",
        hoje: { valor: "+0,38%", alta: true },
      },
    ],
  },
  {
    classe: "Imobiliário",
    total: "R$ 6.774,60",
    percentual: "14,0%",
    posicoes: [
      {
        id: "hglg11",
        slug: "hglg11",
        nome: "HGLG11",
        descricao: "Pátria Log · galpões logísticos",
        classe: "Imobiliário",
        instrumento: "Fundo imobiliário",
        risco: "Médio",
        origem: { tipo: "chat", texto: "Cadastro via chat", atualizado: "Atualizado em 18/09" },
        quantidade: "42",
        total: "R$ 6.774,60",
        percentual: "14,0%",
        hoje: { valor: "+0,21%", alta: true },
      },
    ],
  },
  {
    classe: "Alternativos",
    total: "R$ 4.798,56",
    percentual: "9,9%",
    posicoes: [
      {
        id: "bitcoin",
        slug: "bitcoin",
        nome: "Bitcoin",
        descricao: "BTC",
        classe: "Alternativos",
        instrumento: "Criptomoeda",
        risco: "Alto",
        origem: { tipo: "manual", texto: "Cadastro manual", atualizado: "Atualizado em 15/09" },
        quantidade: "0,0078",
        total: "R$ 4.798,56",
        percentual: "9,9%",
        hoje: { valor: "+2,40%", alta: true },
      },
    ],
  },
];

export const portfolio = {
  patrimonio: "R$ 48.310,90",
  variacaoMes: "+R$ 862,40 em setembro (+1,8%)",
  totalComBens: "R$ 746.810,90",
  outras: { quantidade: 6, total: "R$ 3.824,14", percentual: "7,9%" },
  /** Rentabilidade acumulada (%) de out a set: carteira e CDI. */
  rentabilidade: {
    carteira: [0, 1.2, 0.6, 2.1, 3.4, 2.8, 4.9, 6.1, 5.4, 7.8, 9.2, 11.1],
    cdi: [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3, 7.2, 8.1, 9.0, 9.9],
    meses: ["nov", "jan", "mar", "mai", "jul", "set"],
  },
  stats: [
    {
      id: "rent",
      rotulo: "Rentabilidade em 12 meses",
      valor: "+11,1%",
      detalhe: "CDI no período: +9,9%",
      ganho: true,
    },
    {
      id: "aportes",
      rotulo: "Aportes em 2026",
      valor: "R$ 9.600",
      detalhe: "R$ 1.067 por mês, em média",
    },
    {
      id: "proventos",
      rotulo: "Proventos em 2026",
      valor: "R$ 1.284",
      detalhe: "Dividendos, JCP e rendimentos",
    },
  ],
};

export type AllocationSlice = {
  classe: string;
  curta: string;
  cor: string;
  atual: number;
  alvo: number;
};

/** Alocação por classe contra o alvo do perfil moderado. */
export const allocation: AllocationSlice[] = [
  { classe: "Renda fixa", curta: "R. fixa", cor: "#6DB3EC", atual: 46, alvo: 50 },
  { classe: "Ações", curta: "Ações", cor: "#FF6A50", atual: 22, alvo: 20 },
  { classe: "FIIs", curta: "FIIs", cor: "#F2C230", atual: 14, alvo: 15 },
  { classe: "Cripto", curta: "Cripto", cor: "#6CC08E", atual: 10, alvo: 5 },
  { classe: "Internacional", curta: "Intern.", cor: "#93A198", atual: 8, alvo: 10 },
];

export type ExposureAsset = { nome: string; total: string; slug?: string };

export type CountryExposure = {
  id: string;
  pais: string;
  detalhe: string;
  percentual: number;
  valor: string;
  cor: "tucano" | "arara" | "folha";
  /** Onde o globo marca o país (bolsa ou centro financeiro) e o código ISO 3166 numérico. Sem país = órbita. */
  globo: { iso: number; lat: number; lng: number; local: string } | null;
  ativos: ExposureAsset[];
};

export const countryExposure: CountryExposure[] = [
  {
    id: "br",
    pais: "Brasil",
    detalhe: "Renda fixa, ações e FIIs",
    percentual: 82,
    valor: "R$ 39.615",
    cor: "tucano",
    globo: { iso: 76, lat: -23.55, lng: -46.63, local: "B3 e Tesouro Nacional" },
    ativos: [
      { nome: "Tesouro Selic 2029", total: "R$ 15.892,10", slug: "tesouro-selic-2029" },
      { nome: "PETR4", total: "R$ 7.564,00", slug: "petr4" },
      { nome: "HGLG11", total: "R$ 6.774,60", slug: "hglg11" },
      { nome: "CDB 110% CDI", total: "R$ 6.330,00", slug: "cdb-110-cdi" },
      { nome: "BOVA11", total: "R$ 3.127,50", slug: "bova11" },
    ],
  },
  {
    id: "us",
    pais: "Estados Unidos",
    detalhe: "Via IVVB11, que segue o S&P 500",
    percentual: 8,
    valor: "R$ 3.865",
    cor: "arara",
    globo: { iso: 840, lat: 40.71, lng: -74.01, local: "S&P 500, Nova York" },
    ativos: [{ nome: "IVVB11 (S&P 500)", total: "R$ 3.865,00" }],
  },
  {
    id: "none",
    pais: "Sem país",
    detalhe: "Bitcoin, negociado no mundo todo",
    percentual: 10,
    valor: "R$ 4.831",
    cor: "folha",
    globo: null,
    ativos: [{ nome: "Bitcoin", total: "R$ 4.798,56", slug: "bitcoin" }],
  },
];

export const otherAssets = [
  {
    id: "apto",
    icone: "home" as const,
    nome: "Apartamento em Pinheiros",
    detalhe: "Imóvel · 72 m² · financiado",
    detalheCurto: "Imóvel · saldo devedor R$ 214.300",
    valor: "R$ 620.000",
    fonte: "Estimativa sua · atualizada em ago/2026",
    fonteCurta: "Valor estimado por você em ago/2026",
    extra: "Saldo devedor R$ 214.300",
  },
  {
    id: "onix",
    icone: "car" as const,
    nome: "Onix LT 2022",
    detalhe: "Veículo · quitado",
    detalheCurto: "Veículo · quitado",
    valor: "R$ 78.500",
    fonte: "Tabela FIPE de setembro",
    fonteCurta: "Tabela FIPE de setembro · −0,8% no mês",
    extra: "−0,8% no mês",
  },
];

/** Tipos aceitos no cadastro manual (o que não chega pelo Open Finance). */
export const investmentTypes = [
  "Ações, FIIs e ETFs",
  "Renda fixa",
  "Cripto",
  "Imóvel",
  "Veículo",
  "Outros bens",
] as const;
export type InvestmentType = (typeof investmentTypes)[number];
