import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { portfolio, positionGroups, type Position } from "../data";
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
  return (
    <>
      <div className="flex flex-col gap-3">
        {positionGroups.map((group) => (
          <div key={group.classe} className="flex flex-col gap-2">
            <div className="mt-1.5 flex items-baseline justify-between gap-2 rounded-[0.875rem] border border-sand/25 bg-[linear-gradient(90deg,rgba(11,17,14,0.82)_0%,rgba(11,17,14,0.55)_55%,rgba(11,17,14,0.2)_100%),url(/images/marca/faixa-tucano.jpg)] bg-cover bg-right px-3.5 py-3">
              <h3 className="m-0 text-15 font-bold">{group.classe}</h3>
              <span className="text-14 whitespace-nowrap text-soft tabular-nums">
                <strong className="text-sand">{group.total}</strong> · {group.percentual}
              </span>
            </div>
            <div
              className={cn(
                "grid items-start gap-2",
                columns === 2 ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {group.posicoes.map((p) => (
                <PositionCard key={p.id} position={p} open={p.id === "petr4"} />
              ))}
            </div>
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
