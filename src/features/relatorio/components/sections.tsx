import Link from "next/link";
import { ChartFit } from "@/components/charts/chart-fit";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { OFFLINE_NOTE, type ScreenState } from "@/components/states/screen-state";
import {
  ErrorBlock,
  ErrorBlocks,
  FilterEmptyBlock,
  NoDataBlock,
  StateBlock,
  StateSwap,
} from "@/components/states/state-block";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { prototypeReport } from "../data";
import type { ReportStat, ReportView, TextPart, TimelineEntry } from "../view";
import { BalanceChart, FlowChart, type ReportChartVariant } from "./charts";
import { barWidth } from "@/lib/bar-width";

const toneText = {
  arara: "text-arara",
  sand: "text-sand",
  folha: "text-folha",
  urucum: "text-urucum",
  tucano: "text-tucano",
  caption: "text-caption",
} as const;

type StateProps = { state?: ScreenState | null; view?: ReportView };

/** Texto montado, com os trechos fortes em negrito. */
function Parts({ parts }: { parts: TextPart[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.forte ? (
          <strong key={i} className="text-sand">
            {part.texto}
          </strong>
        ) : (
          <span key={i}>{part.texto}</span>
        ),
      )}
    </>
  );
}

function Stats({ stats }: { stats: ReportStat[] }) {
  return (
    <>
      {stats.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </>
  );
}

const offline = (state: ScreenState | null | undefined, text: ReactNode) =>
  state === "sem-internet" ? <span className="text-tucano">{OFFLINE_NOTE}</span> : text;

/** Erro grande no erro; "—" no vazio (o card principal do vazio recebe `main`). */
const cardState = (state: ScreenState | null | undefined, main?: ReactNode) =>
  state === "erro" ? <ErrorBlock /> : state === "vazio" ? (main ?? <NoDataBlock />) : null;

/** Entrou, saiu e sobrou, com a divisão do que saiu por categoria. */
export function TotalsCard({ state, view = prototypeReport }: StateProps) {
  const { totals, breakdown: outflowBreakdown } = view;
  return (
    <Panel className="gap-4">
      <StateSwap
        replacement={
          state === "erro" ? (
            <ErrorBlocks mobile="big" tablet="compact" desktop="big" />
          ) : (
            state === "vazio" && (
              <>
                <NoDataBlock className="@tab:hidden @desk:flex" />
                <NoDataBlock compact className="hidden @tab:flex @desk:hidden" />
              </>
            )
          )
        }
        className="grow gap-4"
      >
        <div className="grid grid-cols-2 items-start gap-4 @tab:grid-cols-3 @tab:items-stretch @desk:items-start">
          {totals.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
              <span className="text-13 text-mist">{item.label}</span>
              <span
                className={cn(
                  "font-display text-22 leading-[1.15] font-extrabold tracking-[-0.01em] whitespace-nowrap tabular-nums @tab:text-28 @desk:text-30",
                  toneText[item.tone],
                )}
              >
                {item.value}
              </span>
              {item.note && (
                <span className="text-13 text-caption @tab:hidden @desk:inline">{item.note}</span>
              )}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex h-3.5 origin-left animate-grow-x gap-[3px] overflow-hidden rounded-[0.4375rem]"
        >
          {outflowBreakdown.map((item) => (
            <div key={item.label} style={{ flexGrow: item.value, background: item.color }} />
          ))}
        </div>
        <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0 @tab:grid-cols-3">
          {outflowBreakdown.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-13">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{ background: item.color }}
              />
              <span className="grow text-mist">{item.label}</span>
              <strong className="tabular-nums">{item.percent}</strong>
            </li>
          ))}
        </ul>
      </StateSwap>
    </Panel>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof toneText;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-13 text-caption">{label}</span>
      <strong className={cn("text-18 whitespace-nowrap tabular-nums", toneText[tone])}>
        {value}
      </strong>
    </div>
  );
}

function ChartBlock({
  title,
  subtitle,
  stats,
  chart,
  legend,
  footer,
}: {
  title: string;
  subtitle: ReactNode;
  stats: ReactNode;
  chart: (variant: ReportChartVariant) => ReactNode;
  legend: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3.5 rounded-[1.125rem] bg-field p-[1.125rem]">
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0 text-16 font-bold">{title}</h3>
        <p className="m-0 text-13 text-caption">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-7">{stats}</div>
      <ChartFit narrow={chart("mobile")} medium={chart("tablet")} wide={chart("desktop")} />
      <div className="flex flex-wrap gap-x-4.5 gap-y-2 text-13 text-mist">{legend}</div>
      <p className="m-0 text-13 leading-normal text-mist">{footer}</p>
    </div>
  );
}

