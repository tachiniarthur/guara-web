import type { ComponentProps } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button, ButtonLink, buttonVariants } from "@/components/ui/button";
import { Field, FieldHint, FieldLabel, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ToggleChips } from "@/components/ui/toggle-chips";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import type { DetailSection, PremiseField, Simulation, Tip, Tone } from "../data";
import { ProjectionChart, type ChartVariant } from "./projection-chart";

const toneClass: Record<Tone, string> = {
  sand: "text-sand",
  folha: "text-folha",
  urucum: "text-urucum",
  arara: "text-arara",
  tucano: "text-tucano",
  caption: "text-caption",
};

/** Card das telas do Simulador: raio 24, respiro de 20px e 16px entre blocos. */
function SimPanel({ className, ...props }: ComponentProps<"section">) {
  return <Panel className={cn("gap-4", className)} {...props} />;
}

function SimHeader({
  title,
  subtitle,
  large,
}: {
  title: string;
  subtitle: string;
  large?: boolean;
}) {
  return (
    <PanelHeader title={title} subtitle={subtitle} titleClassName={large ? "text-20" : "text-18"} />
  );
}

export function TipBlock({ tip }: { tip: Tip }) {
  return (
    <div className="flex gap-2.5 rounded-tile bg-field px-4 py-3.5 text-14 leading-[1.55]">
      <span className="mt-0.5" style={{ color: tip.color }}>
        <Icon name={tip.icon} size={18} />
      </span>
      <span>{tip.content}</span>
    </div>
  );
}

function PremiseControl({ field }: { field: PremiseField }) {
  switch (field.kind) {
    case "slider":
      return (
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex justify-between gap-2 text-14">
            <label htmlFor={field.id} className="font-bold">
              {field.label}
            </label>
            <span className="font-bold tabular-nums">{field.value}</span>
          </div>
          <input
            id={field.id}
            type="range"
            min={0}
            max={100}
            defaultValue={field.position}
            className="m-0 h-7 w-full accent-arara"
          />
          <span className="text-12 text-caption">{field.hint}</span>
        </div>
      );
    case "text":
      return (
        <Field>
          <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
          <TextInput id={field.id} defaultValue={field.value} />
          {field.hint && <FieldHint>{field.hint}</FieldHint>}
        </Field>
      );
    case "chips":
      return (
        <div className="flex flex-col gap-2">
          <span className="text-14 font-bold">{field.label}</span>
          <ToggleChips
            label={field.label}
            options={field.options}
            defaultPressed={field.pressed}
            multiple={field.multiple}
          />
        </div>
      );
    case "note":
      return <p className="m-0 text-12 text-caption">{field.text}</p>;
    case "tip":
      return <TipBlock tip={field.tip} />;
  }
}

/** Premissas da simulação: controles e o resumo no rodapé. */
export function PremisesCard({
  premises,
  className,
}: {
  premises: Simulation["premises"];
  className?: string;
}) {
  return (
    <SimPanel className={className}>
      <SimHeader title="Premissas" subtitle="Mexa e o resultado muda na hora" />
      {premises.fields.map((field, i) => (
        <PremiseControl key={i} field={field} />
      ))}
      <div className="mt-auto flex flex-col gap-2 rounded-tile bg-field px-4 py-3.5">
        <span className="text-12 font-bold tracking-[0.06em] text-caption uppercase">Resumo</span>
        {premises.summary.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-14">
            <span className="text-mist">{label}</span>
            <strong className="text-right">{value}</strong>
          </div>
        ))}
      </div>
    </SimPanel>
  );
}

const chartVariants: { variant: ChartVariant; className: string }[] = [
  { variant: "mobile", className: "@tab:hidden" },
  { variant: "tablet", className: "hidden @tab:block @desk:hidden" },
  { variant: "desktop", className: "hidden @desk:block" },
];

