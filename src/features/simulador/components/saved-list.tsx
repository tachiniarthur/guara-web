"use client";

import Link from "next/link";
import { useState } from "react";

import { filterChipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

import { savedSimulations, type SavedSimulation } from "../saved";

const filters = ["Todas", "Aposentadoria", "Objetivo", "Corte de gasto"] as const;

/** Filtro por tipo e a lista das simulações salvas (duas colunas no desktop). */
export function SavedSimulationList() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas");
  const items = savedSimulations.filter((s) => filter === "Todas" || s.tipo === filter);
  return (
    <>
      <div className="flex items-center gap-2.5">
        <div
          role="group"
          aria-label="Tipo de simulação"
          className="-mr-4 flex gap-2 overflow-hidden @tab:mr-0 @tab:flex-wrap @tab:overflow-visible"
        >
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
              className={filterChipClass(f === filter)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0 @desk:grid @desk:grid-cols-2 @desk:gap-4">
        {items.map((s) => (
          <SavedRow key={s.id} item={s} />
        ))}
      </ul>
    </>
  );
}

function SavedRow({ item: s }: { item: SavedSimulation }) {
  return (
    <li className="flex items-center gap-3 rounded-bubble border border-line bg-card px-4 py-3.5">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-arara-bg text-arara"
      >
        <Icon name={s.icone} size={20} />
      </span>
      <Link
        href={s.href}
        className={cn("flex min-w-0 grow flex-col leading-[1.35] text-sand no-underline")}
      >
        <span className="text-12 font-bold tracking-[.06em] text-caption uppercase">{s.tipo}</span>
        <strong className="text-16">{s.nome}</strong>
        <span className="text-13 text-mist">
          <strong className="text-sand">{s.valor}</strong>
          {` · ${s.resumo}`}
        </span>
        <span className="text-12 text-caption">{s.salva}</span>
      </Link>
      <IconButton icon="trash" label={`Excluir simulação ${s.nome}`} />
    </li>
  );
}
