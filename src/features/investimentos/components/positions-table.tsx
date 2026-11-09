"use client";

import Link from "next/link";
import { Fragment, useId } from "react";

import { Icon } from "@/components/ui/icon";
import { SlideCell, slideRowClass } from "@/components/ui/slide-cell";
import { cn } from "@/lib/utils";

import { useInvestimentosData } from "../context";
import { useClosedGroups } from "./position-cards";
import { DayChange, OriginInfo, RiskBadge, SortArrows } from "./position-parts";
import { MataArt } from "@/components/ui/mata-art";

// Com o chat aberto ao lado a tabela estreita: o título quebra em duas linhas em vez de invadir
// a coluna vizinha (centralizado, ele passaria dos dois lados). Palavras longas levam hífen
// opcional (\u00AD): "INSTRU-/MENTO" só quando não cabem.
const th =
  "border-b border-line-strong px-2 pb-3 align-bottom text-13 leading-[1.25] font-bold tracking-[.05em] text-balance text-mist uppercase";
// Todas as colunas centralizadas, menos "Ativo" (a primeira).
const cell = "px-3.5 py-3.5 text-center text-15";

// Total com folga para "R$ 15.892,10" numa linha só (e "Quantidade" sem encostar em "Preço médio").
const columns = ["15%", "8%", "9%", "8%", "11%", "8%", "9%", "11%", "8%", "9%", "4%"];

