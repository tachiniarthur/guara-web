"use client";

import Link from "next/link";

import { ErrorBlock } from "@/components/states/state-block";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { formatCurrency } from "@/lib/format";
import { labelsOfMonth } from "@/lib/live-format";

import type { Projection } from "../api";
import { ProjectionBars } from "./projection-bars";

/**
 * Gastos de um mês futuro (escolhido no seletor de mês): só a previsão dos gastos fixos, já que o
 * mês ainda não tem lançamentos. Assinaturas ativas e gastos futuros, item a item, e os 12 meses
 * seguintes para trocar de mês.
 */
export function ProjectionView({
  month,
  projection,
  error,
  plannedCount,
  onSelect,
  onBackToCurrent,
}: {
  month: string;
  /** `undefined` enquanto carrega. */
  projection: Projection | undefined;
  error?: boolean;
  plannedCount: number;
  onSelect: (month: string) => void;
  onBackToCurrent: () => void;
}) {
  const { name } = labelsOfMonth(month);
  const data = projection?.months.find((m) => m.month === month);
  if (error) return <ErrorBlock />;

  return (
    <div className="grid grid-cols-1 gap-4 @desk:grid-cols-12 @desk:gap-6">
      <Panel className="gap-5 p-4 @tab:p-5 @desk:col-span-7">
        <PanelHeader
          title={`Previsão de ${name}`}
          subtitle="Gastos fixos que já estão combinados para o mês"
        />
        {!data ? (
          <p role="status" className="m-0 text-14 text-mist">
            Calculando a previsão…
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-14 text-mist">Total previsto</span>
              <strong className="font-display text-36 leading-none font-extrabold tabular-nums">
                {formatCurrency(data.totalCents)}
              </strong>
            </div>
            <dl className="m-0 grid grid-cols-2 gap-3">
              <StatTile label="Assinaturas" value={formatCurrency(data.subscriptionsCents)} />
              <StatTile label="Gastos futuros" value={formatCurrency(data.plannedCents)} />
            </dl>
            {data.items.length === 0 ? (
              <p className="m-0 rounded-tile border border-dashed border-line-strong p-4 text-14 text-mist">
                Nenhum gasto fixo previsto para {name}. Cadastre a parcela, o aluguel ou outro gasto
                que você já sabe que vem.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {data.items.map((item) => (
                  <li
                    key={`${item.kind}-${item.id}`}
                    className="flex min-h-13 items-center gap-3 border-b border-line py-2 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-field text-mist"
                    >
                      <Icon name={item.kind === "planned" ? "calendar" : "repeat"} size={18} />
                    </span>
                    <span className="flex min-w-0 grow flex-col">
                      <span className="truncate text-15 font-medium">{item.name}</span>
                      <span className="text-13 text-caption">
                        {item.kind === "planned" ? "Gasto futuro" : "Assinatura"}
                      </span>
                    </span>
                    <span className="text-15 font-bold tabular-nums">
                      {formatCurrency(item.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Note icon="info">
              A previsão soma só os gastos fixos. Compras do dia a dia (mercado, delivery) entram
              quando o mês chegar e forem pagas.
            </Note>
          </>
        )}
      </Panel>

      <Panel className="gap-4 p-4 @tab:p-5 @desk:col-span-5">
        <PanelHeader
          title="Próximos 12 meses"
          subtitle="Toque num mês para ver a previsão dele"
          action={
            <Link href="/gastos/futuros" className={panelLinkClass}>
              {plannedCount > 0 ? `Gastos futuros (${plannedCount})` : "Gastos futuros"}
              <Icon name="chevron-right" size={16} />
            </Link>
          }
        />
        {projection && (
          <ProjectionBars months={projection.months} selected={month} onSelect={onSelect} />
        )}
        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/gastos/futuros/novo" size="md" className="text-15">
            <Icon name="plus" size={18} />
            <span>Adicionar gasto futuro</span>
          </ButtonLink>
          <Button variant="ghost" size="md" className="text-15" onClick={onBackToCurrent}>
            <Icon name="arrow-down-left" size={18} />
            <span>Voltar ao mês atual</span>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
