import Link from "next/link";
import type { ReactNode } from "react";

import { AgentTip } from "@/components/ui/agent-tip";
import { StateSwap } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { cn } from "@/lib/utils";

import { goalsSummary, type Goal, type GoalTone } from "../data";

const barColor: Record<GoalTone, string> = {
  folha: "bg-folha",
  arara: "bg-arara",
  tucano: "bg-tucano",
};

/** Meta em card: ícone, onde está guardada, situação, quanto já tem e o ritmo. */
export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Link
      href={goal.detalhe ? `/metas/${goal.id}` : "/metas"}
      className="flex flex-col gap-3 rounded-[1.375rem] border border-line bg-card p-4.5 text-sand no-underline hover:border-line-strong"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            goal.iconeTom === "arara" ? "bg-arara-bg text-arara" : "bg-shade text-mist",
          )}
        >
          <Icon name={goal.icone} size={20} />
        </span>
        <span className="flex min-w-0 grow flex-col leading-[1.3]">
          <strong className="text-16">{goal.nome}</strong>
          <span className="text-13 text-caption">{goal.onde}</span>
        </span>
        <Tag tone={goal.status.tom} status>
          {goal.status.texto}
        </Tag>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-24 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {goal.guardado}
        </span>
        <span className="text-14 text-mist">
          {`de ${goal.alvo} · `}
          <strong className="text-sand">{`${goal.percentual}%`}</strong>
        </span>
      </div>
      <div aria-hidden="true" className="relative h-2.5 rounded-[5px] bg-shade">
        <div
          className={cn("h-2.5 rounded-[5px]", barColor[goal.status.tom])}
          style={{ width: `${Math.max(goal.percentual, 1)}%` }}
        />
      </div>
      <div className="flex justify-between text-13 text-mist">
        <span>{goal.mensal}</span>
        <span>{goal.previsao}</span>
      </div>
    </Link>
  );
}

/** Quanto está guardado nas metas e os depósitos planejados. */
/** Total guardado nas metas; `replacement` troca o conteúdo (erro) mantendo a mata ao fundo. */
export function GoalsHero({ replacement }: { replacement?: ReactNode }) {
  return (
    <MataCard className="gap-1.5">
      <StateSwap replacement={replacement} className="grow gap-1.5">
        <span className="text-14 text-[#C5D8CB]">Guardado nas metas</span>
        <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {goalsSummary.guardado}
        </span>
        <span className="text-14 text-[#E4EEE6]">
          Depósitos planejados: <strong className="text-white">{goalsSummary.mensal}</strong>
          {` ${goalsSummary.sobrou}`}
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
