"use client";

import Link from "next/link";
import { useState } from "react";

import type { ScreenState } from "@/components/states/screen-state";
import { ErrorBlocks, StateBlock, StateSwap } from "@/components/states/state-block";
import { StatusToast } from "@/components/states/status-toast";
import { ButtonLink } from "@/components/ui/button";
import { filterChipClass } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

import { savedSimulations, type SavedSimulation } from "../saved";

const filters = ["Todas", "Aposentadoria", "Objetivo", "Corte de gasto"] as const;

/**
 * Filtro por tipo e a lista das simulações salvas (duas colunas no desktop). Excluir tira a
 * simulação da lista e mostra o aviso com "Desfazer" (`?estado=excluida` abre já com
 * "Aposentadoria aos 60" excluída).
 */
export function SavedSimulationList({ state }: { state?: ScreenState | null }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todas");
  const [deleted, setDeleted] = useState<SavedSimulation | null>(() =>
    state === "excluida"
      ? (savedSimulations.find((s) => s.id === "aposentadoria-60") ?? null)
      : null,
  );
  const [removed, setRemoved] = useState<string[]>(deleted ? [deleted.id] : []);
  const items =
    state === "vazio"
      ? []
      : savedSimulations.filter(
          (s) => !removed.includes(s.id) && (filter === "Todas" || s.tipo === filter),
        );
  const remove = (item: SavedSimulation) => {
    setRemoved((ids) => [...ids, item.id]);
    setDeleted(item);
  };
  const undo = () => {
    if (deleted) setRemoved((ids) => ids.filter((id) => id !== deleted.id));
    setDeleted(null);
  };
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
      {state === "vazio" ? (
        <div className="flex min-h-62 flex-col rounded-bubble border border-line bg-card px-4 py-3.5 @desk:min-h-75">
          <StateBlock
            icon="sliders"
            title="Nenhuma simulação salva"
            action={
              <ButtonLink href="/simulador" variant="forest" size="md" className="text-15">
                <span>Abrir o simulador</span>
              </ButtonLink>
            }
          >
            Simule aposentadoria, um objetivo ou um corte de gasto e salve para comparar depois.
          </StateBlock>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 @desk:grid @desk:grid-cols-2 @desk:gap-4">
          {items.map((s) => (
            <SavedRow key={s.id} item={s} failed={state === "erro"} onDelete={() => remove(s)} />
          ))}
        </ul>
      )}
      {deleted && (
        <StatusToast
          key={deleted.id}
          tone="neutral"
          icon="trash"
          title={`“${deleted.nome}” excluída`}
          position="bottom"
          action={
            <button
              type="button"
              onClick={undo}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong bg-card px-4.5 text-14 font-bold whitespace-nowrap text-sand hover:bg-shade"
            >
              <Icon name="retry" size={18} />
              <span>Desfazer</span>
            </button>
          }
        >
          Dá para desfazer por 10 segundos.
        </StatusToast>
      )}
    </>
  );
}

function SavedRow({
  item: s,
  failed,
  onDelete,
}: {
  item: SavedSimulation;
  failed?: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-bubble border border-line bg-card px-4 py-3.5">
      <StateSwap
        replacement={failed && <ErrorBlocks mobile="tile" tablet="compact" />}
        className="grow flex-row items-center gap-3 self-stretch"
        overlayClassName="items-center"
      >
        <SavedRowContent item={s} onDelete={onDelete} />
      </StateSwap>
    </li>
  );
}

function SavedRowContent({ item: s, onDelete }: { item: SavedSimulation; onDelete: () => void }) {
  return (
    <>
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
      <IconButton icon="trash" label={`Excluir simulação ${s.nome}`} onClick={onDelete} />
    </>
  );
}
