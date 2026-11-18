import type { PerformancePeriod } from "./performance";

/** Formatos que as telas de Investimentos mostram, montados das respostas da API (`live.ts`). */

export type Risk = "Baixo" | "Médio" | "Alto";

export type Origin =
  { tipo: "open-finance"; texto: string } | { tipo: "manual"; texto: string; atualizado: string };

export type Position = {
  id: string;
  /** Página da posição (`/investimentos/<id>`). */
  href: string;
  nome: string;
  descricao: string;
  classe: string;
  instrumento: string;
  risco: Risk;
  origem: Origin;
  quantidade?: string;
  precoMedio?: string;
  total: string;
  /** Ativo dos EUA: o valor em US$ (o `total` é em reais). */
  totalOriginal?: string;
  percentual: string;
  /** Rentabilidade da posição sobre o custo. */
  rentabilidade: { valor: string; alta: boolean };
};

export type PositionGroup = {
  classe: string;
  total: string;
  percentual: string;
  posicoes: Position[];
};

export interface PortfolioData {
  patrimonio: string;
  variacaoMes: string;
  totalComBens: string;
  /** Partes do total: investimentos e bens (líquidos da dívida). */
  investido: string;
  bens: string;
  /** Linha do topo da tela ("Valores de 16/11"). */
  atualizacao: string;
  outras: { quantidade: number; total: string; percentual: string };
  /** Rentabilidade acumulada (%) mês a mês: carteira e CDI (`null` sem CDI no mês). */
  rentabilidade: {
    carteira: number[];
    cdi: (number | null)[];
    /** Nome de cada mês da série ("nov", "dez"…; "nov/25" quando passa de um ano). O eixo mostra até 7. */
    rotulos?: string[];
    /** Período da série; padrão: 12 meses. */
    periodo?: PerformancePeriod;
  };
  stats: { id: string; rotulo: string; valor: string; detalhe: string; ganho?: boolean }[];
}

export type ExposureAsset = { nome: string; total: string; href: string };

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

export interface OtherAsset {
  id: string;
  icone: "home" | "car";
  nome: string;
  detalhe: string;
  detalheCurto: string;
  valor: string;
  fonte: string;
  fonteCurta: string;
  extra: string;
}

/** Tipos aceitos no cadastro manual (o que não chega pelo Open Finance). Imóvel e veículo são bens. */
export const investmentTypes = [
  "Ações, FIIs e ETFs",
  "Renda fixa",
  "Cripto",
  "Imóvel",
  "Veículo",
] as const;
export type InvestmentType = (typeof investmentTypes)[number];
