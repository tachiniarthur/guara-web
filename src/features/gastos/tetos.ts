import type { IconName } from "@/components/ui/icon";

import { tetos, type TetoProgress } from "./data";

/** Situação do teto no mês: abaixo de 70%, 70% ou mais, ou passou. */
export type TetoStatus = "no-ritmo" | "perto" | "estourou";

export const tetoStatusLabel: Record<TetoStatus, string> = {
  "no-ritmo": "No ritmo",
  perto: "Perto do teto",
  estourou: "Estourou",
};

export type TetoDetail = TetoProgress & {
  icone: IconName;
  gastoCompleto: string;
  tetoCompleto: string;
  status: TetoStatus;
  resumo: string;
  /** Frase do cartão de destaque ("74% · faltam R$ 257,82 · no ritmo atual, fecha perto de R$ 960"). */
  destaque: { percentual: string; faltam: string; ritmo?: string };
  historico: { mes: string; valor: number }[];
  avisos: { titulo: string; quando: string; enviado: boolean }[];
};

const extra: Record<string, Omit<TetoDetail, keyof TetoProgress>> = {
  alimentacao: {
    icone: "tag",
    gastoCompleto: "R$ 742,18",
    tetoCompleto: "R$ 1.000,00",
    status: "perto",
    resumo: "74% · No ritmo atual, fecha perto de R$ 960",
    destaque: { percentual: "74%", faltam: "R$ 257,82", ritmo: "R$ 960" },
    historico: [
      { mes: "abr", valor: 790 },
      { mes: "mai", valor: 860 },
      { mes: "jun", valor: 880 },
      { mes: "jul", valor: 1020 },
      { mes: "ago", valor: 830 },
      { mes: "set*", valor: 742 },
    ],
    avisos: [
      { titulo: "R$ 500 · 1º de 3 avisos", quando: "12/09/2026, 13:48 · celular", enviado: true },
      { titulo: "R$ 700 · 2º de 3 avisos", quando: "21/09/2026, 19:02 · celular", enviado: true },
      { titulo: "R$ 1.000 · teto", quando: "Ainda não chegou", enviado: false },
    ],
  },
  transporte: {
    icone: "car-front",
    gastoCompleto: "R$ 386,40",
    tetoCompleto: "R$ 450,00",
    status: "perto",
    resumo: "86% · Faltam R$ 63,60 · no ritmo atual, passa do teto",
    destaque: { percentual: "86%", faltam: "R$ 63,60" },
    historico: [
      { mes: "abr", valor: 320 },
      { mes: "mai", valor: 410 },
      { mes: "jun", valor: 380 },
      { mes: "jul", valor: 440 },
      { mes: "ago", valor: 430 },
      { mes: "set*", valor: 386 },
    ],
    avisos: [
      { titulo: "R$ 300 · 1º de 2 avisos", quando: "15/09/2026, 08:12 · celular", enviado: true },
      { titulo: "R$ 450 · teto", quando: "Ainda não chegou", enviado: false },
    ],
  },
  lazer: {
    icone: "star",
    gastoCompleto: "R$ 120,00",
    tetoCompleto: "R$ 400,00",
    status: "no-ritmo",
    resumo: "30% · Faltam R$ 280,00",
    destaque: { percentual: "30%", faltam: "R$ 280,00" },
    historico: [
      { mes: "abr", valor: 260 },
      { mes: "mai", valor: 310 },
      { mes: "jun", valor: 240 },
      { mes: "jul", valor: 380 },
      { mes: "ago", valor: 290 },
      { mes: "set*", valor: 120 },
    ],
    avisos: [
      { titulo: "R$ 200 · 1º de 3 avisos", quando: "Ainda não chegou", enviado: false },
      { titulo: "R$ 300 · 2º de 3 avisos", quando: "Ainda não chegou", enviado: false },
      { titulo: "R$ 400 · teto", quando: "Ainda não chegou", enviado: false },
    ],
  },
};

export const tetoDetails: TetoDetail[] = tetos.map((teto) => ({
  ...teto,
  ...(extra[teto.id] ?? extra.alimentacao!),
}));

export function findTeto(id: string) {
  return tetoDetails.find((teto) => teto.id === id);
}

export const tetosSummary = {
  ativos: 3,
  gasto: "R$ 1.248,58",
  total: "R$ 1.850,00",
  percentual: 67.5,
  nota: "67% do total dos tetos · recomeçam no dia 1º de outubro",
};

export const previousMonths: { mes: string; nota: string; status: TetoStatus }[] = [
  { mes: "Agosto", nota: "Nenhum teto estourado", status: "no-ritmo" },
  { mes: "Julho", nota: "Alimentação: R$ 1.020 de R$ 1.000", status: "estourou" },
];
