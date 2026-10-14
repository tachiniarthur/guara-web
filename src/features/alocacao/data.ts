/**
 * Carteira-alvo por perfil: quatro perfis dividem a carteira em cinco grupos, cada um com
 * subclasses. O Guará compara a carteira real com o alvo do perfil e mostra a diferença em
 * pontos percentuais, sem nunca mover dinheiro. Bens (imóveis e veículos) ficam fora.
 */

export type GroupId = "rf-br" | "rf-int" | "rv-br" | "rv-int" | "cripto";

export type AllocationGroup = {
  id: GroupId;
  nome: string;
  /** Rótulo curto (tabelas e gráficos estreitos). */
  curta: string;
  cor: string;
};

export const groups: AllocationGroup[] = [
  { id: "rf-br", nome: "Renda fixa Brasil", curta: "RF Brasil", cor: "#6DB3EC" },
  { id: "rf-int", nome: "Renda fixa internacional", curta: "RF intern.", cor: "#93A198" },
  { id: "rv-br", nome: "Renda variável Brasil", curta: "RV Brasil", cor: "#FF6A50" },
  { id: "rv-int", nome: "Renda variável internacional", curta: "RV intern.", cor: "#F2C230" },
  { id: "cripto", nome: "Cripto", curta: "Cripto", cor: "#6CC08E" },
];

export const groupById = Object.fromEntries(groups.map((g) => [g.id, g])) as Record<
  GroupId,
  AllocationGroup
>;

export type ProfileId = "conservador" | "moderado" | "arrojado" | "sofisticado";

export type Subclass = { grupo: GroupId; nome: string; alvo: number };

export type InvestorProfile = {
  id: ProfileId;
  nome: string;
  paraQuem: string;
  alvo: Record<GroupId, number>;
  subclasses: Subclass[];
  /** Quanto da carteira atual mudaria de grupo para ficar igual a este perfil. */
  mudaria: string;
};

