import Link from "next/link";
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

import {
  categoryComparison,
  monthComparison,
  outflowBreakdown,
  reportPeriod,
  timeline,
  totals,
  type TimelineEntry,
} from "../data";
import { BalanceChart, WeeklyFlowChart, type ReportChartVariant } from "./charts";

const toneText = {
  arara: "text-arara",
  sand: "text-sand",
  folha: "text-folha",
  urucum: "text-urucum",
  tucano: "text-tucano",
  caption: "text-caption",
} as const;

type StateProps = { state?: ScreenState | null };

const offline = (state: ScreenState | null | undefined, text: ReactNode) =>
  state === "sem-internet" ? <span className="text-tucano">{OFFLINE_NOTE}</span> : text;

/** Erro grande no erro; "—" no vazio (o card principal do vazio recebe `main`). */
const cardState = (state: ScreenState | null | undefined, main?: ReactNode) =>
  state === "erro" ? <ErrorBlock /> : state === "vazio" ? (main ?? <NoDataBlock />) : null;

/** Entrou, saiu e sobrou, com a divisão do que saiu por categoria. */
export function TotalsCard({ state }: StateProps) {
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
              {"note" in item && (
                <span className="text-13 text-caption @tab:hidden @desk:inline">{item.note}</span>
              )}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex h-3.5 gap-[3px] overflow-hidden rounded-[0.4375rem]"
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

const chartVariants: { variant: ReportChartVariant; className: string }[] = [
  { variant: "mobile", className: "@tab:hidden" },
  { variant: "tablet", className: "hidden @tab:block @desk:hidden" },
  { variant: "desktop", className: "hidden @desk:block" },
];

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
      {chartVariants.map(({ variant, className }) => (
        <div key={variant} className={className}>
          {chart(variant)}
        </div>
      ))}
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

/** Saldo dia a dia e entradas e saídas por semana. */
export function BalanceCard({ state }: StateProps) {
  return (
    <Panel className="gap-4 p-4 @tab:p-5 @desk:p-6">
      <PanelHeader
        title="Como o saldo andou"
        subtitle={offline(state, `${reportPeriod.range} · ${reportPeriod.scope}`)}
      />
      <StateSwap replacement={cardState(state, noMovements)} className="grow">
        <div className="grid grid-cols-1 items-stretch gap-4 @desk:grid-cols-2">
          <ChartBlock
            title="Saldo dia a dia"
            subtitle="Sobe com o que entra e desce com o que sai"
            stats={
              <>
                <Stat label="Começou o mês" value="R$ 10.192,79" tone="sand" />
                <Stat label="Hoje" value="R$ 12.480,32" tone="sand" />
                <Stat label="Previsão dia 30" value="≈ R$ 11.900" tone="arara" />
              </>
            }
            chart={(variant) => <BalanceChart variant={variant} />}
            legend={
              <>
                <LegendItem
                  swatch={
                    <span aria-hidden="true" className="h-[3px] w-4.5 rounded-[2px] bg-arara" />
                  }
                >
                  Saldo
                </LegendItem>
                <LegendItem
                  swatch={
                    <span
                      aria-hidden="true"
                      className="w-4.5 border-t-2 border-dashed border-arara"
                    />
                  }
                >
                  Projeção até o dia 30
                </LegendItem>
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
              </>
            }
            footer={
              <>
                O saldo deve fechar <strong className="text-sand">R$ 1.707 acima</strong> do começo
                do mês.
              </>
            }
          />
          <ChartBlock
            title="Entradas e saídas por semana"
            subtitle={
              <>
                <span className="@tab:hidden">Em R$ mil, por semana de setembro</span>
                <span className="hidden @tab:inline">
                  Quanto entrou e saiu em cada semana de setembro
                </span>
              </>
            }
            stats={
              <>
                <Stat label="Entrou" value="R$ 8.200,00" tone="arara" />
                <Stat label="Saiu" value="R$ 5.912,47" tone="urucum" />
                <Stat label="Semana mais cara" value="22 a 23 set" tone="sand" />
              </>
            }
            chart={(variant) => <WeeklyFlowChart variant={variant} />}
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
                <span className="text-caption">*semana em andamento</span>
              </>
            }
            footer={
              <>
                A última semana já soma <strong className="text-sand">R$ 1.772</strong> em dois
                dias, por causa da compra de eletrônicos.
              </>
            }
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
export function TimelineCard({ state }: StateProps) {
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
            <span className="hidden @tab:inline @desk:hidden">Ver 118 lançamentos</span>
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

/** Variação por categoria e o acumulado até hoje contra o mesmo dia de agosto. */
export function ComparisonCard({ state }: StateProps) {
  return (
    <Panel className="gap-1.5">
      <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
        Comparado com agosto
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
          <span className="text-13 text-caption">Até o dia 23, em cada mês</span>
          {monthComparison.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-3 text-14">
                <strong>{group.label}</strong>
                <span className={cn("font-bold", toneText[group.tone])}>{group.change}</span>
              </div>
              <div className="grid grid-cols-[4rem_minmax(0,1fr)_6rem] items-center gap-2.5 text-13 text-mist">
                {[
                  { month: "Setembro", ...group.current, color: group.color, strong: "text-sand" },
                  {
                    month: "Agosto",
                    ...group.previous,
                    color: "var(--guara-caption)",
                    strong: "text-mist",
                  },
                ].map((row) => (
                  <MonthBar key={row.month} {...row} />
                ))}
              </div>
            </div>
          ))}
          <p className="m-0 text-13 leading-normal text-mist">
            Sem a compra de eletrônicos, as saídas ficariam{" "}
            <strong className="text-sand">R$ 238 abaixo</strong> de agosto.
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
          className="block h-full rounded-[0.3125rem]"
          style={{ width: `${width}%`, background: color }}
        />
      </span>
      <strong className={cn("text-right tabular-nums", strong)}>{value}</strong>
    </>
  );
}