function LegendItem({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  );
}

const noMovements = (
  <StateBlock
    icon="file-doc"
    title="Sem movimentos no período"
    action={
      <Button size="md">
        <span>Mudar período</span>
      </Button>
    }
  >
    Não há entradas nem saídas nesse período nos bancos conectados. Escolha outro período.
  </StateBlock>
);

/** Saldo ponto a ponto e entradas e saídas por grupo (dia, semana ou mês). */
export function BalanceCard({ state, view = prototypeReport }: StateProps) {
  const { balance, flow, period } = view;
  return (
    <Panel className="gap-4 p-4 @tab:p-5 @desk:p-6">
      <PanelHeader
        title="Como o saldo andou"
        subtitle={offline(state, `${period.range} · ${period.scope}`)}
      />
      <StateSwap replacement={cardState(state, noMovements)} className="grow">
        <div className="grid grid-cols-1 items-stretch gap-4 @desk:grid-cols-2">
          <ChartBlock
            title={balance.title}
            subtitle={balance.subtitle}
            stats={<Stats stats={balance.stats} />}
            chart={(variant) => <BalanceChart variant={variant} series={balance.series} />}
            legend={
              <>
                <LegendItem
                  swatch={
                    <span aria-hidden="true" className="h-[3px] w-4.5 rounded-[2px] bg-arara" />
                  }
                >
                  Saldo
                </LegendItem>
                {balance.projectionLegend && (
                  <LegendItem
                    swatch={
                      <span
                        aria-hidden="true"
                        className="w-4.5 border-t-2 border-dashed border-arara"
                      />
                    }
                  >
                    {balance.projectionLegend}
                  </LegendItem>
                )}
                {balance.series.events.some((event) => event.tone === "arara") && (
                  <LegendItem
                    swatch={
                      <span
                        aria-hidden="true"
                        className="size-3.5 rounded-full border-2 border-arara"
                      />
                    }
                  >
                    Maiores entradas
                  </LegendItem>
                )}
                {balance.series.events.some((event) => event.tone === "urucum") && (
                  <LegendItem
                    swatch={
                      <span
                        aria-hidden="true"
                        className="size-3.5 rounded-full border-2 border-urucum"
                      />
                    }
                  >
                    Maior saída
                  </LegendItem>
                )}
              </>
            }
            footer={<Parts parts={balance.footer} />}
          />
          <ChartBlock
            title={flow.title}
            subtitle={
              <>
                <span className="@tab:hidden">{flow.subtitle.short}</span>
                <span className="hidden @tab:inline">{flow.subtitle.long}</span>
              </>
            }
            stats={<Stats stats={flow.stats} />}
            chart={(variant) => <FlowChart variant={variant} series={flow.series} />}
            legend={
              <>
                <LegendItem
                  swatch={<span aria-hidden="true" className="size-3 rounded-[3px] bg-arara" />}
                >
                  Entradas
                </LegendItem>
                <LegendItem
                  swatch={<span aria-hidden="true" className="size-3 rounded-[3px] bg-urucum" />}
                >
                  Saídas
                </LegendItem>
                {flow.partialNote && <span className="text-caption">{flow.partialNote}</span>}
              </>
            }
            footer={<Parts parts={flow.footer} />}
          />
        </div>
      </StateSwap>
    </Panel>
  );
}

const dotTone: Record<TimelineEntry["tone"], string> = {
  urucum: "border-urucum",
  arara: "border-arara",
  neutral: "border-line-strong",
};

const amountTone: Record<TimelineEntry["tone"], string> = {
  urucum: "text-urucum",
  arara: "text-arara",
  neutral: "text-sand",
};

function OutlierTag({ className }: { className?: string }) {
  return (
    <Tag tone="urucum" className={className}>
      <Icon name="eye" size={14} strokeWidth={2} />
      Fora do padrão
    </Tag>
  );
}

