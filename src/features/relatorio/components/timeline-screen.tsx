"use client";

import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListFilter } from "@/components/ui/list-filter";
import { Panel } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { useSession } from "@/features/acesso/session";
import { AccountsSchema, AnomaliesSchema, CategoriesSchema } from "@/features/gastos/live-ledger";
import { TimelineDays } from "./full-timeline";
import {
  fullTimeline,
  reportPeriod,
  timelineTotals,
  type TimelineDay,
} from "@/features/relatorio/data";
import {
  ReportTransactionsSchema,
  reportPaths,
  toTimelineDays,
  useReportView,
  type ReportPeriodId,
  type TimelineKind,
} from "@/features/relatorio/live";
import { apiRequest } from "@/lib/api";
import { apiKey, apiQuery } from "@/lib/api-query";
import { cn } from "@/lib/utils";

const periods = ["7 dias", "Este mês", "3 meses", "12 meses", "Personalizado"];
const kinds = ["Tudo", "Entradas", "Saídas", "Fora do padrão"];

function Filters() {
  return (
    <>
      <ListFilter
        label="Período"
        options={periods}
        defaultValue="Este mês"
        className="-mr-4 overflow-hidden @tab:mr-0 @tab:flex-wrap @tab:overflow-visible @desk:flex-nowrap"
      />
      <ListFilter
        label="Tipo de lançamento"
        options={kinds}
        className="-mr-4 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
      />
    </>
  );
}

type Total = { label: string; value: string; tone?: string };