/** Tabela de posições agrupada por classe (desktop). */
export function PositionsTable() {
  const { portfolio, positionGroups } = useInvestimentosData();
  const [closed, toggle] = useClosedGroups();
  const id = useId();
  return (
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">Posições da carteira agrupadas por classe</caption>
      <colgroup>
        {columns.map((width, i) => (
          <col key={i} style={{ width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className={cn(th, "px-3.5 text-left")}>
            Ativo
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            Classe
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            {"Instru\u00ADmento"}
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            Risco
            <span
              title="Risco calculado pelo cadastro do ativo: volatilidade, risco de crédito e liquidez. Você pode ajustar."
              aria-label="Como o risco é calculado"
              className="ml-1.5 inline-flex align-[-2px] text-caption"
            >
              <Icon name="info" size={14} />
            </span>
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            Origem
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            {"Quanti\u00ADdade"}
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            Preço médio
          </th>
          <th scope="col" aria-sort="descending" className={cn(th, "text-center")}>
            <button
              type="button"
              aria-label="Ordenar por total, ordenado do maior para o menor"
              className="-mx-2 -my-1.5 inline-flex items-center gap-1.5 rounded-lg border-none bg-shade px-2 py-1.5 tracking-[inherit] text-sand uppercase"
            >
              Total
              <SortArrows active />
            </button>
          </th>
          <th scope="col" aria-sort="none" className={cn(th, "text-center")}>
            <button
              type="button"
              aria-label="Ordenar por % da carteira"
              className="-mx-2 -my-1.5 inline-flex max-w-[calc(100%+1rem)] items-center justify-center gap-1.5 rounded-lg border-none bg-transparent px-2 py-1.5 tracking-[inherit] text-balance text-mist uppercase"
            >
              % da carteira
              <SortArrows active={false} />
            </button>
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            Hoje
          </th>
          <th scope="col" className={cn(th, "text-center")}>
            <span className="sr-only">Abrir ativo</span>
          </th>
        </tr>
      </thead>
      {positionGroups.map((group, i) => {
        const expanded = !closed.has(group.classe);
        return (
          <Fragment key={group.classe}>
            <tbody>
              <tr>
                <th scope="rowgroup" colSpan={11} className="pt-2 pb-1.5 text-left font-normal">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`${id}-${i}`}
                    onClick={() => toggle(group.classe)}
                    className="relative isolate grid w-full pressable grid-cols-[68fr_11fr_8fr_13fr] items-center overflow-hidden rounded-[0.875rem] border border-sand/25 bg-mata p-0 text-left text-sand"
                  >
                    <MataArt className="absolute inset-0 -z-20 size-full" align="right" />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,17,14,0.85)_0%,rgba(11,17,14,0.55)_55%,rgba(11,17,14,0.2)_100%)]"
                    />
                    <span className="flex items-center gap-2 px-3.5 py-3 text-15 font-bold text-sand">
                      <Icon
                        name="chevron-down"
                        size={18}
                        className={cn(
                          "shrink-0 text-mist transition-transform duration-(--duration-move) ease-out-soft",
                          !expanded && "-rotate-90",
                        )}
                      />
                      <span>
                        {group.classe}{" "}
                        <span className="font-normal text-mist">
                          {`· ${group.posicoes.length} ${group.posicoes.length === 1 ? "posição" : "posições"}`}
                        </span>
                      </span>
                    </span>
                    <span className="px-1 py-3 text-center text-15 font-bold whitespace-nowrap tabular-nums">
                      {group.total}
                    </span>
                    <span className="px-1 py-3 text-center text-15 font-bold tabular-nums">
                      {group.percentual}
                    </span>
                    <span />
                  </button>
                </th>
              </tr>
            </tbody>
            {/* Os ativos da classe: deslizam para dentro ao abrir e recolhem ao fechar. */}
            <tbody id={`${id}-${i}`} inert={!expanded}>
              {group.posicoes.map((p) => (
                <tr key={p.id} className={slideRowClass(expanded)}>
                  <SlideCell open={expanded} header className={cn(cell, "text-left")}>
                    <span className="flex flex-col leading-[1.35]">
                      <Link
                        href={`/investimentos/${p.slug}`}
                        className="text-16 font-bold text-sand underline decoration-line-strong underline-offset-3"
                      >
                        {p.nome}
                      </Link>
                      <span className="text-13 text-mist">{p.descricao}</span>
                    </span>
                  </SlideCell>
                  <SlideCell open={expanded} className={cell}>
                    {p.classe}
                  </SlideCell>
                  <SlideCell open={expanded} className={cell}>
                    {p.instrumento}
                  </SlideCell>
                  <SlideCell open={expanded} className={cell}>
                    <RiskBadge risk={p.risco} />
                  </SlideCell>
                  <SlideCell open={expanded} className={cell}>
                    <OriginInfo origin={p.origem} />
                  </SlideCell>
                  <SlideCell
                    open={expanded}
                    className={cn(
                      cell,
                      "tabular-nums",
                      p.quantidade ? "text-sand" : "text-caption",
                    )}
                  >
                    {p.quantidade ?? "—"}
                  </SlideCell>
                  <SlideCell
                    open={expanded}
                    className={cn(
                      cell,
                      "tabular-nums",
                      p.precoMedio ? "text-sand" : "text-caption",
                    )}
                  >
                    {p.precoMedio ?? "—"}
                  </SlideCell>
                  <SlideCell
                    open={expanded}
                    className={cn(cell, "font-bold whitespace-nowrap tabular-nums")}
                  >
                    {p.total}
                    {p.totalOriginal && (
                      <span className="block text-13 font-normal text-mist">{p.totalOriginal}</span>
                    )}
                  </SlideCell>
                  <SlideCell open={expanded} className={cn(cell, "text-soft tabular-nums")}>
                    {p.percentual}
                  </SlideCell>
                  <SlideCell open={expanded} className={cell}>
                    <DayChange change={p.hoje} />
                  </SlideCell>
                  <SlideCell open={expanded} className={cn(cell, "pl-1")}>
                    <Link
                      href={`/investimentos/${p.slug}`}
                      aria-label={`Abrir ${p.nome}`}
                      title="Abrir ativo"
                      className="inline-flex size-[2.375rem] items-center justify-center rounded-full border border-line-strong text-sand no-underline"
                    >
                      <Icon name="chevron-right" size={18} />
                    </Link>
                  </SlideCell>
                </tr>
              ))}
            </tbody>
          </Fragment>
        );
      })}
      <tbody>
        <tr>
          <th
            scope="row"
            colSpan={7}
            className="border-b border-line-strong px-3.5 py-4 text-left text-15 font-normal text-mist"
          >
            Outras {portfolio.outras.quantidade} posições{" "}
            <span className="text-caption">· abra a lista completa para ver cada uma</span>
          </th>
          <td className="border-b border-line-strong px-3.5 py-4 text-center text-15 font-bold whitespace-nowrap tabular-nums">
            {portfolio.outras.total}
          </td>
          <td className="border-b border-line-strong px-3.5 py-4 text-center text-15 text-soft tabular-nums">
            {portfolio.outras.percentual}
          </td>
          <td className="border-b border-line-strong" colSpan={2} />
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th
            scope="row"
            colSpan={7}
            className="px-3.5 pt-4.5 pb-1 text-left font-display text-18 font-bold"
          >
            Total da carteira
          </th>
          {/* Centralizado na coluna Total; se o Fraunces 20 passar da largura, sobra igual dos dois lados. */}
          <td className="px-3.5 pt-4.5 pb-1 font-display text-20 font-extrabold whitespace-nowrap tabular-nums">
            <span className="flex justify-center">{portfolio.patrimonio}</span>
          </td>
          <td className="px-3.5 pt-4.5 pb-1 text-center text-16 font-bold tabular-nums">100%</td>
          <td colSpan={2} />
        </tr>
      </tfoot>
    </table>
  );
}
