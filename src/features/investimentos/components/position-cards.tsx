"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { StateSwap, TileErrorBlock } from "@/components/states/state-block";
import { Collapse } from "@/components/ui/collapse";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { useInvestimentosData } from "../context";
import type { Position } from "../data";
import { DayChange, OriginInfo, RiskBadge } from "./position-parts";

function Detail({
  label,
  children,
  muted,
}: {
  label: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-13 text-mist">{label}</dt>
      <dd
        className={cn(
          "m-0 text-15 font-semibold tabular-nums",
          muted ? "text-caption" : "text-sand",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/** Faixa com textura de mata que abre cada classe ("Renda fixa · R$ 22.222,10 · 46,0%"). */
/** Faixa do tucano com degradê, fundo das faixas de classe (e dos avisos no lugar delas). */
export const classBannerClass =
  "mt-1.5 rounded-[0.875rem] border border-sand/25 bg-[linear-gradient(90deg,rgba(11,17,14,0.82)_0%,rgba(11,17,14,0.55)_55%,rgba(11,17,14,0.2)_100%),url(/images/marca/faixa-tucano.jpg)] bg-mata bg-cover bg-right px-3.5 py-3";

export function ClassBanner({
  classe,
  total,
  percentual,
  quantidade,
  failed,
  expanded,
  onToggle,
  controls,
}: {
  classe: string;
  total: string;
  percentual: string;
  quantidade?: number;
  /** Erro ao carregar: a faixa mostra o aviso no lugar do total. */
  failed?: boolean;
  /** Com `onToggle`, a faixa vira o botão do accordion da classe (mostra/esconde os ativos). */
  expanded?: boolean;
  onToggle?: () => void;
  /** Id da lista de ativos que a faixa mostra e esconde. */
  controls?: string;
}) {
  // Dentro do botão do accordion o nome não pode ser um título (o botão só aceita texto).
  const Heading = onToggle && !failed ? "span" : "h3";
  const content = (
    <>
      {onToggle && !failed && (
        <Icon
          name="chevron-down"
          size={18}
          className={cn(
            "shrink-0 self-center text-mist transition-transform duration-(--duration-move) ease-out-soft",
            !expanded && "-rotate-90",
          )}
        />
      )}
      <StateSwap
        replacement={failed && <TileErrorBlock />}
        className="grow flex-row items-baseline justify-between gap-2"
        overlayClassName="items-start justify-center"
      >
        <Heading className="m-0 text-15 font-bold">
          {classe}
          {quantidade !== undefined && (
            <span className="font-normal text-mist">
              {` · ${quantidade} ${quantidade === 1 ? "posição" : "posições"}`}
            </span>
          )}
        </Heading>
        <span className="text-14 whitespace-nowrap text-soft tabular-nums">
          <strong className="text-sand">{total}</strong>
          {` · ${percentual}`}
        </span>
      </StateSwap>
    </>
  );
  // Com erro, a faixa mostra o "Tentar de novo" (um botão): ela não pode ser botão também, e não há
  // ativos para mostrar ou esconder.
  if (!onToggle || failed) {
    return (
      <div className={cn("flex items-baseline justify-between gap-2", classBannerClass)}>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "flex w-full pressable items-baseline gap-2 text-left text-sand",
        classBannerClass,
      )}
    >
      {content}
    </button>
  );
}

/** Classes recolhidas no accordion de posições (todas abertas ao entrar). */
export function useClosedGroups() {
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const toggle = (classe: string) =>
    setClosed((current) => {
      const next = new Set(current);
      if (next.has(classe)) next.delete(classe);
      else next.add(classe);
      return next;
    });
  return [closed, toggle] as const;
}

/** Posição em card expansível: valor e variação no resumo; classe, risco e origem ao abrir. */
function PositionCard({ position: p, open }: { position: Position; open?: boolean }) {
  return (
    <details
      open={open}
      className="group overflow-hidden rounded-[1.125rem] border border-line bg-field"
    >
      <summary className="flex min-h-[4.5rem] cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 grow flex-col leading-[1.35]">
          <strong className="text-16">{p.nome}</strong>
          <span className="text-13 text-mist">{p.descricao}</span>
        </span>
        <span className="flex flex-col items-end leading-[1.35]">
          <strong className="text-16 whitespace-nowrap tabular-nums">{p.total}</strong>
          <DayChange change={p.hoje} className="text-14" />
        </span>
        <span aria-hidden="true" className="text-mist group-open:rotate-180">
          <Icon name="chevron-down" size={18} />
        </span>
      </summary>
      <div className="flex flex-col gap-3.5 px-4 pt-1 pb-4">
        <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
          <Detail label="Classe">{p.classe}</Detail>
          <Detail label="Instrumento">{p.instrumento}</Detail>
          <div className="flex flex-col gap-1">
            <dt className="text-13 text-mist">Risco</dt>
            <dd className="m-0">
              <RiskBadge risk={p.risco} />
            </dd>
          </div>
          <Detail label="% da carteira">{p.percentual}</Detail>
          <Detail label="Quantidade" muted={!p.quantidade}>
            {p.quantidade ?? "—"}
          </Detail>
          <Detail label="Preço médio" muted={!p.precoMedio}>
            {p.precoMedio ?? "—"}
          </Detail>
        </dl>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <OriginInfo origin={p.origem} />
          <Link
            href={`/investimentos/${p.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-sand px-3.5 text-14 font-bold whitespace-nowrap text-canvas no-underline"
          >
            Abrir ativo
            <Icon name="chevron-right" size={16} />
          </Link>
        </div>
      </div>
    </details>
  );
}

/** Posições por classe em cards (tablet: 2 colunas; mobile: 1). */
export function PositionCards({ columns }: { columns: 1 | 2 }) {
  const { portfolio, positionGroups } = useInvestimentosData();
  const [closed, toggle] = useClosedGroups();
  const id = useId();
  return (
    <>
      <div className="flex flex-col gap-3">
        {positionGroups.map((group, i) => (
          <div key={group.classe} className="flex flex-col">
            <ClassBanner
              classe={group.classe}
              total={group.total}
              percentual={group.percentual}
              expanded={!closed.has(group.classe)}
              onToggle={() => toggle(group.classe)}
              controls={`${id}-${i}`}
            />
            <Collapse open={!closed.has(group.classe)} className="pt-2">
              <div
                id={`${id}-${i}`}
                className={cn(
                  "grid items-start gap-2",
                  columns === 2 ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                {group.posicoes.map((p) => (
                  <PositionCard key={p.id} position={p} open={p.id === "petr4"} />
                ))}
              </div>
            </Collapse>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line px-0.5 py-3 text-14 text-mist">
        <span>Outras {portfolio.outras.quantidade} posições</span>
        <span className="whitespace-nowrap tabular-nums">
          <strong className="text-sand">{portfolio.outras.total}</strong> ·{" "}
          {portfolio.outras.percentual}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2 border-t border-line-strong px-0.5 pt-3">
        <span className="font-display text-17 font-bold">Total da carteira</span>
        <span className="font-display text-20 font-extrabold whitespace-nowrap tabular-nums">
          {portfolio.patrimonio}
        </span>
      </div>
      <p className="m-0 text-13 leading-normal text-mist">
        Toque numa posição para ver classe, instrumento, risco, quantidade e preço médio. O risco
        vem do cadastro do ativo (volatilidade, crédito e liquidez) e pode ser ajustado.
      </p>
    </>
  );
}
