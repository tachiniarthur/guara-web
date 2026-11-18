"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";

import { LineSeries } from "@/components/charts/line-series";
import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { CompactStateBlock, ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailGrid } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { StatTile } from "@/components/ui/stat-tile";
import { useSession } from "@/features/acesso/session";
import { ChangeText, PlanNote } from "@/features/ativo/components/asset-panels";
import {
  EMPTY_ASSET,
  EMPTY_MARKET,
  HISTORY_RANGES,
  RANGE_LABEL,
  isPlanLimit,
  isPositionId,
  periodStats,
  toHistoryPoints,
  toMarketView,
  useAssetData,
  useHistory,
  type HistoryRange,
} from "@/features/ativo/live";
import { ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { percent } from "@/lib/live-format";
import { cn } from "@/lib/utils";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const tick = (v: number) =>
  v >= 10_000
    ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`
    : v.toLocaleString("pt-BR", { maximumFractionDigits: v < 10 ? 2 : 0 });
const signed = (v: number) => `${v > 0 ? "+" : ""}${percent.format(v)}%`;

/** O período do gráfico que também tem a comparação com o CDI no desempenho da API. */
const PERFORMANCE_PERIOD: Partial<Record<HistoryRange, string>> = {
  "1mo": "1mo",
  "3mo": "3mo",
  "6mo": "6mo",
  "1y": "1y",
};

/**
 * Gráfico completo do ativo (API): fechamento por período com a linha do seu preço médio, a
 * variação, a máxima e a mínima do período e o retorno comparado ao CDI (quando a API tem o
 * mesmo período). Comparação com índices dia a dia e histórico ajustado por proventos entram
 * quando a fonte de dados trouxer.
 */
export function GraficoScreen({ id }: { id: string }) {
  const { live } = useSession();
  const {
    position,
    asset: loadedAsset,
    symbol,
    market: marketQuery,
  } = useAssetData(id, {
    enabled: live,
  });
  const loadedMarket = marketQuery.data ? toMarketView(marketQuery.data) : null;
  const [range, setRange] = useState<HistoryRange>("1y");
  // O histórico sai junto com a cotação quando o ticker já é conhecido (vindo da lista).
  const history = useHistory(symbol, range, { enabled: live && !marketQuery.error });
  // Carregando: os cards no lugar, com o círculo girando.
  const loading = !loadedAsset || !loadedMarket;
  const asset = loadedAsset ?? EMPTY_ASSET;
  const market = loadedMarket ?? EMPTY_MARKET;

  if (!isPositionId(id)) notFound();
  if (position.error instanceof ApiError && position.error.code === "not_found") notFound();
  // Sem ticker da B3 (CDB, ativo dos EUA) não há histórico de cotação.
  if (loadedAsset && !symbol) notFound();

  const back = `/investimentos/${id}`;
  const nome = loadedAsset?.nome ?? "Ativo";
  const failed = !live || position.error || (marketQuery.error && !isPlanLimit(marketQuery.error));
  const points = history.data ? toHistoryPoints(history.data) : [];
  const stats = periodStats(points);
  const average = position.data && asset.cotado ? position.data.averagePriceCents / 100 : null;
  const perf = marketQuery.data?.performance.find((p) => p.period === PERFORMANCE_PERIOD[range]);

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Gráfico" subtitle={nome} back={back} balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: nome, href: back },
          { label: "Gráfico" },
        ]}
      />
      {!failed && !isPlanLimit(marketQuery.error) && loading && <LoadingStatus />}
      <Skeleton active={!loadedAsset && !failed}>
        <DetailHeader title={`Gráfico de ${nome}`} subtitle={loadedAsset?.descricao} />
      </Skeleton>
      {failed ? (
        <ErrorBlock />
      ) : isPlanLimit(marketQuery.error) ? (
        <PlanNote />
      ) : (
        <Skeleton active={loading}>
          <div className="grid grid-cols-1 items-start gap-4 @desk:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @desk:gap-5">
            <Panel className="p-4.5 @desk:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-14 text-mist">Cotação</span>
                  <span className="font-display text-30 leading-[1.1] font-extrabold tabular-nums">
                    {market.cotacao}
                  </span>
                  <span className="flex items-center gap-2 text-13 text-caption">
                    <ChangeText change={market.variacaoDia} className="text-14" />
                    hoje{market.cotadoEm ? ` · ${market.cotadoEm}` : ""}
                  </span>
                </div>
                <SegmentedControl
                  label="Período do gráfico"
                  size="sm"
                  value={range}
                  onValueChange={setRange}
                  options={HISTORY_RANGES.map((r) => ({
                    value: r,
                    label: r.replace("mo", "m").replace("y", "a"),
                    ariaLabel: RANGE_LABEL[r],
                  }))}
                />
              </div>
              {history.error ? (
                <CompactStateBlock icon="alert-triangle" title="Não deu para carregar o histórico">
                  Tente de novo em instantes.
                </CompactStateBlock>
              ) : !history.data ? (
                <div className="flex h-80 items-center justify-center">
                  <Spinner size={28} />
                </div>
              ) : points.length < 2 ? (
                <p className="m-0 py-10 text-center text-14 text-mist">
                  Sem histórico para este período.
                </p>
              ) : (
                <LineSeries
                  height={320}
                  points={points.map((p) => ({
                    label: formatDate(
                      `${p.date}T12:00:00-03:00`,
                      range === "5y" ? "MM/yy" : "dd/MM",
                    ),
                    value: p.value,
                  }))}
                  label={`Fechamento de ${symbol} em ${RANGE_LABEL[range]}: de ${brl(points[0]!.value)} para ${brl(points.at(-1)!.value)}`}
                  format={brl}
                  tickFormat={tick}
                  target={
                    average
                      ? { value: average, label: `Seu preço médio ${brl(average)}` }
                      : undefined
                  }
                />
              )}
              {history.data?.limitedByPlan && (
                <p className="m-0 text-13 text-caption">
                  A fonte de dados não cobre o período inteiro; o gráfico mostra o maior disponível.
                </p>
              )}
              {stats && (
                <div className="grid grid-cols-3 items-stretch gap-2">
                  <StatTile
                    label="No período"
                    value={stats.variacao === null ? "—" : signed(stats.variacao)}
                    valueClassName={cn(
                      "text-16",
                      stats.variacao === null
                        ? "text-caption"
                        : stats.variacao >= 0
                          ? "text-folha"
                          : "text-urucum",
                    )}
                    hint={perf?.cdiPct == null ? undefined : `CDI ${signed(perf.cdiPct)}`}
                  />
                  <StatTile label="Máxima" value={brl(stats.max)} valueClassName="text-16" />
                  <StatTile label="Mínima" value={brl(stats.min)} valueClassName="text-16" />
                </div>
              )}
            </Panel>
            <div className="flex min-w-0 flex-col gap-4">
              <Panel className="p-4.5 @desk:p-6">
                <PanelHeader title="Sua posição" titleClassName="text-17 tracking-normal" />
                <DetailGrid
                  items={[
                    { label: "Quantidade", value: asset.quantidade },
                    { label: "Preço médio", value: asset.precoMedio },
                    { label: "Valor", value: asset.valor },
                    {
                      label: "Rentabilidade",
                      value: <ChangeText change={asset.rentabilidade} />,
                    },
                  ]}
                />
                <div className="flex justify-end">
                  <Link href={`${back}/detalhes`} className={panelLinkClass}>
                    Mais detalhes
                    <Icon name="chevron-right" size={16} />
                  </Link>
                </div>
              </Panel>
              <p className="m-0 text-13 leading-[1.55] text-caption">
                Fechamento diário da fonte de mercado. A comparação com o Ibovespa dia a dia e o
                histórico ajustado por proventos entram aqui quando a fonte de dados trouxer.
              </p>
            </div>
          </div>
        </Skeleton>
      )}
    </Page>
  );
}