/** Os movimentos que mais mexeram no saldo, em ordem do mais recente. */
export function TimelineCard({ state, view = prototypeReport }: StateProps) {
  const { entries: timeline, more } = view.timeline;
  const replacement =
    state === "vazio-filtro" ? (
      <FilterEmptyBlock>Nenhum movimento do Itaú na categoria Lazer em setembro.</FilterEmptyBlock>
    ) : (
      cardState(state)
    );
  return (
    <Panel className="gap-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
              Linha do tempo
            </h2>
            <p className="m-0 text-13 text-caption">
              {offline(
                state,
                <>
                  Os movimentos que mais mexeram no{" "}
                  <span className="hidden @tab:inline @desk:hidden">seu </span>saldo
                </>,
              )}
            </p>
          </div>
        </div>
        {!replacement && (
          <Link href="/relatorio/linha-do-tempo" className={panelLinkClass}>
            <span className="@tab:hidden @desk:inline">Todos</span>
            <span className="hidden @tab:inline @desk:hidden">{more}</span>
            <Icon name="chevron-right" size={16} />
          </Link>
        )}
      </div>
      <StateSwap replacement={replacement} className="grow">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute top-4 bottom-4 left-[4.1875rem] w-0.5 bg-line @tab:left-[4.8125rem] @desk:left-[4.6875rem]"
          />
          <ol className="relative m-0 list-none p-0">
            {timeline.map((entry) => (
              <li
                key={`${entry.date}-${entry.title}`}
                className="grid grid-cols-[3rem_1.25rem_minmax(0,1fr)_auto] items-start gap-2.5 py-2.5 @tab:grid-cols-[3.5rem_1.25rem_minmax(0,1fr)_auto] @tab:gap-3 @desk:gap-2.5"
              >
                <span className="pt-0.5 text-13 text-caption tabular-nums">{entry.date}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-1 my-[0.3125rem] size-3 rounded-full border-2 bg-card",
                    dotTone[entry.tone],
                  )}
                />
                <span className="flex min-w-0 flex-col leading-[1.35]">
                  <span className="flex items-center font-bold">
                    {entry.title}
                    {entry.outlier && (
                      <OutlierTag className="ml-2 hidden @tab:inline-flex @desk:hidden" />
                    )}
                  </span>
                  <span className="text-13 text-caption">{entry.detail}</span>
                  {entry.outlier && (
                    <span className="mt-1 flex @tab:hidden @desk:flex">
                      <OutlierTag />
                    </span>
                  )}
                </span>
                <span
                  className={cn("font-bold whitespace-nowrap tabular-nums", amountTone[entry.tone])}
                >
                  {entry.amount}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </StateSwap>
    </Panel>
  );
}

/** Variação por categoria e o acumulado até hoje contra o mesmo dia do mês passado. */
export function ComparisonCard({ state, view = prototypeReport }: StateProps) {
  const { title, categories: categoryComparison, until, groups, footer } = view.comparison;
  return (
    <Panel className="gap-1.5">
      <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
        {title}
      </h2>
      <StateSwap replacement={cardState(state)} className="grow gap-1.5">
        <ul className="m-0 list-none p-0">
          {categoryComparison.map((item) => (
            <li
              key={item.label}
              className="flex min-h-[3.3125rem] items-center gap-3 border-b border-line"
            >
              <span className="flex grow flex-col leading-[1.35]">
                <strong>{item.label}</strong>
                <span className="text-13 text-caption">{item.detail}</span>
              </span>
              <span className={cn("flex items-center gap-1 font-bold", toneText[item.tone])}>
                <Icon name={item.icon} size={16} strokeWidth={2} />
                {item.change}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3.5 rounded-tile bg-field p-4">
          <span className="text-13 text-caption">{until}</span>
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-3 text-14">
                <strong>{group.label}</strong>
                <span className={cn("font-bold", toneText[group.tone])}>{group.change}</span>
              </div>
              <div className="grid grid-cols-[4rem_minmax(0,1fr)_6rem] items-center gap-2.5 text-13 text-mist">
                {[
                  { ...group.current, color: group.color, strong: "text-sand" },
                  { ...group.previous, color: "var(--guara-caption)", strong: "text-mist" },
                ].map((row) => (
                  <MonthBar key={row.month} {...row} />
                ))}
              </div>
            </div>
          ))}
          <p className="m-0 text-13 leading-normal text-mist">
            <Parts parts={footer} />
          </p>
        </div>
      </StateSwap>
    </Panel>
  );
}

function MonthBar({
  month,
  value,
  width,
  color,
  strong,
}: {
  month: string;
  value: string;
  width: number;
  color: string;
  strong: string;
}) {
  return (
    <>
      <span>{month}</span>
      <span className="h-2.5 overflow-hidden rounded-[0.3125rem] bg-line">
        <span
          className="block h-full origin-left animate-grow-x rounded-[0.3125rem]"
          style={{ width: barWidth(width), background: color }}
        />
      </span>
      <strong className={cn("text-right tabular-nums", strong)}>{value}</strong>
    </>
  );
}
