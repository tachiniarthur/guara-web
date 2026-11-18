"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { apiQuery, type ApiPath } from "@/lib/api-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { apiPercent, buildView } from "@/lib/live-format";

/*
 * Alocação com os dados da API: as quatro classes (renda fixa, renda variável, imobiliário e
 * alternativos), a carteira de hoje e o alvo do perfil que a pessoa respondeu no questionário.
 * A API descreve a diferença com texto neutro; o Guará nunca recomenda comprar ou vender.
 */

export const ASSET_CLASSES = ["fixed_income", "equities", "real_estate", "alternatives"] as const;
export type AssetClassId = (typeof ASSET_CLASSES)[number];

/** Cor de cada classe (a mesma em todas as telas). */
export const CLASS_COLOR: Record<AssetClassId, string> = {
  fixed_income: "#6DB3EC",
  equities: "#FF6A50",
  real_estate: "#F2C230",
  alternatives: "#6CC08E",
};

export const PROFILE_KINDS = ["conservative", "moderate", "aggressive"] as const;
export type ProfileKind = (typeof PROFILE_KINDS)[number];

const ClassSchema = z.enum(ASSET_CLASSES);
const ProfileKindSchema = z.enum(PROFILE_KINDS);

export const AllocationResponseSchema = z.object({
  profile: ProfileKindSchema.nullable(),
  investedCents: z.number().int(),
  unvaluedPositions: z.number().int(),
  items: z.array(
    z.object({
      assetClass: ClassSchema,
      label: z.string(),
      valueCents: z.number().int(),
      currentPct: apiPercent,
      targetPct: apiPercent.nullable(),
      differencePp: apiPercent.nullable(),
      status: z.enum(["aligned", "above", "below"]).nullable(),
      message: z.string().nullable(),
    }),
  ),
});
export type AllocationResponse = z.infer<typeof AllocationResponseSchema>;

const TargetSchema = z.array(
  z.object({ assetClass: ClassSchema, label: z.string(), targetPct: apiPercent }),
);

export const InvestorProfileSchema = z.object({
  profile: z
    .object({
      profile: ProfileKindSchema,
      label: z.string(),
      targetAllocation: TargetSchema,
      createdAt: z.string(),
    })
    .loose()
    .nullable(),
});
export type InvestorProfileResponse = z.infer<typeof InvestorProfileSchema>;

const QuestionnaireSchema = z
  .object({
    profiles: z.array(
      z.object({
        profile: ProfileKindSchema,
        label: z.string(),
        description: z.string(),
        targetAllocation: TargetSchema,
      }),
    ),
  })
  .loose();

/** Uma classe da carteira: o atual, o alvo do perfil (null sem perfil) e a diferença. */
export interface ClassSlice {
  id: AssetClassId;
  nome: string;
  cor: string;
  valorCents: number;
  valor: string;
  atual: number;
  alvo: number | null;
  /** atual − alvo, em pontos percentuais. */
  diff: number | null;
  status: "aligned" | "above" | "below" | null;
  /** Texto neutro da API ("Renda fixa está 4,2 p.p. abaixo do alvo do seu perfil."). */
  mensagem: string | null;
  /** Quanto falta (negativo) ou sobra (positivo) até o alvo, em centavos. */
  distanciaCents: number | null;
}

export interface PortfolioAllocation {
  perfil: { kind: ProfileKind; nome: string; definidoEm: string } | null;
  investidoCents: number;
  total: string;
  /** Posições sem valor (sem cotação nem valor informado): ficam fora da conta. */
  semValor: number;
  classes: ClassSlice[];
  /** Classes fora do alvo (acima ou abaixo), da maior diferença para a menor. */
  foraDoAlvo: ClassSlice[];
}

/** Converte as respostas da API na alocação que as telas mostram (função pura, testada). */
export function toAllocation(
  allocation: AllocationResponse,
  profile: InvestorProfileResponse,
): PortfolioAllocation {
  const invested = allocation.investedCents;
  const classes = allocation.items.map((item): ClassSlice => {
    const alvo = item.targetPct;
    return {
      id: item.assetClass,
      nome: item.label,
      cor: CLASS_COLOR[item.assetClass],
      valorCents: item.valueCents,
      valor: formatCurrency(item.valueCents),
      atual: item.currentPct,
      alvo,
      diff: item.differencePp,
      status: item.status,
      mensagem: item.message,
      distanciaCents: alvo === null ? null : item.valueCents - Math.round((invested * alvo) / 100),
    };
  });
  const current = profile.profile;
  return {
    perfil:
      allocation.profile && current
        ? { kind: current.profile, nome: current.label, definidoEm: formatDate(current.createdAt) }
        : null,
    investidoCents: invested,
    total: formatCurrency(invested),
    semValor: allocation.unvaluedPositions,
    classes,
    foraDoAlvo: classes
      .filter((c) => c.status === "above" || c.status === "below")
      .sort((a, b) => Math.abs(b.diff ?? 0) - Math.abs(a.diff ?? 0)),
  };
}

export const ALLOCATION_PATHS = {
  allocation: "/v1/investments/allocation",
  profile: "/v1/investor-profile",
} as const satisfies Record<string, ApiPath>;

/** Alocação da carteira (Investimentos e Alocação). `data` fica `undefined` enquanto carrega. */
export function useAllocation({ enabled = true }: { enabled?: boolean } = {}) {
  const results = useQueries({
    queries: [
      apiQuery(ALLOCATION_PATHS.allocation, AllocationResponseSchema, { enabled }),
      apiQuery(ALLOCATION_PATHS.profile, InvestorProfileSchema, { enabled }),
    ] as const,
  });
  const error = results.find((result) => result.error)?.error ?? null;
  const [allocation, profile] = results;
  if (error || !allocation.data || !profile.data) return { data: undefined, error };
  const [a, p] = [allocation.data, profile.data];
  return buildView("alocacao", () => toAllocation(a, p));
}

/** O perfil que vale hoje (`null` se nunca respondeu o questionário). */
export function useCurrentProfile({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery(apiQuery(ALLOCATION_PATHS.profile, InvestorProfileSchema, { enabled }));
}

export interface ProfileTarget {
  kind: ProfileKind;
  nome: string;
  descricao: string;
  alvo: Record<AssetClassId, number>;
}

/** Os perfis do questionário com a carteira-alvo de cada um. */
export function useProfileTargets({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    ...apiQuery("/v1/investor-profile/questionnaire", QuestionnaireSchema, {
      enabled,
      staleTime: 60 * 60_000,
    }),
    select: (raw: unknown): ProfileTarget[] =>
      QuestionnaireSchema.parse(raw).profiles.map((p) => ({
        kind: p.profile,
        nome: p.label,
        descricao: p.description,
        alvo: Object.fromEntries(
          ASSET_CLASSES.map((id) => [
            id,
            p.targetAllocation.find((t) => t.assetClass === id)?.targetPct ?? 0,
          ]),
        ) as Record<AssetClassId, number>,
      })),
  });
}
