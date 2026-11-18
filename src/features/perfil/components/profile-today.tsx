"use client";

import Link from "next/link";

import { ClassSwatch } from "@/features/alocacao/components/class-allocation";
import { formatPercent } from "@/features/alocacao/format";
import { CLASS_COLOR, type InvestorProfileResponse } from "@/features/alocacao/live";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Saved = NonNullable<InvestorProfileResponse["profile"]>;

/** Os perfis da API em ordem, com o atual em destaque (só leitura). */
export function ProfileLevels({
  levels,
  current,
}: {
  levels: { kind: string; nome: string }[];
  current: string | null;
}) {
  return (
    <div aria-label="Perfis de investidor" role="list" className="flex gap-1.5">
      {levels.map((level) => {
        const on = level.kind === current;
        return (
          <span
            key={level.kind}
            role="listitem"
            aria-current={on ? "true" : undefined}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span className={cn("h-2 w-full rounded-[4px]", on ? "bg-tucano" : "bg-shade")} />
            <span
              className={cn(
                "text-13",
                on ? "font-extrabold text-sand" : "font-medium text-caption",
              )}
            >
              {level.nome}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Carteira-alvo do perfil gravado, classe por classe. */
export function SavedTargets({ saved }: { saved: Saved }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {saved.targetAllocation.map((t) => (
        <li
          key={t.assetClass}
          className="flex items-center gap-2.5 border-b border-line py-2 text-14 last:border-b-0"
        >
          <ClassSwatch color={CLASS_COLOR[t.assetClass]} />
          <span className="min-w-0 grow">{t.label}</span>
          <strong className="tabular-nums">{formatPercent(t.targetPct)}</strong>
        </li>
      ))}
    </ul>
  );
}

/** "Comparar os perfis" (a página de Alocação com o alvo de cada um). */
export function CompareProfilesLink({ count }: { count?: number }) {
  return (
    <div className="flex justify-end">
      <Link
        href="/investimentos/alocacao/perfis"
        className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
      >
        {count ? `Comparar os ${count} perfis` : "Comparar os perfis"}
        <Icon name="chevron-right" size={16} />
      </Link>
    </div>
  );
}
