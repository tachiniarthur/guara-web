import Link from "next/link";

import { inlineLinkClass } from "@/components/ui/text-link";
import { cn } from "@/lib/utils";

import type { TetoMilestone, TetoProgress } from "../data";

const fill: Record<TetoProgress["estado"], string> = {
  tranquilo: "bg-arara",
  atenção: "bg-tucano",
  apertado: "bg-urucum",
};

const stateText: Record<TetoProgress["estado"], string> = {
  tranquilo: "font-medium text-caption",
  atenção: "font-bold text-tucano",
  apertado: "font-bold text-urucum",
};

type TetoBarProps = {
  percentual: number;
  estado: TetoProgress["estado"];
  marcos: TetoMilestone[];
  /** "lg": trilho de 16px e rótulos de 15px (prévia do formulário no desktop). */
  size?: "sm" | "lg";
};

/** Trilho do teto com os marcos de aviso (✓ quando já disparados). */
export function TetoBar({ percentual, estado, marcos, size = "sm" }: TetoBarProps) {
  const lg = size === "lg";
  return (
    <div className={cn("relative", lg ? "h-11.5" : "h-8.5")}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 bg-line",
          lg ? "h-4 rounded-lg" : "h-2.5 rounded-[0.3125rem]",
        )}
      />
      <div
        className={cn("absolute top-0 left-0 h-2.5 rounded-[0.3125rem]", fill[estado])}
        style={{ width: `${percentual.toFixed(1)}%` }}
      />
      {marcos.map((marco) => {
        const end = marco.percentual >= 100;
        return (
          <span key={marco.percentual}>
            <span
              aria-hidden="true"
              className={cn(
                "absolute w-0.5 rounded-[1px]",
                lg ? "-top-1 h-6" : "-top-[3px] h-4",
                marco.atingido ? "bg-sand" : "bg-line-strong",
              )}
              style={{ left: `calc(${marco.percentual.toFixed(2)}% - 1px)` }}
            />
            <span
              className={cn(
                "absolute whitespace-nowrap tabular-nums",
                lg ? "top-6 text-15" : "top-4 text-12",
                end ? "-translate-x-full" : "-translate-x-1/2",
                marco.atingido ? "text-mist" : "text-caption",
              )}
              style={{ left: `${marco.percentual.toFixed(2)}%` }}
            >
              {marco.atingido ? `✓ ${marco.rotulo}` : marco.rotulo}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Teto de uma categoria: gasto × teto, trilho com marcos e o estado do mês. */
export function TetoMeter({ teto }: { teto: TetoProgress }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-15 font-bold">
          <Link href={`/alertas/tetos/${teto.id}`} className={inlineLinkClass}>
            {teto.categoria}
          </Link>
        </span>
        <span className="text-14 text-mist tabular-nums">
          <strong className="text-sand">{teto.gasto}</strong> de {teto.teto}
        </span>
      </div>
      <TetoBar percentual={teto.percentual} estado={teto.estado} marcos={teto.marcos} />
      <span className={cn("inline-flex items-center gap-1.5 text-12", stateText[teto.estado])}>
        {Math.round(teto.percentual)}% · {teto.estado}
      </span>
    </div>
  );
}
