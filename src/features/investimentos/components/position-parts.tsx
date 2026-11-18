import Link from "next/link";

import { BankMark } from "@/components/ui/bank-mark";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import type { Origin, Position, Risk } from "../types";

const riskStyle: Record<Risk, { bg: string; dot: string; text: string }> = {
  Baixo: { bg: "bg-folha-bg", dot: "bg-folha", text: "text-folha" },
  Médio: { bg: "bg-tucano-bg", dot: "bg-tucano", text: "text-tucano" },
  Alto: { bg: "bg-urucum-bg", dot: "bg-urucum", text: "text-urucum" },
};

const riskHint =
  "Risco padrão do tipo de investimento. Dá para ajustar na lista de posições ou na página do ativo.";

/** Selo de risco do ativo (só leitura; o ajuste fica no `RiskPill` e na página do ativo). */
export function RiskBadge({ risk }: { risk: Risk }) {
  const style = riskStyle[risk];
  return (
    <span
      title={riskHint}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-13 font-bold",
        style.bg,
        style.text,
      )}
    >
      <span aria-hidden="true" className={cn("size-[0.4375rem] rounded-full", style.dot)} />
      {risk}
    </span>
  );
}

/** Selo de risco compacto das listas de posições: leva ao diálogo "Ajustar risco". */
export function RiskPill({ risk, href, label }: { risk: Risk; href: string; label: string }) {
  const style = riskStyle[risk];
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      title={riskHint}
      className={cn(
        "inline-flex h-6.5 items-center gap-1 rounded-full px-2 text-12 font-bold no-underline",
        style.bg,
        style.text,
      )}
    >
      {risk}
      <Icon name="chevron-down" size={12} strokeWidth={2} />
    </Link>
  );
}

/** De onde vem a posição: Open Finance ou cadastro manual. */
export function OriginInfo({ origin }: { origin: Origin }) {
  return (
    <span className="inline-flex items-start gap-1.5 text-13 leading-[1.35] text-soft">
      {origin.tipo === "open-finance" ? (
        // Conta de banco: a marca do banco no lugar do ícone ("Itaú · Open Finance").
        <BankMark bank={origin.texto.split(" · ")[0] ?? origin.texto} size={16} className="mt-px" />
      ) : (
        <span className="mt-0.5">
          <Icon name="user" size={14} />
        </span>
      )}
      <span className="flex flex-col whitespace-nowrap">
        {origin.texto}
        {"atualizado" in origin && <span className="text-12 text-mist">{origin.atualizado}</span>}
      </span>
    </span>
  );
}

/** Rentabilidade sobre o custo com seta (▲ verde / ▼ urucum). */
export function ReturnChange({
  change,
  className,
  arrowClassName = "text-11",
}: {
  change: Position["rentabilidade"];
  className?: string;
  arrowClassName?: string;
}) {
  // Sem variação conhecida: só o travessão, sem seta nem cor.
  if (change.valor === "—") {
    return <span className={cn("font-bold text-caption tabular-nums", className)}>—</span>;
  }
  return (
    <span
      className={cn(
        "font-bold whitespace-nowrap tabular-nums",
        change.alta ? "text-folha" : "text-urucum",
        className,
      )}
    >
      <span aria-hidden="true" className={arrowClassName}>
        {change.alta ? "▲" : "▼"}
      </span>
      {` ${change.valor}`}
    </span>
  );
}
