"use client";

import Link from "next/link";

import { ErrorBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { formatCurrency } from "@/lib/format";
import { labelsOfMonth } from "@/lib/live-format";

import type { Projection } from "../api";
import { ProjectionBars } from "./projection-bars";

/** Meses que o bloco mostra (o seletor de mês vai até 12). */
const BLOCK_MONTHS = 6;

/**
 * Bloco "Próximos meses" de Gastos: os gastos fixos previstos (assinaturas e gastos futuros) dos
 * 6 meses depois do atual. Tocar num mês abre a projeção dele; o botão cadastra um gasto futuro.
 */
export function NextMonthsBlock({
  projection,
  error,
  plannedCount,
  onSelect,
}: {
  /** `undefined` enquanto carrega. */
  projection: Projection | undefined;
  error?: boolean;
  plannedCount: number;
  /** Sem ela (protótipo), os meses não abrem. */
  onSelect?: (month: string) => void;
}) {
  const months = projection?.months.slice(0, BLOCK_MONTHS) ?? [];
  const next = months[0];
  return (
    <Panel id="g-proximos" className="gap-4 p-4 @tab:p-5">
      <PanelHeader
        title="Próximos meses"
        subtitle="Gastos fixos previstos: assinaturas e gastos futuros"
        action={
          <Link href="/gastos/futuros" className={panelLinkClass}>
            {plannedCount > 0 ? `Gastos futuros (${plannedCount})` : "Gastos futuros"}
            <Icon name="chevron-right" size={16} />
          </Link>
        }
      />
      {error ? (
        <ErrorBlock />
      ) : (
        // Pela largura do bloco (a pessoa pode mudar): estreito empilha; largo, barras ao lado do texto.
        <div className="@container flex grow flex-col">
          <div className="grid grow grid-cols-1 gap-4 @min-[760px]:grid-cols-[minmax(0,1fr)_18rem] @min-[760px]:gap-8">
            {!projection ? (
              <p role="status" className="m-0 text-14 text-mist">
                Calculando a previsão…
              </p>
            ) : (
              <ProjectionBars months={months} onSelect={onSelect} />
            )}
            <div className="flex flex-col justify-between gap-4">
              {next && (
                <p className="m-0 text-13 leading-normal text-mist @min-[760px]:text-14">
                  Em {labelsOfMonth(next.month).name} já estão previstos{" "}
                  <strong className="text-sand">{formatCurrency(next.totalCents)}</strong> em gastos
                  fixos (assinaturas e gastos futuros). O mês atual mostra só o que já foi gasto.
                </p>
              )}
              <ButtonLink href="/gastos/futuros/novo" size="md" className="self-start text-15">
                <Icon name="plus" size={18} />
                <span>Adicionar gasto futuro</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
