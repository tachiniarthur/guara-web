import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import type { Origin, Position, Risk } from "../data";

const riskStyle: Record<Risk, { bg: string; dot: string; text: string }> = {
  Baixo: { bg: "bg-folha-bg", dot: "bg-folha", text: "text-folha" },
  Médio: { bg: "bg-tucano-bg", dot: "bg-tucano", text: "text-tucano" },
  Alto: { bg: "bg-urucum-bg", dot: "bg-urucum", text: "text-urucum" },
};

const riskHint =
  "Risco calculado pelo cadastro do ativo: volatilidade, risco de crédito e liquidez. Você pode ajustar.";

/** Selo de risco do ativo (clicável para ajustar). */
export function RiskBadge({ risk }: { risk: Risk }) {
  const style = riskStyle[risk];
  return (
    <button
      type="button"
      title={riskHint}
      aria-label={`Risco ${risk}. Ajustar risco`}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border-none pr-2 pl-2.5 text-13 font-bold",
        style.bg,
        style.text,
      )}
    >
      <span aria-hidden="true" className={cn("size-[0.4375rem] rounded-full", style.dot)} />
      {risk}
      <span className="opacity-80">
        <Icon name="chevron-down" size={12} />
      </span>
    </button>
  );
}

/** De onde vem a posição: Open Finance, cadastro manual ou via chat. */
export function OriginInfo({ origin }: { origin: Origin }) {
  const icon = origin.tipo === "open-finance" ? "link" : origin.tipo === "chat" ? "chat" : "user";
  return (
    <span className="inline-flex items-start gap-1.5 text-13 leading-[1.35] text-soft">
      <span className="mt-0.5">
        <Icon name={icon} size={14} />
      </span>
      <span className="flex flex-col whitespace-nowrap">
        {origin.texto}
        {"atualizado" in origin && <span className="text-12 text-mist">{origin.atualizado}</span>}
      </span>
    </span>
  );
}

/** Variação do dia com seta (▲ verde / ▼ urucum). */
export function DayChange({ change, className }: { change: Position["hoje"]; className?: string }) {
  return (
    <span
      className={cn(
        "font-bold whitespace-nowrap tabular-nums",
        change.alta ? "text-folha" : "text-urucum",
        className,
      )}
    >
      <span aria-hidden="true" className="text-11">
        {change.alta ? "▲" : "▼"}
      </span>
      {` ${change.valor}`}
    </span>
  );
}

/** Seta de ordenação (ativa: para baixo em tucano). */
export function SortArrows({ active, size = 14 }: { active: boolean; size?: number }) {
  return (
    <svg
      width={`${size / 16}rem`}
      height={`${size / 16}rem`}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path d="M8 9l4-4 4 4" stroke={active ? "#93A198" : "#BDC6BE"} opacity={active ? 0.45 : 1} />
      <path d="M16 15l-4 4-4-4" stroke={active ? "#F2C230" : "#BDC6BE"} />
    </svg>
  );
}
