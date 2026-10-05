import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

/** Retrato do lobo-guará em círculo verde-mata (logo). */
export function BrandLogo({
  size = 56,
  label,
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      className={cn("block shrink-0 overflow-hidden rounded-full bg-mata", className)}
      style={{ width: rem(size), height: rem(size) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- logo estático */}
      <img
        src="/images/marca/logo-guara.png"
        alt={label ?? ""}
        className="block size-full object-cover"
      />
    </span>
  );
}

/** Logo + nome "guará" na Fraunces. */
export function BrandLockup({
  size = "lg",
  className,
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", size === "lg" ? "gap-3" : "gap-2.5", className)}>
      <BrandLogo
        size={size === "lg" ? 56 : 44}
        label={size === "lg" ? "Lobo-guará, logo do Guará" : undefined}
      />
      <span
        className={cn(
          "font-display font-extrabold tracking-[-0.02em]",
          size === "lg" ? "text-40 leading-[1.05]" : "text-26 leading-[1.1]",
        )}
      >
        guará
      </span>
    </div>
  );
}