function Totals({
  large,
  totals = timelineTotals,
}: {
  large?: boolean;
  totals?: readonly Total[];
}) {
  if (large) {
    return (
      <div className="grid grid-cols-4 items-stretch gap-5">
        {totals.map((t) => (
          <Panel key={t.label} className="gap-1.5 p-5.5">
            <span className="text-14 text-mist">{t.label}</span>
            <span
              className={cn(
                "font-display text-26 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
                t.tone,
              )}
            >
              {t.value}
            </span>
          </Panel>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5 @tab:grid-cols-4">
      {totals.map((t) => (
        <StatTile
          key={t.label}
          label={t.label}
          value={t.value}
          valueClassName={cn("text-16", t.tone)}
        />
      ))}
    </div>
  );
}

function Footer({ verb }: { verb: string }) {
  return (
    <>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        Dias 2 a 4, 6 a 9 e 11 a 14 agrupados. {verb} em “Mostrar todos os dias” para abrir cada um.
      </p>
      <Button variant="secondary" block className="text-15">
        <span>Mostrar todos os dias</span>
      </Button>
    </>
  );
}

/** Linha do tempo: com login, os lançamentos da API; sem, o exemplo do protótipo. */
export function TimelineScreen() {
  const { live } = useSession();
  return live ? <LiveTimeline /> : <PrototypeTimeline />;
}

function PrototypeTimeline() {
  const scope = `${reportPeriod.range} · ${reportPeriod.scope}`;
  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Linha do tempo" subtitle={scope} back="/relatorio" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Relatórios", href: "/relatorio" }, { label: "Linha do tempo" }]}
      />
      <DetailHeader
        title="Linha do tempo completa"
        subtitle={`${scope} · 118 lançamentos`}
        actions={
          <ButtonLink href="/relatorio?exportar" variant="secondary" size="sm">
            <Icon name="arrow-down-to" size={18} />
            <span>Exportar</span>
          </ButtonLink>
        }
      />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <Filters />
        <Totals />
        <TimelineDays days={fullTimeline} />
        <Footer verb="Toque" />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Panel className="p-5.5">
          <Filters />
          <Totals />
        </Panel>
        <Panel className="p-5.5">
          <TimelineDays days={fullTimeline} />
          <Footer verb="Toque" />
        </Panel>
      </div>

      {/* Desktop: filtros numa linha, totais em cards e a linha do tempo em duas colunas. */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="flex items-center gap-3">
          <ListFilter label="Período" options={periods} defaultValue="Este mês" />
          <div aria-hidden="true" className="grow" />
          <ListFilter label="Tipo de lançamento" options={kinds} className="flex-wrap" />
        </div>
        <Totals large />
        <Panel className="gap-4 p-6">
          <div className="grid grid-cols-2 items-start gap-12">
            <TimelineDays days={fullTimeline.slice(0, 5)} />
            <TimelineDays days={fullTimeline.slice(5)} />
          </div>
          <Footer verb="Clique" />
        </Panel>
      </div>
    </Page>
  );
}

const LIVE_PERIODS: { label: string; id: ReportPeriodId }[] = [
  { label: "7 dias", id: "7d" },
  { label: "Este mês", id: "mes" },
  { label: "3 meses", id: "3m" },
  { label: "12 meses", id: "12m" },
];

/** Os lançamentos do período, 100 por vez (a primeira página é a mesma do Relatório). */
function useTimelinePages(period: ReportPeriodId) {
  const client = useQueryClient();
  const path = reportPaths(new Date(), period).transactions;
  const cached = client.getQueryData(apiKey(path));
  const first = cached ? ReportTransactionsSchema.safeParse(cached) : null;
  return useInfiniteQuery({
    queryKey: ["relatorio", "linha-do-tempo", path],
    queryFn: ({ pageParam, signal }) =>
      apiRequest(
        pageParam ? `${path}&cursor=${encodeURIComponent(pageParam)}` : path,
        ReportTransactionsSchema,
        { signal },
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
    initialData: first?.success ? { pages: [first.data], pageParams: [null] } : undefined,
    staleTime: 5 * 60_000,
  });
}

function LiveTimeline() {
  const [periodLabel, setPeriodLabel] = useState("Este mês");
  const [kind, setKind] = useState<TimelineKind>("Tudo");
  const period = LIVE_PERIODS.find((p) => p.label === periodLabel)?.id ?? "mes";
  const report = useReportView(period, { enabled: true });
  const pages = useTimelinePages(period);
  const accounts = useQuery(apiQuery("/v1/accounts", AccountsSchema));
  const categories = useQuery(apiQuery("/v1/categories", CategoriesSchema));
  const anomalies = useQuery(apiQuery("/v1/anomalies?status=pending", AnomaliesSchema));

  const view = report.data;
  const range = view?.period.range ?? "Carregando…";
  const scope = `${range} · ${view?.period.scope ?? reportPeriod.scope}`;
  const transactions = pages.data?.pages.flatMap((page) => page.data) ?? [];
  const ready = view && pages.data && accounts.data && categories.data && anomalies.data;
  const failed =
    report.error ?? pages.error ?? accounts.error ?? categories.error ?? anomalies.error;
  const days: TimelineDay[] = ready
    ? toTimelineDays(transactions, {
        accounts: accounts.data,
        categories: categories.data,
        anomalies: anomalies.data,
        dayEnds: view.timeline.dayEnds ?? {},
        kind,
      })
    : [];
  const count = days.reduce((sum, day) => sum + day.itens.length, 0);
  const totals: Total[] = view
    ? [
        {
          label: view.balance.stats[0]?.label ?? "Começou",
          value: view.balance.stats[0]?.value ?? "—",
        },
        { label: "Entrou", value: `+${view.totals[0]?.value ?? "—"}`, tone: "text-folha" },
        { label: "Saiu", value: `−${view.totals[1]?.value ?? "—"}` },
        { label: "Hoje", value: view.balance.stats[1]?.value ?? "—", tone: "text-tucano" },
      ]
    : [];
  const filters = (
    <>
      <ListFilter
        label="Período"
        options={LIVE_PERIODS.map((p) => p.label)}
        value={periodLabel}
        onChange={setPeriodLabel}
        className="-mr-4 overflow-hidden @tab:mr-0 @tab:flex-wrap @tab:overflow-visible @desk:flex-nowrap"
      />
      <ListFilter
        label="Tipo de lançamento"
        options={kinds}
        value={kind}
        onChange={(value) => setKind(value as TimelineKind)}
        className="-mr-4 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
      />
    </>
  );
  const footer = (
    <>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        {pages.hasNextPage
          ? `Mostrando ${count === 1 ? "1 lançamento" : `${count} lançamentos`}. Há mais lançamentos no período.`
          : `${count === 1 ? "1 lançamento" : `${count} lançamentos`} no período.`}
        {period === "3m" || period === "12m"
          ? " Nos períodos por mês, o saldo de cada dia não aparece."
          : ""}
      </p>
      {pages.hasNextPage && (
        <Button
          variant="secondary"
          block
          className="text-15"
          disabled={pages.isFetchingNextPage}
          onClick={() => void pages.fetchNextPage()}
        >
          <span>{pages.isFetchingNextPage ? "Carregando…" : "Mostrar mais lançamentos"}</span>
        </Button>
      )}
    </>
  );
  const body = failed ? (
    <ErrorBlock />
  ) : !ready ? (
    <>
      <LoadingStatus />
      <p className="m-0 text-14 text-mist">Carregando os lançamentos…</p>
    </>
  ) : days.length === 0 ? (
    <StateBlock icon="file-doc" title="Nenhum lançamento">
      Não há lançamentos desse tipo no período. Escolha outro período ou tipo.
    </StateBlock>
  ) : null;
  const half = Math.ceil(days.length / 2);

  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Linha do tempo" subtitle={scope} back="/relatorio" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Relatórios", href: "/relatorio" }, { label: "Linha do tempo" }]}
      />
      <DetailHeader
        title="Linha do tempo completa"
        subtitle={
          ready ? `${scope} · ${pages.hasNextPage ? `${count}+` : count} lançamentos` : scope
        }
        actions={
          <ButtonLink href="/relatorio?exportar" variant="secondary" size="sm">
            <Icon name="arrow-down-to" size={18} />
            <span>Exportar</span>
          </ButtonLink>
        }
      />

      {/* Celular e tablet */}
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
        {filters}
        {totals.length > 0 && <Totals totals={totals} />}
        {body ?? (
          <>
            <TimelineDays days={days} />
            {footer}
          </>
        )}
      </div>

      {/* Desktop: filtros numa linha, totais em cards e a linha do tempo em duas colunas. */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="flex items-center gap-3">
          <ListFilter
            label="Período"
            options={LIVE_PERIODS.map((p) => p.label)}
            value={periodLabel}
            onChange={setPeriodLabel}
          />
          <div aria-hidden="true" className="grow" />
          <ListFilter
            label="Tipo de lançamento"
            options={kinds}
            value={kind}
            onChange={(value) => setKind(value as TimelineKind)}
            className="flex-wrap"
          />
        </div>
        {totals.length > 0 && <Totals large totals={totals} />}
        <Panel className="gap-4 p-6">
          {body ?? (
            <>
              <div className="grid grid-cols-2 items-start gap-12">
                <TimelineDays days={days.slice(0, half)} />
                <TimelineDays days={days.slice(half)} />
              </div>
              {footer}
            </>
          )}
        </Panel>
      </div>
    </Page>
  );
}
