import type { ReactNode } from "react";

import { Note } from "@/components/ui/note";
import { cn } from "@/lib/utils";

/** Escala das barras de alocação: 0 a 50% da carteira. */
const SCALE_MAX = 50;

function Row({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between", className)}>
      <span className="text-mist">{label}</span>
      {children}
    </div>
  );
}

function AllocationBar({ label, value, target }: { label: string; value: number; target: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-13">
        <span className="text-mist">{label}</span>
        <strong className="tabular-nums">{value}%</strong>
      </div>
      <div className="relative h-2.5 rounded-full bg-shade">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-urucum"
          style={{ width: `${(value / SCALE_MAX) * 100}%` }}
        />
        <span
          aria-hidden="true"
          className="absolute -top-[3px] -bottom-[3px] w-0.5 bg-sand"
          style={{ left: `${(target / SCALE_MAX) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Prévia da posição que está sendo cadastrada e o efeito dela na carteira. */
export function PositionPreview({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-card border border-line bg-card p-5",
        className,
      )}
    >
      <span className="text-13 font-bold text-mist">Prévia da posição</span>
      <div className="flex flex-col gap-1.5 text-15 tabular-nums">
        <Row
          label={
            <>
              Investido <span className="text-13 text-caption @tab:hidden">(200 × R$ 35,10)</span>
            </>
          }
        >
          <strong>
            <span className="hidden @tab:inline">200 × R$ 35,10 = </span>R$ 7.020,00
          </strong>
        </Row>
        <Row label="Vale hoje">
          <strong>R$ 7.564,00</strong>
        </Row>
        <Row label="Resultado">
          <strong className="text-folha">+R$ 544,00 (+7,7%)</strong>
        </Row>
      </div>
      <div className="my-1 h-px bg-line" />
      <span className="text-13 font-bold text-mist">Efeito na sua carteira</span>
      <Row
        className="text-15 tabular-nums"
        label={
          <>
            <span className="@tab:hidden">Patrimônio depois</span>
            <span className="hidden @tab:inline">Patrimônio investido</span>
          </>
        }
      >
        <strong className="whitespace-nowrap @tab:whitespace-normal">
          <span className="hidden @tab:inline">R$ 48.310,90 → </span>R$ 55.874,90
        </strong>
      </Row>
      <div
        role="img"
        aria-label="Ações passam de 22% para 33% da carteira. Alvo do perfil Moderado: 20%."
        className="flex flex-col gap-2.5"
      >
        <AllocationBar label="Ações hoje" value={22} target={20} />
        <AllocationBar label="Ações com PETR4" value={33} target={20} />
        <span className="flex items-center gap-1.5 text-12 text-caption">
          <span aria-hidden="true" className="h-3 w-0.5 bg-sand" />
          Alvo do perfil Moderado: 20%
        </span>
      </div>
      <Note icon="alert-triangle" tone="warning">
        Com esta compra, ações ficam <strong>13 p.p. acima</strong> do alvo do seu perfil. Você pode
        salvar mesmo assim ou pedir ao Pacu uma sugestão de rebalanceamento.
      </Note>
    </section>
  );
}
