import { Fragment } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { formatPercent, groups, portfolioAllocation, type InvestorProfile } from "../data";
import { GroupDonut, GroupSwatch, donutSizes } from "./allocation-parts";

const describe = (p: InvestorProfile) =>
  groups.map((g) => `${g.nome} ${formatPercent(p.alvo[g.id])}`).join(", ");

/** Barras da carteira-alvo de um perfil (escala: 80% ocupa a barra inteira). */
function TargetBars({ profile }: { profile: InvestorProfile }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {groups.map((g) => (
        <li key={g.id} className="flex flex-col gap-[0.3125rem] py-[0.4375rem]">
          <div className="flex items-center gap-2 text-13">
            <GroupSwatch id={g.id} />
            <span className="min-w-0 grow">{g.nome}</span>
            <strong className="tabular-nums">{formatPercent(profile.alvo[g.id])}</strong>
          </div>
          <div aria-hidden="true" className="relative h-1.5 rounded-[3px] bg-shade">
            <div
              className="h-1.5 rounded-[3px]"
              style={{
                width: `${((profile.alvo[g.id] / 80) * 100).toFixed(1)}%`,
                background: g.cor,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Subclasses do perfil agrupadas (abre e fecha). */
function SubclassList({ profile }: { profile: InvestorProfile }) {
  return (
    <details className="group border-t border-line pt-1.5">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 text-14 font-bold [&::-webkit-details-marker]:hidden">
        <span className="flex group-open:rotate-90">
          <Icon name="chevron-right" size={16} />
        </span>
        Ver as {profile.subclasses.length} subclasses
      </summary>
      <ul className="m-0 list-none p-0">
        {groups.map((g) => (
          <Fragment key={g.id}>
            <li className="pt-2 pb-1 text-12 font-bold tracking-[0.04em] text-caption uppercase">
              {g.nome}
            </li>
            {profile.subclasses
              .filter((s) => s.grupo === g.id)
              .map((s) => (
                <li
                  key={s.nome}
                  className="flex justify-between gap-2.5 border-b border-line py-[0.3125rem] text-13"
                >
                  <span className="min-w-0">{s.nome}</span>
                  <strong className="tabular-nums">{formatPercent(s.alvo)}</strong>
                </li>
              ))}
          </Fragment>
        ))}
      </ul>
    </details>
  );
}

/** Card de um perfil: para quem é, rosca e barras do alvo, quanto mudaria e as subclasses. */
export function ProfileCard({ profile }: { profile: InvestorProfile }) {
  const atual = profile.id === portfolioAllocation.perfil;
  const donut = (dims: (typeof donutSizes)[keyof typeof donutSizes], className: string) => (
    <div className={cn("justify-center", className)}>
      <GroupDonut
        values={profile.alvo}
        dims={dims}
        caption="Alvo"
        value={profile.nome}
        label={`Alvo do perfil ${profile.nome}: ${describe(profile)}`}
      />
    </div>
  );
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-card border border-line bg-card p-5",
        atual && "shadow-[inset_0_0_0_1px_#6B5A1E]",
      )}
    >
      <div className="flex items-center gap-2">
        <h2 className="m-0 grow font-display text-19 font-bold @desk:text-20">{profile.nome}</h2>
        {atual && (
          <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-tucano-bg px-2.5 text-12 font-bold whitespace-nowrap text-tucano">
            <Icon name="check" size={14} strokeWidth={2} />
            Seu perfil
          </span>
        )}
      </div>
      <p className="m-0 text-14 leading-[1.55] text-mist">{profile.paraQuem}</p>
      {donut(donutSizes.card, "flex @tab:hidden")}
      {donut(donutSizes.cardTablet, "hidden @tab:flex @desk:hidden")}
      {donut(donutSizes.result, "hidden @desk:flex")}
      <TargetBars profile={profile} />
      <div className="rounded-[0.875rem] bg-field px-3.5 py-3 text-13 leading-normal text-mist">
        Para ficar igual a este perfil,{" "}
        <strong className="text-sand">{profile.mudaria} da sua carteira</strong> mudaria de grupo.
      </div>
      <SubclassList profile={profile} />
    </section>
  );
}
