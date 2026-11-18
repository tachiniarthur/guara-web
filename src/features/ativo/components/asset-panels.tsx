"use client";

import Link from "next/link";
import { useState } from "react";

import { LineSeries } from "@/components/charts/line-series";
import { CompactStateBlock } from "@/components/states/state-block";
import { DetailList } from "@/components/ui/detail-list";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { StatTile } from "@/components/ui/stat-tile";
import { RiskBadge } from "@/features/investimentos/components/position-parts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  HISTORY_RANGES,
  RANGE_LABEL,
  toHistoryPoints,
  useHistory,
  type AssetView,
  type Change,
  type HistoryRange,
  type MarketView,
} from "../live";

const title = "text-18 tracking-normal";

/** "a, b e c". */
const joinPt = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} e ${items.at(-1)}` : (items[0] ?? "");

export function ChangeText({ change, className }: { change: Change; className?: string }) {
  if (!change) return <span className={cn("text-caption", className)}>—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-bold tabular-nums",
        change.alta ? "text-folha" : "text-urucum",
        className,
      )}
    >
      <Icon name={change.alta ? "arrow-up" : "arrow-down"} size={14} />
      {change.valor}
    </span>
  );
}

/** Valor da posição, rentabilidade e os números do cadastro. */
export function PositionPanel({ asset }: { asset: AssetView }) {
  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-1">
        <span className="text-14 text-mist">Valor da posição</span>
        <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {asset.valor}
        </span>
        {asset.valorOriginal && (
          <span className="text-14 text-mist tabular-nums">{asset.valorOriginal}</span>
        )}
        <span className="text-13 text-caption">{asset.valorEm}</span>
      </div>
      {asset.desatualizado && (
        <Note icon="alert-triangle" tone="warning">
          O valor foi informado há mais de 30 dias. Corrija com o valor de hoje para a carteira
          ficar certa.
        </Note>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          label="Rentabilidade"
          value={<ChangeText change={asset.rentabilidade} />}
          hint="sobre o custo"
        />
        <StatTile
          label="Ganho"
          value={asset.ganho?.valor ?? "—"}
          valueClassName={cn(
            "text-17",
            asset.ganho ? (asset.ganho.alta ? "text-folha" : "text-urucum") : "text-caption",
          )}
          hint={`custo ${asset.custo}`}
        />
      </div>
      <DetailList
        items={[
          { label: "Classe", value: asset.classe },
          { label: "Tipo", value: asset.instrumento },
          { label: "Risco", value: <RiskBadge risk={asset.risco} /> },
          { label: "% da carteira", value: asset.percentual },
          ...(asset.cotado
            ? [
                { label: "Quantidade", value: asset.quantidade },
                { label: "Preço médio", value: asset.precoMedio },
                ...(asset.cotacao === "—" ? [] : [{ label: "Cotação", value: asset.cotacao }]),
              ]
            : []),
          ...(asset.bolsa ? [{ label: "Bolsa", value: asset.bolsa }] : []),
          { label: "Origem", value: asset.origem },
        ]}
      />
    </Panel>
  );
}

/** Cotação, variação do dia, faixa de 52 semanas e o histórico de fechamento. */
export function QuotePanel({
  symbol,
  market,
  enabled,
  chartHref,
}: {
  symbol: string;
  market: MarketView;
  enabled: boolean;
  /** "Ver gráfico completo" (a tela do gráfico grande). */
  chartHref?: string;
}) {
  const [range, setRange] = useState<HistoryRange>("1y");
  const history = useHistory(symbol, range, { enabled });
  const points = history.data ? toHistoryPoints(history.data) : [];
  const brl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  const tick = (v: number) =>
    v >= 10_000
      ? `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`
      : v.toLocaleString("pt-BR", { maximumFractionDigits: v < 10 ? 2 : 0 });
  const first = points[0]?.value;
  const last = points.at(-1)?.value;
  const servedRange = history.data?.range as HistoryRange | undefined;
  const served = history.data?.limitedByPlan
    ? `A fonte de dados só cobre ${servedRange && servedRange in RANGE_LABEL ? RANGE_LABEL[servedRange] : "um período menor"}.`
    : null;

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-14 text-mist">Cotação</span>
          <span className="font-display text-26 leading-[1.1] font-extrabold tabular-nums">
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
        <div className="flex h-[13.75rem] items-center justify-center">
          <Spinner size={28} />
        </div>
      ) : points.length < 2 ? (
        <p className="m-0 py-8 text-center text-14 text-mist">Sem histórico para este período.</p>
      ) : (
        <LineSeries
          points={points.map((p) => ({
            label: formatDate(`${p.date}T12:00:00-03:00`, range === "5y" ? "MM/yy" : "dd/MM"),
            value: p.value,
          }))}
          label={`Fechamento de ${symbol} em ${RANGE_LABEL[range]}: de ${brl(first ?? 0)} para ${brl(last ?? 0)}`}
          format={brl}
          tickFormat={tick}
        />
      )}
      {served && <p className="m-0 text-13 text-caption">{served}</p>}
      {chartHref && (
        <div className="flex justify-end">
          <Link href={chartHref} className={panelLinkClass}>
            Ver gráfico completo
            <Icon name="chevron-right" size={16} />
          </Link>
        </div>
      )}
      {market.faixa52 && (
        <div className="flex flex-col gap-2">
          <span className="text-13 text-mist">Faixa de 52 semanas</span>
          <div className="relative h-1.5 rounded-full bg-field">
            <span
              aria-hidden="true"
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-tucano"
              style={{ left: `${market.faixa52.posicao}%` }}
            />
          </div>
          <div className="flex justify-between text-13 tabular-nums">
            <span>
              <span className="text-caption">mín. </span>
              {market.faixa52.min}
            </span>
            <span>
              <span className="text-caption">máx. </span>
              {market.faixa52.max}
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
}

/** Retorno, CDI, volatilidade e Sharpe por período. */
export function PerformancePanel({ market }: { market: MarketView }) {
  if (market.desempenho.length === 0) return null;
  return (
    <Panel className="p-5">
      <PanelHeader
        title="Desempenho"
        subtitle="Comparado ao CDI do mesmo período"
        titleClassName={title}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-14 tabular-nums">
          <thead>
            <tr className="text-12 tracking-[.05em] text-mist uppercase">
              <th scope="col" className="pb-2 text-left font-bold">
                Período
              </th>
              <th scope="col" className="pb-2 text-right font-bold">
                Retorno
              </th>
              <th scope="col" className="pb-2 text-right font-bold">
                CDI
              </th>
              <th scope="col" className="pb-2 text-right font-bold" title="Volatilidade anualizada">
                Volat.
              </th>
              <th scope="col" className="pb-2 text-right font-bold" title="Índice de Sharpe">
                Sharpe
              </th>
            </tr>
          </thead>
          <tbody>
            {market.desempenho.map((row) => (
              <tr key={row.periodo} className="border-t border-line">
                <th scope="row" className="py-2.5 text-left font-semibold">
                  {row.periodo}
                </th>
                <td className="py-2.5 text-right font-bold">{row.retorno}</td>
                <td className="py-2.5 text-right text-mist">{row.cdi}</td>
                <td className="py-2.5 text-right text-mist">{row.volatilidade}</td>
                <td className="py-2.5 text-right text-mist">{row.sharpe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 text-12 leading-[1.5] text-caption">
        Rentabilidade passada não garante rentabilidade futura.
      </p>
    </Panel>
  );
}

/** Resumo dos proventos dos últimos 12 meses, com o link para a lista completa. */
export function DividendsPanel({ market, href }: { market: MarketView; href: string }) {
  const p = market.proventos;
  return (
    <Panel className="p-5">
      <PanelHeader
        title="Proventos"
        subtitle="Últimos 12 meses, por cota"
        titleClassName={title}
        action={
          p && (p.itens.length > 0 || (market.eventos?.length ?? 0) > 0) ? (
            <Link href={href} className={panelLinkClass}>
              Ver todos
            </Link>
          ) : undefined
        }
      />
      {p ? (
        <div className="grid grid-cols-2 gap-2.5">
          <StatTile label="Por cota" value={p.porCota} hint={`${p.itens.length} pagamentos`} />
          <StatTile label="Dividend yield" value={p.dy ?? "—"} hint="sobre a cotação de hoje" />
        </div>
      ) : (
        <p className="m-0 text-14 text-mist">
          {market.limites.includes("proventos")
            ? "A fonte de dados não cobre os proventos deste ativo."
            : "Sem proventos informados pela fonte de dados."}
        </p>
      )}
    </Panel>
  );
}

/** Último balanço anual (só ações). */
export function FundamentalsPanel({ market }: { market: MarketView }) {
  const f = market.fundamentos;
  if (!f) return null;
  return (
    <Panel className="p-5">
      <PanelHeader
        title="Balanço"
        subtitle={`Último balanço anual, de ${f.data}`}
        titleClassName={title}
      />
      <DetailList items={f.itens} />
    </Panel>
  );
}

/** A página de mercado (cotação, desempenho, proventos) é recurso do plano. */
export function PlanNote() {
  return (
    <Panel className="p-5">
      <PanelHeader title="Cotação e desempenho" titleClassName={title} />
      <p className="m-0 text-14 leading-[1.55] text-mist">
        O gráfico, o desempenho e os proventos do ativo fazem parte de outro plano. A sua posição
        continua aqui.
      </p>
      <Link href="/perfil/planos" className={panelLinkClass}>
        Ver planos
        <Icon name="chevron-right" size={16} />
      </Link>
    </Panel>
  );
}

/** Falha da fonte de dados de mercado: a posição continua na tela. */
export function MarketError() {
  return (
    <Panel className="p-5">
      <CompactStateBlock icon="alert-triangle" title="Não deu para carregar a cotação">
        A posição continua certa. Tente de novo em instantes.
      </CompactStateBlock>
    </Panel>
  );
}

/** "A fonte de dados não cobre: proventos e dados do balanço." */
export function LimitsNote({ market }: { market: MarketView }) {
  if (market.limites.length === 0) return null;
  return (
    <p className="m-0 text-13 leading-[1.55] text-caption">
      A fonte de dados não cobre {joinPt(market.limites)} deste ativo no plano atual dela.
    </p>
  );
}