export const profiles: InvestorProfile[] = [
  {
    id: "conservador",
    nome: "Conservador",
    paraQuem: "Proteger o que já tem, com pouca oscilação",
    alvo: { "rf-br": 75, "rf-int": 13, "rv-br": 6, "rv-int": 4, cripto: 2 },
    mudaria: "42%",
    subclasses: [
      { grupo: "rf-br", nome: "Pós-fixada", alvo: 48 },
      { grupo: "rf-br", nome: "Inflação (IPCA+)", alvo: 17 },
      { grupo: "rf-br", nome: "Prefixada", alvo: 5 },
      { grupo: "rf-br", nome: "Crédito privado baixo risco", alvo: 5 },
      { grupo: "rf-int", nome: "Treasuries", alvo: 8 },
      { grupo: "rf-int", nome: "Bonds investment grade", alvo: 5 },
      { grupo: "rv-br", nome: "Ações large cap/blue chips", alvo: 4 },
      { grupo: "rv-br", nome: "FIIs (papel, baixo risco)", alvo: 2 },
      { grupo: "rv-int", nome: "ETFs internacionais", alvo: 4 },
      { grupo: "cripto", nome: "Bitcoin", alvo: 2 },
    ],
  },
  {
    id: "moderado",
    nome: "Moderado",
    paraQuem: "Equilíbrio entre proteção e crescimento",
    alvo: { "rf-br": 48, "rf-int": 14, "rv-br": 19, "rv-int": 14, cripto: 5 },
    mudaria: "22,1%",
    subclasses: [
      { grupo: "rf-br", nome: "Pós-fixada", alvo: 24 },
      { grupo: "rf-br", nome: "Inflação (IPCA+)", alvo: 14 },
      { grupo: "rf-br", nome: "Prefixada", alvo: 5 },
      { grupo: "rf-br", nome: "Crédito privado", alvo: 5 },
      { grupo: "rf-int", nome: "Treasuries", alvo: 8 },
      { grupo: "rf-int", nome: "Bonds investment grade", alvo: 6 },
      { grupo: "rv-br", nome: "Ações large cap", alvo: 10 },
      { grupo: "rv-br", nome: "Ações small caps", alvo: 3 },
      { grupo: "rv-br", nome: "FIIs", alvo: 6 },
      { grupo: "rv-int", nome: "ETFs internacionais", alvo: 9 },
      { grupo: "rv-int", nome: "Ações diretas/BDRs", alvo: 5 },
      { grupo: "cripto", nome: "Bitcoin", alvo: 4 },
      { grupo: "cripto", nome: "Ethereum", alvo: 1 },
    ],
  },
  {
    id: "arrojado",
    nome: "Arrojado",
    paraQuem: "Crescer no longo prazo, aceitando quedas no caminho",
    alvo: { "rf-br": 23, "rf-int": 15, "rv-br": 30, "rv-int": 20, cripto: 12 },
    mudaria: "29,2%",
    subclasses: [
      { grupo: "rf-br", nome: "Pós-fixada", alvo: 9 },
      { grupo: "rf-br", nome: "Inflação (IPCA+)", alvo: 7 },
      { grupo: "rf-br", nome: "Prefixada", alvo: 4 },
      { grupo: "rf-br", nome: "Crédito privado", alvo: 3 },
      { grupo: "rf-int", nome: "Treasuries", alvo: 7 },
      { grupo: "rf-int", nome: "Bonds (IG + parcela high yield)", alvo: 8 },
      { grupo: "rv-br", nome: "Ações large cap", alvo: 13 },
      { grupo: "rv-br", nome: "Ações small caps", alvo: 8 },
      { grupo: "rv-br", nome: "FIIs", alvo: 9 },
      { grupo: "rv-int", nome: "ETFs internacionais", alvo: 9 },
      { grupo: "rv-int", nome: "Ações diretas", alvo: 7 },
      { grupo: "rv-int", nome: "Fundos de ações internacionais", alvo: 4 },
      { grupo: "cripto", nome: "Bitcoin", alvo: 7 },
      { grupo: "cripto", nome: "Ethereum", alvo: 3 },
      { grupo: "cripto", nome: "Altcoins", alvo: 2 },
    ],
  },
  {
    id: "sofisticado",
    nome: "Sofisticado",
    paraQuem: "Experiência com estruturados e alternativos",
    alvo: { "rf-br": 13, "rf-int": 22, "rv-br": 25, "rv-int": 25, cripto: 15 },
    mudaria: "44,2%",
    subclasses: [
      { grupo: "rf-br", nome: "Crédito privado estruturado", alvo: 7 },
      { grupo: "rf-br", nome: "Pós-fixada/liquidez", alvo: 3 },
      { grupo: "rf-br", nome: "Inflação (IPCA+)", alvo: 3 },
      { grupo: "rf-int", nome: "Treasuries", alvo: 8 },
      { grupo: "rf-int", nome: "Bonds (IG + high yield)", alvo: 9 },
      { grupo: "rf-int", nome: "Dívida estruturada/distressed", alvo: 5 },
      { grupo: "rv-br", nome: "Ações large cap", alvo: 9 },
      { grupo: "rv-br", nome: "Ações small/mid caps", alvo: 6 },
      { grupo: "rv-br", nome: "FIIs", alvo: 10 },
      { grupo: "rv-int", nome: "ETFs internacionais", alvo: 9 },
      { grupo: "rv-int", nome: "Ações diretas", alvo: 6 },
      { grupo: "rv-int", nome: "Private equity/venture capital", alvo: 7 },
      { grupo: "rv-int", nome: "Fundos de ações internacionais", alvo: 3 },
      { grupo: "cripto", nome: "Bitcoin", alvo: 8 },
      { grupo: "cripto", nome: "Ethereum", alvo: 4 },
      { grupo: "cripto", nome: "Altcoins", alvo: 2 },
      { grupo: "cripto", nome: "Stablecoins", alvo: 1 },
    ],
  },
];

export const profileById = Object.fromEntries(profiles.map((p) => [p.id, p])) as Record<
  ProfileId,
  InvestorProfile
>;

/** Subclasse da carteira real, com o que o usuário tem nela. */
export type HeldSubclass = Subclass & { atual: number; detalhe?: string };

