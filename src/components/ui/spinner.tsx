import { cn } from "@/lib/utils";

/** Anel girando: algo carregando. Para leitores de tela, anuncia `label`. */
export function Spinner({
  size = 40,
  label = "Carregando",
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" className={cn("inline-flex", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="block animate-spin"
      >
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-line" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="36 101"
          className="stroke-tucano"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
