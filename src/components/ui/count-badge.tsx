import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-5.5 min-w-5.5 rounded-[0.6875rem] px-1.75 text-12",
  md: "h-6 min-w-6 rounded-xl px-1.75 text-12",
  lg: "h-7 min-w-7 rounded-[0.875rem] px-2 text-14",
} as const;

/** Contador em urucum (pendências, alertas novos). */
export function CountBadge({
  count,
  label,
  size = "md",
  className,
}: {
  count: number;
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-urucum font-extrabold text-canvas",
        sizes[size],
        className,
      )}
    >
      {count}
    </span>
  );
}