/** A carteira do usuário no modelo de 5 grupos (perfil Moderado). */
export const portfolioAllocation = {
  perfil: "moderado" as ProfileId,
  definidoEm: "23/09/2026",
  total: "R$ 48.310,90",
  ativos: 12,
  atual: { "rf-br": 46, "rf-int": 0, "rv-br": 36.2, "rv-int": 7.9, cripto: 9.9 } as Record<
    GroupId,
    number
  >,
  subclasses: [
    {
      grupo: "rf-br",
      nome: "Pós-fixada",
      alvo: 24,
      atual: 46,
      detalhe: "Tesouro Selic, CDB/LCI/LCA pós, fundos DI · R$ 22.222,10",
    },
    { grupo: "rf-br", nome: "Inflação (IPCA+)", alvo: 14, atual: 0 },
    { grupo: "rf-br", nome: "Prefixada", alvo: 5, atual: 0 },
    { grupo: "rf-br", nome: "Crédito privado", alvo: 5, atual: 0 },
    { grupo: "rf-int", nome: "Treasuries", alvo: 8, atual: 0 },
    { grupo: "rf-int", nome: "Bonds investment grade", alvo: 6, atual: 0 },
    {
      grupo: "rv-br",
      nome: "Ações large cap",
      alvo: 10,
      atual: 22.1,
      detalhe: "PETR4 e BOVA11 · R$ 10.691,50",
    },
    { grupo: "rv-br", nome: "Ações small caps", alvo: 3, atual: 0 },
    { grupo: "rv-br", nome: "FIIs", alvo: 6, atual: 14, detalhe: "HGLG11 · R$ 6.774,60" },
    {
      grupo: "rv-int",
      nome: "ETFs internacionais",
      alvo: 9,
      atual: 2.9,
      detalhe: "IVVB11 · R$ 1.405,60",
    },
    {
      grupo: "rv-int",
      nome: "Ações diretas/BDRs",
      alvo: 5,
      atual: 5,
      detalhe: "5 BDRs · R$ 2.418,54",
    },
    { grupo: "cripto", nome: "Bitcoin", alvo: 4, atual: 9.9, detalhe: "BTC · R$ 4.798,56" },
    { grupo: "cripto", nome: "Ethereum", alvo: 1, atual: 0 },
  ] as HeldSubclass[],
  /** Distância até o alvo, em reais. */
  emReais: [
    { grupo: "rf-br", hoje: "R$ 22.222,10", alvo: "R$ 23.189,23", falta: "faltam R$ 967,13" },
    { grupo: "rf-int", hoje: "R$ 0,00", alvo: "R$ 6.763,53", falta: "faltam R$ 6.763,53" },
    { grupo: "rv-br", hoje: "R$ 17.466,10", alvo: "R$ 9.179,07", falta: "R$ 8.287,03 acima" },
    { grupo: "rv-int", hoje: "R$ 3.824,14", alvo: "R$ 6.763,53", falta: "faltam R$ 2.939,39" },
    { grupo: "cripto", hoje: "R$ 4.798,56", alvo: "R$ 2.415,55", falta: "R$ 2.383,02 acima" },
  ] as { grupo: GroupId; hoje: string; alvo: string; falta: string }[],
};

const pct = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** "46%", "36,2%". */
export function formatPercent(value: number) {
  return `${pct.format(value)}%`;
}

/** Diferença em p.p. com sinal tipográfico ("+17,2 p.p.", "−2 p.p."). */
export function formatDiff(diff: number) {
  if (Math.abs(diff) < 0.05) return "no alvo";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${pct.format(Math.abs(diff))} p.p.`;
}

/** Cor da diferença: acima do alvo em urucum, abaixo em arara, perto (menos de 2 p.p.) neutra. */
export function diffColor(diff: number) {
  if (Math.abs(diff) < 2) return "#93A198";
  return diff > 0 ? "#FF6A50" : "#6DB3EC";
}

/** Fora do alvo: diferença maior que 5 p.p. num grupo. */
export const OFF_TARGET_PP = 5;

/** Grupos da carteira com diferença maior que OFF_TARGET_PP, do maior para o menor desvio. */
export function offTargetGroups(profile: ProfileId = portfolioAllocation.perfil) {
  const alvo = profileById[profile].alvo;
  return groups
    .map((g) => ({ grupo: g, diff: portfolioAllocation.atual[g.id] - alvo[g.id] }))
    .filter((item) => Math.abs(item.diff) > OFF_TARGET_PP)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
}
