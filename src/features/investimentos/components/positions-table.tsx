import Link from "next/link";
import { Fragment } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { portfolio, positionGroups } from "../data";
import { DayChange, OriginInfo, RiskBadge, SortArrows } from "./position-parts";

const th =
  "border-b border-line-strong px-3.5 pb-3 text-13 font-bold tracking-[.05em] whitespace-nowrap text-mist uppercase";
const td = "border-b border-line px-3.5 py-3.5 align-middle text-15";

const columns = ["17%", "9%", "10%", "8%", "12%", "7%", "8%", "9%", "8%", "8%", "4%"];

/** Tabela de posições agrupada por classe (desktop). */
export function PositionsTable() {
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
          <th scope="col" className={cn(th, "text-left")}>
            Ativo
          </th>
          <th scope="col" className={cn(th, "text-left")}>
            Classe
          </th>
          <th scope="col" className={cn(th, "text-left")}>
            Instrumento
          </th>
          <th scope="col" className={cn(th, "text-left")}>
            Risco
            <span
              title="Risco calculado pelo cadastro do ativo: volatilidade, risco de crédito e liquidez. Você pode ajustar."
              aria-label="Como o risco é calculado"
              className="ml-1.5 inline-flex align-[-2px] text-caption"
            >
              <Icon name="info" size={14} />
            </span>
          </th>
          <th scope="col" className={cn(th, "text-left")}>
            Origem
          </th>
          <th scope="col" className={cn(th, "text-right")}>
            Quantidade
          </th>
          <th scope="col" className={cn(th, "text-right")}>
            Preço médio
          </th>
          <th scope="col" aria-sort="descending" className={cn(th, "text-right")}>
            <button
              type="button"
              aria-label="Ordenar por total, ordenado do maior para o menor"
              className="-mx-2 -my-1.5 inline-flex items-center gap-1.5 rounded-lg border-none bg-shade px-2 py-1.5 tracking-[inherit] text-sand uppercase"
            >
              Total
              <SortArrows active />
            </button>
          </th>
          <th scope="col" aria-sort="none" className={cn(th, "text-right")}>
            <button
              type="button"
              aria-label="Ordenar por % da carteira"
              className="-mx-2 -my-1.5 inline-flex items-center gap-1.5 rounded-lg border-none bg-transparent px-2 py-1.5 tracking-[inherit] text-mist uppercase"
            >
              % da carteira
              <SortArrows active={false} />
            </button>
          </th>
          <th scope="col" className={cn(th, "text-right")}>
            Hoje
          </th>
          <th scope="col" className={cn(th, "w-[1%] text-right")}>
            <span className="sr-only">Abrir ativo</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {positionGroups.map((group) => (
          <Fragment key={group.classe}>
            <tr>
              <td colSpan={11} className="pt-2 pb-1.5">
                <div className="relative isolate grid grid-cols-[71fr_9fr_8fr_12fr] items-center overflow-hidden rounded-[0.875rem] border border-sand/25 bg-mata">
                  {/* eslint-disable-next-line @next/next/no-img-element -- textura decorativa */}
                  <img
                    src="/images/marca/faixa-tucano.jpg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 block size-full object-cover object-right"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,17,14,0.85)_0%,rgba(11,17,14,0.55)_55%,rgba(11,17,14,0.2)_100%)]"
                  />
                  <span role="rowheader" className="px-3.5 py-3 text-15 font-bold text-sand">
                    {group.classe}{" "}
                    <span className="font-normal text-mist">
                      · {group.posicoes.length}{" "}
                      {group.posicoes.length === 1 ? "posição" : "posições"}
                    </span>
                  </span>
                  <span className="px-3.5 py-3 text-right text-15 font-bold whitespace-nowrap tabular-nums">
                    {group.total}
                  </span>
                  <span className="px-3.5 py-3 text-right text-15 font-bold tabular-nums">
                    {group.percentual}
                  </span>
                  <span />
                </div>
              </td>
            </tr>
            {group.posicoes.map((p) => (
              <tr key={p.id}>
                <th scope="row" className={cn(td, "text-left font-normal")}>
                  <span className="flex flex-col leading-[1.35]">
                    <Link
                      href={`/investimentos/${p.slug}`}
                      className="text-16 font-bold text-sand underline decoration-line-strong underline-offset-3"
                    >
                      {p.nome}
                    </Link>
                    <span className="text-13 text-mist">{p.descricao}</span>
                  </span>
                </th>
                <td className={td}>{p.classe}</td>
                <td className={td}>{p.instrumento}</td>
                <td className={td}>
                  <RiskBadge risk={p.risco} />
                </td>
                <td className={td}>
                  <OriginInfo origin={p.origem} />
                </td>
                <td
                  className={cn(
                    td,
                    "text-right tabular-nums",
                    p.quantidade ? "text-sand" : "text-caption",
                  )}
                >
                  {p.quantidade ?? "—"}
                </td>
                <td
                  className={cn(
                    td,
                    "text-right tabular-nums",
                    p.precoMedio ? "text-sand" : "text-caption",
                  )}
                >
                  {p.precoMedio ?? "—"}
                </td>
                <td className={cn(td, "text-right font-bold tabular-nums")}>{p.total}</td>
                <td className={cn(td, "text-right text-soft tabular-nums")}>{p.percentual}</td>
                <td className={cn(td, "text-right")}>
                  <DayChange change={p.hoje} />
                </td>
                <td className={cn(td, "pl-1 text-right")}>
                  <Link
                    href={`/investimentos/${p.slug}`}
                    aria-label={`Abrir ${p.nome}`}
                    title="Abrir ativo"
                    className="inline-flex size-[2.375rem] items-center justify-center rounded-full border border-line-strong text-sand no-underline"
                  >
                    <Icon name="chevron-right" size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
        <tr>
          <th
            scope="row"
            colSpan={7}
            className="border-b border-line-strong px-3.5 py-4 text-left text-15 font-normal text-mist"
          >
            Outras {portfolio.outras.quantidade} posições{" "}
            <span className="text-caption">· abra &quot;Ver as 12&quot; para ver cada uma</span>
          </th>
          <td className="border-b border-line-strong px-3.5 py-4 text-right text-15 font-bold tabular-nums">
            {portfolio.outras.total}
          </td>
          <td className="border-b border-line-strong px-3.5 py-4 text-right text-15 text-soft tabular-nums">
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
          <td className="px-3.5 pt-4.5 pb-1 text-right font-display text-20 font-extrabold tabular-nums">
            {portfolio.patrimonio}
          </td>
          <td className="px-3.5 pt-4.5 pb-1 text-right text-16 font-bold tabular-nums">100%</td>
          <td colSpan={2} />
        </tr>
      </tfoot>
    </table>
  );
}
