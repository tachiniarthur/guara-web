import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

export type Tone = "folha" | "tucano" | "urucum" | "arara" | "sand";

const fills: Record<Tone, string> = {
  folha: "bg-folha",
  tucano: "bg-tucano",
  urucum: "bg-urucum",
  arara: "bg-arara",
  sand: "bg-sand",
};

export const toneText: Record<Tone, string> = {
  folha: "text-folha",
  tucano: "text-tucano",
  urucum: "text-urucum",
  arara: "text-arara",
  sand: "text-sand",
};

/** Estado de um teto: até 69% tranquilo, 70–84% atenção, a partir de 85% apertado. */
export function tetoTone(percent: number): Tone {
  if (percent >= 85) return "urucum";
  if (percent >= 70) return "tucano";
  return "folha";
}

type ProgressBarProps = {
  /** 0 a 100. */
  value: number;
  tone?: Tone;
  /** Altura em px (o raio acompanha). */
  height?: 6 | 8 | 10 | 12 | 14;
  label?: string;
  className?: string;
  trackClassName?: string;
};

export function ProgressBar({
  value,
  tone,
  height = 10,
  label,
  className,
  trackClassName,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("relative bg-shade", trackClassName, className)}
      style={{ height: rem(height), borderRadius: rem(height / 2) }}
    >
      <div
        className={fills[tone ?? tetoTone(pct)]}
        style={{ width: `${pct}%`, height: rem(height), borderRadius: rem(height / 2) }}
      />
    </div>
  );
}
