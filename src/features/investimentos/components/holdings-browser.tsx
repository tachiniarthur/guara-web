"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import type { ScreenState } from "@/components/states/screen-state";
import {
  ErrorBlock,
  FilterEmptyBlock,
  StateBlock,
  StateSwap,
  TileErrorBlock,
} from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { dropdownPillClass, filterChipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { PillToggle } from "@/components/ui/pill-toggle";
import { SearchField } from "@/components/ui/search-field";
import { cn } from "@/lib/utils";

import { holdingClasses, holdingsSummary, type Holding, type HoldingOrigin } from "../posicoes";
import { ClassBanner, classBannerClass } from "./position-cards";
import { DayChange, RiskPill } from "./position-parts";

type Grouping = "lista" | "classe";
type OriginFilter = "todas" | HoldingOrigin;

const origins: { value: OriginFilter; label: string }[] = [
  { value: "todas", label: "Todas as origens" },
  { value: "Open Finance", label: "Open Finance" },
  { value: "Cadastro manual", label: "Cadastro manual" },
];

const groupings = [
  { value: "lista", label: "Lista" },
  { value: "classe", label: "Por classe" },
] as const;

const assetHref = (h: Holding) => (h.slug ? `/investimentos/${h.slug}` : undefined);
const riskHref = (h: Holding) => `/investimentos/posicoes?risco=${h.id}`;

function AssetName({ holding: h, size }: { holding: Holding; size: "list" | "table" }) {
  const content = (
    <>
      <strong className={size === "list" ? "text-15" : undefined}>{h.nome}</strong>
      <span
        className={cn(
          "text-12 text-caption",
          size === "list" && "overflow-hidden whitespace-nowrap",
        )}
      >
        {h.descricao}
      </span>
    </>
  );
  const className = cn(
    "flex flex-col text-sand no-underline",
    size === "list" ? "leading-[1.35]" : "leading-[1.3]",
  );
  const href = assetHref(h);
  return href ? (
    <Link href={href} className={cn(className, "hover:underline")}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}

/** Posição no celular: nome, risco e origem à esquerda; total, peso e variação à direita. */
function HoldingRow({ holding: h }: { holding: Holding }) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-3">
      <div className="flex min-w-0 grow flex-col">
        <AssetName holding={h} size="list" />
        <span className="mt-1 flex items-center gap-1.5">
          <RiskPill
            risk={h.risco}
            href={riskHref(h)}
            label={`Risco ${h.risco}. Ajustar risco de ${h.nome}`}
          />
          <span className="text-12 text-caption">{h.origem}</span>
        </span>
      </div>
      <span className="flex shrink-0 flex-col items-end leading-[1.35]">
        <strong className="whitespace-nowrap tabular-nums">{h.total}</strong>
        <span className="text-12 text-mist">{h.percentual} da carteira</span>
        <DayChange change={h.hoje} className="text-13" arrowClassName="text-10" />
      </span>
    </li>
  );
}

function HoldingTableRow({ holding: h }: { holding: Holding }) {
  return (
    <tr className="border-b border-line">
      <td className="px-2 py-2.5">
        <AssetName holding={h} size="table" />
      </td>
      <td className="px-2 py-2.5">
        <RiskPill risk={h.risco} href={riskHref(h)} label={`Ajustar risco de ${h.nome}`} />
      </td>
      <td className="px-2 py-2.5 text-12 text-mist">{h.origem}</td>
      <td className="px-2 py-2.5 text-right font-bold whitespace-nowrap tabular-nums">{h.total}</td>
      <td className="px-2 py-2.5 text-right tabular-nums">{h.percentual}</td>
      <td className="px-2 py-2.5 text-right">
        <DayChange change={h.hoje} className="text-13" arrowClassName="text-10" />
      </td>
    </tr>
  );
}

const columns = [
  { label: "Ativo", align: "left" },
  { label: "Risco", align: "left" },
  { label: "Origem", align: "left" },
  { label: "Total", align: "right" },
  { label: "% carteira", align: "right" },
  { label: "Hoje", align: "right" },
] as const;

const noPositions = (
  <StateBlock
    icon="trending-up"
    title="Nenhuma posição ainda"
    action={
      <ButtonLink href="/investimentos/novo" variant="forest" size="md" className="text-15">
        <span>Adicionar investimento</span>
      </ButtonLink>
    }
  >
    Conecte a corretora pela Malvo ou cadastre seus investimentos à mão.
  </StateBlock>
);

/**
 * Todas as posições com busca, agrupamento (lista ou por classe), ordenação e filtro de
 * origem. No celular, uma lista; a partir do tablet, uma tabela dentro de um card.
 * No vazio e no erro, o card inteiro (tablet e desktop) dá lugar ao aviso, com a mesma altura;
 * no celular, o aviso fica no lugar das listas.
 */
export function HoldingsBrowser({ state }: { state?: ScreenState | null }) {
  const blocked = state === "vazio" || state === "erro";
  if (!blocked) return <HoldingsCard state={state} />;
  return (
    <>
      <div className="contents @tab:hidden">
        <HoldingsCard state={state} />
      </div>
      <div className="hidden @tab:contents">
        <section className="flex min-w-0 flex-col rounded-card border border-line bg-card p-5.5 @desk:p-6">
          <StateSwap
            replacement={state === "erro" ? <ErrorBlock /> : noPositions}
            className="grow gap-3.5"
          >
            <HoldingsCard bare />
          </StateSwap>
        </section>
      </div>
    </>
  );
}