/** Resultado: valor principal, gráfico da projeção, cenários e ações. */
export function ResultCard({
  result,
  agent,
  className,
}: {
  result: Simulation["result"];
  agent: Simulation["agent"];
  className?: string;
}) {
  return (
    <SimPanel className={className}>
      <SimHeader title={result.title} subtitle={result.subtitle} large />
      <div className="flex flex-col gap-1">
        <span className="text-14 text-mist">{result.metricLabel}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="font-display text-38 leading-[1.05] font-extrabold tracking-[-0.02em] tabular-nums @tab:text-44">
            {result.metric}
          </span>
          <span className="text-15 text-mist">/mês</span>
        </span>
        <span className="text-14 text-mist">{result.detail}</span>
      </div>
      {chartVariants.map(({ variant, className: visibility }) => (
        <div key={variant} className={visibility}>
          <ProjectionChart variant={variant} {...result.chart} />
        </div>
      ))}
      <div className="flex flex-wrap gap-x-4.5 gap-y-2 text-13 text-mist">
        {result.legend.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "w-4.5",
                item.swatch === "line" ? "h-[3px] rounded-[2px]" : "border-t-2 border-dashed",
              )}
              style={
                item.swatch === "line" ? { background: item.color } : { borderColor: item.color }
              }
            />
            {item.label}
          </span>
        ))}
      </div>
      <div role="group" aria-label="Cenários" className="grid grid-cols-3 gap-2">
        {result.scenarios.map((scenario) => (
          <div
            key={scenario.name}
            className={cn(
              "flex min-w-0 flex-col gap-0.5 rounded-tile px-3.5 py-3",
              scenario.current ? "border-2 border-sand" : "border border-line",
            )}
          >
            <span className="text-13 font-bold">{scenario.name}</span>
            <span className="text-12 text-caption">{scenario.detail}</span>
            <span className="font-display text-18 font-bold tabular-nums">{scenario.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {result.primary.href ? (
          <ButtonLink href={result.primary.href} variant="light">
            <Icon name="flag" size={18} />
            <span>{result.primary.label}</span>
          </ButtonLink>
        ) : (
          <Button variant="light">
            <Icon name="flag" size={18} />
            <span>{result.primary.label}</span>
          </Button>
        )}
        <Button variant="secondary">
          <span>Salvar</span>
        </Button>
        <OpenChat
          agent={agent.id}
          className={cn(buttonVariants({ variant: "ghost", size: "md" }), "hover:bg-transparent")}
        >
          <Icon name="chat" size={18} />
          <span>Conversar com {agent.name}</span>
        </OpenChat>
      </div>
      <p className="m-0 text-12 text-caption">{result.disclaimer}</p>
    </SimPanel>
  );
}

function Timeline({ section }: { section: Extract<DetailSection, { kind: "timeline" }> }) {
  const last = section.items.length - 1;
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {section.items.map((item, i) => (
        <li
          key={item.when}
          className={cn(
            "grid items-start gap-2.5",
            section.labelWidth === "wide"
              ? "grid-cols-[5.25rem_1.25rem_minmax(0,1fr)]"
              : "grid-cols-[4rem_1.25rem_minmax(0,1fr)]",
          )}
        >
          <span className="pt-px text-13 font-bold text-mist tabular-nums">{item.when}</span>
          <span className="relative flex h-full min-h-11 justify-center">
            <span
              className={cn(
                "relative z-1 mt-1 size-3 rounded-full border-2",
                section.color === "folha" ? "border-folha" : "border-arara",
                item.done ? (section.color === "folha" ? "bg-folha" : "bg-arara") : "bg-card",
              )}
            />
            {i < last && (
              <span aria-hidden="true" className="absolute top-4 -bottom-1.5 w-0.5 bg-line" />
            )}
          </span>
          <span className="flex flex-col pb-2.5 leading-[1.35]">
            <strong className="text-15 tabular-nums">{item.title}</strong>
            <span className="text-12 text-caption">{item.note}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Composition({ section }: { section: Extract<DetailSection, { kind: "composition" }> }) {
  return (
    <>
      <div
        role="img"
        aria-label="Composição"
        className="flex h-4 gap-0.5 overflow-hidden rounded-full"
      >
        {section.slices.map((slice) => (
          <span key={slice.label} style={{ width: `${slice.width}%`, background: slice.color }} />
        ))}
      </div>
      <div>
        {section.slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between gap-2.5 py-2">
            <span className="flex items-center gap-2 text-14">
              <span
                aria-hidden="true"
                className="size-3 rounded-[3px]"
                style={{ background: slice.color }}
              />
              {slice.label}
            </span>
            <span className="text-14 font-bold tabular-nums">
              {slice.amount} <span className="font-normal text-caption">· {slice.percent}</span>
            </span>
          </div>
        ))}
      </div>
      <TipBlock tip={section.tip} />
    </>
  );
}

function Rows({ section }: { section: Extract<DetailSection, { kind: "rows" }> }) {
  return (
    <>
      <div>
        {section.rows.map((row) => (
          <div
            key={row.title}
            className="flex items-center justify-between gap-3 border-b border-line py-[0.6875rem] last:border-b-0"
          >
            <span className="flex min-w-0 flex-col leading-[1.35]">
              <span className="text-14 font-semibold">{row.title}</span>
              {row.detail && <span className="text-12 text-caption">{row.detail}</span>}
            </span>
            <strong
              className={cn(
                "text-right text-15 whitespace-nowrap tabular-nums",
                toneClass[row.tone],
              )}
            >
              {row.value}
            </strong>
          </div>
        ))}
      </div>
      {section.tip && <TipBlock tip={section.tip} />}
      {section.action && (
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={section.action.href} variant="secondary">
            <Icon name={section.action.icon} size={18} />
            <span>{section.action.label}</span>
          </ButtonLink>
        </div>
      )}
    </>
  );
}

/** Card de detalhe: linha do tempo, composição ou lista de valores. */
export function DetailCard({ section, className }: { section: DetailSection; className?: string }) {
  return (
    <SimPanel className={className}>
      <SimHeader title={section.title} subtitle={section.subtitle} />
      {section.kind === "timeline" && <Timeline section={section} />}
      {section.kind === "composition" && <Composition section={section} />}
      {section.kind === "rows" && <Rows section={section} />}
    </SimPanel>
  );
}

/** Perguntas prontas para o bicho responsável pela simulação. */
export function AskAgentCard({
  agent,
  className,
}: {
  agent: Simulation["agent"];
  className?: string;
}) {
  return (
    <SimPanel className={className}>
      <div className="flex items-center gap-2.5">
        <AgentAvatar agent={agent.id} size={28} variant="ring" />
        <h2 className="m-0 text-16 font-bold">Pergunte ao {agent.name}</h2>
        <span className="text-13 text-caption">sobre esta simulação</span>
      </div>
      <div>
        {agent.questions.map((question) => (
          <OpenChat
            key={question}
            agent={agent.id}
            question={question}
            className="flex w-full items-center justify-between gap-3 border-0 border-b border-line bg-transparent px-0 py-3 text-left text-15 font-semibold text-sand hover:text-tucano"
          >
            {question}
            <span className="text-caption">
              <Icon name="arrow-up-right" size={16} />
            </span>
          </OpenChat>
        ))}
      </div>
      <div className="mt-auto flex min-h-[3.625rem] items-center gap-2 rounded-full border border-line-strong bg-field p-1 pl-4">
        <span className="grow text-15 text-caption">Pergunte o que quiser…</span>
        <OpenChat
          agent={agent.id}
          aria-label="Enviar pergunta"
          className="flex size-10 items-center justify-center rounded-full border-none bg-tucano text-canvas"
        >
          <Icon name="arrow-up" size={18} />
        </OpenChat>
      </div>
    </SimPanel>
  );
}
