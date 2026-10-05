import { Icon } from "@/components/ui/icon";
import { iconButtonVariants } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TextLink } from "@/components/ui/text-link";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import type { AgentCardData, AgentHighlight } from "../cards";
import { agents } from "../data";

function Highlight({ highlight }: { highlight: AgentHighlight }) {
  switch (highlight.kind) {
    case "dot":
    case "alert":
      return (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-2.5 py-2 text-13",
            highlight.kind === "alert" ? "bg-urucum-bg" : "bg-shade",
          )}
        >
          {highlight.kind === "dot" && (
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                highlight.tone === "urucum" ? "bg-urucum" : "bg-folha",
              )}
            />
          )}
          <span>
            <strong>{highlight.strong}</strong> {highlight.text}
          </span>
        </div>
      );
    case "progress":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-13 text-mist">
            <strong className="text-sand">{highlight.strong}</strong> {highlight.text}
          </span>
          <ProgressBar value={highlight.value} tone="tucano" height={8} label={highlight.label} />
        </div>
      );
    case "allocation":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="text-13 text-mist">
            <strong className="text-folha">{highlight.strong}</strong> {highlight.text}
          </span>
          <div
            role="img"
            aria-label={highlight.label}
            className="flex h-2 gap-0.5 overflow-hidden rounded"
          >
            {highlight.parts.map((part, i) => (
              <div key={i} style={{ flexGrow: part.value, background: part.color }} />
            ))}
          </div>
        </div>
      );
  }
}

type AgentCardProps = {
  data: AgentCardData;
  /** Altura da cena do bioma no topo (classes; padrão 160px no mobile e 184px a partir do tablet). */
  imageClassName?: string;
  /** Classes do botão de conversar (ex.: 46px quando a borda soma à altura, como em Assistentes). */
  actionClassName?: string;
  className?: string;
};

/** Card de um bicho da turma: cena do bioma, número principal, destaque, fala e atalhos. */
export function AgentCard({
  data,
  imageClassName = "h-40 @tab:h-46",
  actionClassName,
  className,
}: AgentCardProps) {
  const agent = agents[data.agent];

  return (
    <section
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.75rem] border bg-card text-sand",
        data.statusAlert ? "border-urucum" : "border-line",
        className,
      )}
    >
      <div
        role="img"
        aria-label={`Imagem do agente ${agent.nome}`}
        className={cn("relative shrink-0 overflow-hidden rounded-t-[1.375rem]", imageClassName)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustração do bioma */}
        <img src={agent.cena} alt="" className="absolute inset-0 block size-full object-cover" />
        <span className="absolute top-3.5 right-3.5 rounded-full bg-black/45 px-2.5 py-1 text-12 font-bold text-sand">
          {agent.bioma}
        </span>
        <span className="absolute top-3.5 left-3.5">
          <span
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-12 font-bold whitespace-nowrap",
              data.statusAlert ? "bg-urucum text-canvas" : "bg-black/55 text-[#F4F1EA]",
            )}
          >
            {data.status}
          </span>
        </span>
      </div>
      <div className="flex min-h-0 grow flex-col gap-2.5 px-5 pt-4 pb-4.5">
        <div className="flex items-baseline justify-between gap-2 @tab:flex-wrap @tab:gap-x-2 @tab:gap-y-0.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <strong className="font-display text-24 leading-[1.1] font-extrabold">
              {agent.nome}
            </strong>
            <span className="font-display text-13 leading-[1.2] font-bold text-caption italic">
              {agent.cientifico}
            </span>
          </div>
          <span className="text-13 font-bold text-mist">{agent.area}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "font-display text-28 leading-[1.1] font-extrabold tabular-nums",
              data.metricAlert ? "text-urucum" : "text-sand",
            )}
          >
            {data.metric}
          </span>
          <span className="text-13 text-caption">{data.metricCaption}</span>
        </div>
        <Highlight highlight={data.highlight} />
        <p className="m-0 text-14 leading-[1.4] text-mist italic">&quot;{data.quote}&quot;</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <TextLink href={data.link.href} className={data.link.alert ? "text-urucum" : undefined}>
            {data.link.label}
          </TextLink>
          <OpenChat
            agent={data.agent}
            aria-label={`Conversar com ${agent.nome}`}
            className={cn(iconButtonVariants({ variant: "outline", size: "md" }), actionClassName)}
          >
            <Icon name="chat" />
          </OpenChat>
        </div>
      </div>
    </section>
  );
}
