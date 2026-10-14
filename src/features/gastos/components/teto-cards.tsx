import Link from "next/link";
import type { ReactNode } from "react";

import { ValueBars } from "@/components/charts/value-bars";
import { ForestBackdrop } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { previousMonths, tetoStatusLabel, type TetoDetail, type TetoStatus } from "../tetos";

const statusTone = { "no-ritmo": "folha", perto: "tucano", estourou: "urucum" } as const;

export function TetoStatusTag({ status }: { status: TetoStatus }) {
  return (
    <Tag tone={statusTone[status]} status>
      {tetoStatusLabel[status]}
    </Tag>
  );
}

const fill = { tranquilo: "bg-arara", atenção: "bg-tucano", apertado: "bg-urucum" } as const;

/** Cartão com a textura de mata (destaque dos tetos e do detalhe de um teto). */
export function MataCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "relative isolate flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-card border border-line-strong bg-mata p-5",
        className,
      )}
    >
      <ForestBackdrop overlay="deep" />
      {children}
    </section>
  );
}

/** Barra translúcida sobre a mata, com marcas dos avisos. */
function MataBar({
  percentual,
  color = "bg-tucano",
  marcos = [],
  large,
}: {
  percentual: number;
  color?: string;
  marcos?: number[];
  large?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative bg-[rgba(11,17,14,.55)]",
        large ? "h-3 rounded-md" : "h-2.5 rounded-[5px]",
      )}
    >
      <div
        className={cn(color, large ? "h-3 rounded-md" : "h-2.5 rounded-[5px]")}
        style={{ width: `${percentual}%` }}
      />
      {marcos.map((marco) => (
        <span
          key={marco}
          aria-hidden="true"
          className="absolute -top-[3px] h-4.5 w-0.5 rounded-[1px] bg-sand"
          style={{ left: `calc(${marco}% - 1px)` }}
        />
      ))}
    </div>
  );
}

/** Soma dos tetos do mês. */
export function TetosSummaryCard({
  summary,
}: {
  summary: { ativos: number; gasto: string; total: string; percentual: number; nota: string };
}) {
  return (
    <MataCard>
      <span className="text-14 text-[#C5D8CB]">Setembro · {summary.ativos} tetos ativos</span>
      <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        {summary.gasto}
        <span className="text-16 font-medium text-mist"> de {summary.total}</span>
      </span>
      <MataBar percentual={summary.percentual} />
      <span className="text-14 text-[#E4EEE6]">{summary.nota}</span>
    </MataCard>
  );
}

/** Destaque do detalhe de um teto. */
export function TetoHighlightCard({ teto }: { teto: TetoDetail }) {
  return (
    <MataCard className="p-5.5">
      <div className="flex items-center gap-2.5">
        <span className="grow text-14 text-[#C5D8CB]">{teto.categoria} · setembro</span>
        <TetoStatusTag status={teto.status} />
      </div>
      <span className="font-display text-36 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        {teto.gastoCompleto}
        <span className="text-16 font-medium text-mist"> de {teto.tetoCompleto}</span>
      </span>
      <MataBar
        percentual={teto.percentual}
        color={fill[teto.estado]}
        marcos={teto.marcos
          .filter((m) => m.percentual < 100 && m.atingido)
          .map((m) => m.percentual)}
        large
      />
      <span className="text-14 text-[#E4EEE6]">
        {teto.destaque.percentual} · faltam{" "}
        <strong className="text-white">{teto.destaque.faltam}</strong>
        {teto.destaque.ritmo && (
          <>
            {" "}
            · no ritmo atual, fecha perto de{" "}
            <strong className="text-white">{teto.destaque.ritmo}</strong>
          </>
        )}
      </span>
    </MataCard>
  );
}