function HoldingsCard({
  state,
  bare,
}: {
  state?: ScreenState | null;
  /** Sem a moldura de card (quando o card fica por fora, no vazio e no erro). */
  bare?: boolean;
}) {
  const [grouping, setGrouping] = useState<Grouping>("classe");
  const [origin, setOrigin] = useState<OriginFilter>("todas");
  const [query, setQuery] = useState(state === "vazio-filtro" ? "Vale" : "");
  const failed = state === "erro";
  const empty = state === "vazio";

  const term = query.trim().toLowerCase();
  const matches = (h: Holding) =>
    (origin === "todas" || h.tipoOrigem === origin) &&
    (!term || `${h.nome} ${h.descricao}`.toLowerCase().includes(term));

  const sections =
    grouping === "classe"
      ? holdingClasses
          .map((c) => ({ ...c, itens: c.itens.filter(matches) }))
          .filter((c) => c.itens.length > 0)
      : [
          {
            classe: "",
            cor: "",
            total: "",
            percentual: "",
            itens: holdingClasses
              .flatMap((c) => c.itens)
              .filter(matches)
              .sort((a, b) => parseFloat(b.percentual) - parseFloat(a.percentual)),
          },
        ];
  const banner = (c: (typeof sections)[number]) =>
    grouping === "classe" ? (
      <ClassBanner
        classe={c.classe}
        total={c.total}
        percentual={c.percentual}
        quantidade={c.itens.length}
        failed={failed}
      />
    ) : null;
  const nothingFound = sections.every((c) => c.itens.length === 0);

  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4 @tab:gap-3.5",
        !bare && "@tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-5.5 @desk:p-6",
      )}
    >
      <div className="contents @desk:grid @desk:grid-cols-[minmax(0,1fr)_auto] @desk:items-center @desk:gap-4">
        <SearchField
          label="Buscar por nome ou código (ex.: HGLG11)"
          size="list"
          value={query}
          onValueChange={setQuery}
        />
        <div className="contents @desk:flex @desk:items-center @desk:justify-end @desk:gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 @desk:contents">
            <PillToggle
              label="Agrupar"
              options={groupings}
              value={grouping}
              onChange={setGrouping}
            />
            <button type="button" className={dropdownPillClass}>
              <Icon name="sort" size={16} />
              Maior valor
              <Icon name="chevron-down" size={14} />
            </button>
          </div>
          <div
            role="group"
            aria-label="Origem"
            className="-mr-4 flex gap-2 overflow-hidden @desk:mr-0 @desk:flex-wrap @desk:overflow-visible"
          >
            {origins.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={origin === o.value}
                onClick={() => setOrigin(o.value)}
                className={filterChipClass(origin === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Celular: lista (no vazio e na busca sem resultado, um aviso na faixa do tucano). */}
      {empty || nothingFound ? (
        <div className={cn("flex flex-col @tab:hidden", classBannerClass, empty ? "" : "min-h-85")}>
          {empty ? (
            noPositions
          ) : (
            <FilterEmptyBlock onClear={() => setQuery("")}>
              {`Nenhuma posição com “${query.trim()}”. Tente outro nome ou ticker.`}
            </FilterEmptyBlock>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1 @tab:hidden">
          {sections.map((c) => (
            <div key={c.classe} className="contents">
              {banner(c)}
              <StateSwap
                replacement={failed && (c.itens.length >= 4 ? <ErrorBlock /> : <TileErrorBlock />)}
              >
                <ul className="m-0 flex list-none flex-col p-0">
                  {c.itens.map((h) => (
                    <HoldingRow key={h.id} holding={h} />
                  ))}
                </ul>
              </StateSwap>
            </div>
          ))}
        </div>
      )}

      {/* Tablet e desktop: tabela. */}
      <table className={cn("hidden w-full border-collapse text-14", !nothingFound && "@tab:table")}>
        <thead>
          <tr className="border-b border-line-strong">
            {columns.map((col) => (
              <th
                key={col.label}
                scope="col"
                className={cn(
                  "px-2 py-2.5 text-12 font-bold text-caption",
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((c) => (
            <TableSection key={c.classe} banner={banner(c)} itens={c.itens} />
          ))}
        </tbody>
      </table>

      {nothingFound && !empty && (
        <FilterEmptyBlock onClear={() => setQuery("")} className="hidden @tab:flex">
          {`Nenhuma posição com “${query.trim()}”. Tente outro nome ou ticker.`}
        </FilterEmptyBlock>
      )}

      <div
        className={cn(
          "flex items-baseline justify-between border-t border-line-strong pt-3.5",
          (empty || nothingFound) && "@max-tab:hidden",
        )}
      >
        <strong className="font-display text-17">Total da carteira</strong>
        <span className="font-display text-22 leading-[1.1] font-extrabold tracking-[-0.01em] text-sand tabular-nums">
          {holdingsSummary.total}
        </span>
      </div>
    </section>
  );
}

function TableSection({ banner, itens }: { banner: ReactNode; itens: Holding[] }) {
  return (
    <>
      {banner && (
        <tr>
          <td colSpan={6} className="px-0 pt-2 pb-1">
            {banner}
          </td>
        </tr>
      )}
      {itens.map((h) => (
        <HoldingTableRow key={h.id} holding={h} />
      ))}
    </>
  );
}
