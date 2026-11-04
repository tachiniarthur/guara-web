import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { AgentTip } from "@/components/ui/agent-tip";
import { StateSwap } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { cn } from "@/lib/utils";

import { goalsSummary, type Goal, type GoalTone } from "../data";

const ringStroke: Record<GoalTone, string> = {
  folha: "stroke-folha",
  arara: "stroke-arara",
  tucano: "stroke-tucano",
};

/**
 * Anel de progresso da meta, com o percentual no meio. Enche ao aparecer (transição do
 * `stroke-dashoffset` a partir de vazio, só CSS).
 */
function ProgressRing({ percent, tone }: { percent: number; tone: GoalTone }) {
  const r = 26;
  const full = 2 * Math.PI * r;
  // Meta em 0% ainda mostra um tiquinho de cor (sem isso o anel parece quebrado).
  const offset = full * (1 - Math.max(percent, 1.5) / 100);
  return (
    <span className="relative flex size-18 shrink-0 items-center justify-center @tab:size-21">
      <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-shade" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={full}
          style={{ "--full": `${full}`, "--offset": `${offset}` } as CSSProperties}
          className={cn(
            "transition-[stroke-dashoffset] duration-(--duration-chart) ease-out-soft [stroke-dashoffset:var(--offset)] starting:[stroke-dashoffset:var(--full)]",
            ringStroke[tone],
          )}
        />
      </svg>
      <span className="font-display text-17 font-extrabold tabular-nums @tab:text-19">
        {`${Math.round(percent)}%`}
      </span>
    </span>
  );
}

/**
 * Meta em card largo: o anel com o quanto já tem, nome e onde está guardada, situação, valor
 * guardado e o ritmo (por mês e previsão).
 */
export function GoalCard({ goal }: { goal: Goal }) {
  const href = goal.detalhe ? `/metas/${goal.id}` : undefined;
  const content = (
    <>
      <ProgressRing percent={goal.percentual} tone={goal.status.tom} />
      <span className="flex min-w-0 grow flex-col gap-2.5">
        <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <span className="flex min-w-0 flex-col leading-[1.3]">
            <strong className="font-display text-18 @tab:text-20">{goal.nome}</strong>
            <span className="flex items-center gap-1.5 text-13 text-caption">
              <Icon name={goal.icone} size={14} className="shrink-0" />
              {goal.onde}
            </span>
          </span>
          <Tag tone={goal.status.tom} status>
            {goal.status.texto}
          </Tag>
        </span>
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-24 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums @tab:text-26">
            {goal.guardado}
          </span>
          <span className="text-14 text-mist">{`de ${goal.alvo}`}</span>
        </span>
        <span className="flex flex-wrap gap-2 text-13">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-shade px-2.5 py-1 text-soft">
            <Icon name="repeat" size={14} />
            {goal.mensal}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-shade px-2.5 py-1 text-soft">
            <Icon name="calendar" size={14} />
            {goal.previsao}
          </span>
        </span>
      </span>
      {href && (
        <Icon
          name="chevron-right"
          size={20}
          className="hidden self-center text-caption @tab:block"
        />
      )}
    </>
  );
  const className =
    "flex items-start gap-4 rounded-card border border-line bg-card p-4.5 text-sand no-underline @tab:items-center @tab:gap-5 @tab:p-5.5";
  return href ? (
    <Link
      href={href}
      aria-label={`${goal.nome}: ${goal.percentual}% da meta`}
      className={cn(className, "hover:border-line-strong")}
    >
      {content}
    </Link>
  ) : (
    <section aria-label={goal.nome} className={className}>
      {content}
    </section>
  );
}

/** Resumo das metas sobre a mata: quanto já tem, o planejado por mês e o que sobrou no mês. */
export function GoalsHero({ replacement }: { replacement?: ReactNode }) {
  return (
    <MataCard className="gap-4">
      <StateSwap replacement={replacement} className="grow gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-14 text-[#C5D8CB]">Guardado nas metas</span>
          <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
            {goalsSummary.guardado}
          </span>
        </div>
        <dl className="m-0 grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-0.5 rounded-tile bg-canvas/55 px-3.5 py-3">
            <dt className="text-12 text-[#C5D8CB]">Planejado por mês</dt>
            <dd className="m-0 text-16 font-bold tabular-nums">{goalsSummary.mensal}</dd>
            <dd className="m-0 text-12 text-[#C5D8CB]">{goalsSummary.mensalNota}</dd>
          </div>
          <div className="flex flex-col gap-0.5 rounded-tile bg-canvas/55 px-3.5 py-3">
            <dt className="text-12 text-[#C5D8CB]">Sobrou no mês</dt>
            <dd className="m-0 text-16 font-bold tabular-nums">{goalsSummary.sobrou}</dd>
            <dd className="m-0 text-12 text-[#C5D8CB]">{goalsSummary.sobrouQuando}</dd>
          </div>
        </dl>
        <span className="flex items-center gap-2 text-14 text-[#E4EEE6]">
          <Icon name="calendar" size={16} />
          <span>
            Próximo depósito: <strong className="text-white">{goalsSummary.proximo}</strong>
          </span>
        </span>
      </StateSwap>
    </MataCard>
  );
}

export function OncaTip({ children, action }: { children: string; action: ReactNode }) {
  return (
    <AgentTip agent="onca" named action={action}>
      {children}
    </AgentTip>
  );
}

/** Botão "Nova meta" com a faixa do tucano. */
export function NewGoalButton({ block }: { block?: boolean }) {
  return (
    <ButtonLink
      href="/metas/nova"
      variant="forest"
      size={block ? "lg" : "md"}
      block={block}
      className="text-15"
    >
      <Icon name="plus" size={18} />
      <span>Nova meta</span>
    </ButtonLink>
  );
}

export const chatWithOnca = (
  <ButtonLink href="/conversas" variant="secondary" size="sm">
    <Icon name="chat" size={18} />
    <span>Conversar com a Onça</span>
  </ButtonLink>
);