/** Um teto na lista: categoria, gasto × teto, situação, trilho com avisos e previsão. */
export function TetoListItem({ teto, last }: { teto: TetoDetail; last?: boolean }) {
  return (
    <li className={cn("flex flex-col gap-2.5 py-4", !last && "border-b border-line")}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-shade text-mist"
        >
          <Icon name={teto.icone} />
        </span>
        <span className="flex min-w-0 grow flex-col leading-[1.35]">
          <strong className="text-16">
            <Link
              href={`/alertas/tetos/${teto.id}`}
              className="text-sand no-underline hover:underline"
            >
              {teto.categoria}
            </Link>
          </strong>
          <span className="text-13 text-mist tabular-nums @tab:hidden">
            <strong className="text-sand">{teto.gastoCompleto}</strong> de {teto.tetoCompleto}
          </span>
        </span>
        <TetoStatusTag status={teto.status} />
        <span className="hidden text-14 whitespace-nowrap text-mist tabular-nums @tab:inline">
          <strong className="text-sand">{teto.gastoCompleto}</strong> de {teto.tetoCompleto}
        </span>
      </div>
      <div aria-hidden="true" className="relative h-2.5 rounded-[5px] bg-shade">
        <div
          className={cn("h-2.5 rounded-[5px]", fill[teto.estado])}
          style={{ width: `${teto.percentual}%` }}
        />
        {teto.marcos
          .filter((m) => m.percentual < 100)
          .map((m) => (
            <span
              key={m.percentual}
              aria-hidden="true"
              className={cn(
                "absolute -top-[3px] h-4 w-0.5 rounded-[1px]",
                m.atingido ? "bg-sand" : "bg-line-strong",
              )}
              style={{ left: `calc(${m.percentual}% - 1px)` }}
            />
          ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-3">
          {teto.marcos
            .filter((m) => m.percentual < 100)
            .map((m) => (
              <span
                key={m.percentual}
                className={cn(
                  "text-12",
                  m.atingido ? "font-bold text-folha" : "font-medium text-caption",
                )}
              >
                {`${m.atingido ? "✓ " : ""}R$ ${m.rotulo}`}
              </span>
            ))}
          <span className="text-12 text-caption">
            {teto.marcos.at(-1)?.rotulo.replace("teto ", "teto R$ ")}
          </span>
        </div>
        <span className="text-right text-13 text-mist">{teto.resumo}</span>
      </div>
    </li>
  );
}

export function TetoLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-13 text-mist">
      <TetoStatusTag status="no-ritmo" />
      <span>abaixo de 70% do teto</span>
      <TetoStatusTag status="perto" />
      <span>70% ou mais</span>
      <TetoStatusTag status="estourou" />
      <span>passou do teto no mês</span>
    </div>
  );
}

/** Lista "Tetos do mês" com a legenda das situações. */
export function TetoListPanel({ items, className }: { items: TetoDetail[]; className?: string }) {
  return (
    <Panel className={cn("gap-2.5 p-5.5", className)}>
      <PanelHeader
        title="Tetos do mês"
        subtitle="Cada aviso chega uma vez por mês, somando crédito e débito"
        titleClassName="text-19 tracking-normal"
      />
      <ul className="m-0 flex list-none flex-col p-0">
        {items.map((teto, i) => (
          <TetoListItem key={teto.id} teto={teto} last={i === items.length - 1} />
        ))}
      </ul>
      <TetoLegend />
    </Panel>
  );
}

export function PreviousMonthsPanel({ className }: { className?: string }) {
  return (
    <Panel className={cn("gap-3.5 p-5.5", className)}>
      <PanelHeader title="Meses anteriores" titleClassName="text-18 tracking-normal" />
      <RowList>
        {previousMonths.map((month, i) => (
          <ListRow
            key={month.mes}
            title={month.mes}
            meta={month.nota}
            value={<TetoStatusTag status={month.status} />}
            divider={i < previousMonths.length - 1}
          />
        ))}
      </RowList>
    </Panel>
  );
}

/** Gastos da categoria nos últimos 6 meses (julho em urucum quando passou do teto). */
export function TetoHistoryChart({
  teto,
  width = 340,
}: {
  teto: TetoDetail;
  /** Largura do viewBox (340 no celular e tablet, 420 no desktop). */
  width?: number;
}) {
  const limit = Number(teto.tetoCompleto.replace(/[^\d,]/g, "").replace(",", "."));
  const label = `${teto.categoria}: ${teto.historico
    .map(
      (h) =>
        `${h.mes.replace("*", "")} R$ ${h.valor.toLocaleString("pt-BR")}${h.valor > limit ? " (estourou)" : ""}`,
    )
    .join(", ")}`;
  return (
    <ValueBars
      width={width}
      height={170}
      base={148}
      scale={0.11253}
      label={label}
      items={teto.historico.map((h) => ({
        label: h.mes,
        value: h.valor,
        display: String(h.valor),
        color: h.valor > limit ? "#FF6A50" : "#6DB3EC",
      }))}
    />
  );
}
