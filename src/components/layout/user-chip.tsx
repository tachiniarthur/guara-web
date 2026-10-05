import { rem } from "@/lib/rem";
import { cn } from "@/lib/utils";

/** Iniciais do usuário em círculo amarelo-tucano. */
export function UserInitials({
  initials,
  size = 44,
  className,
}: {
  initials: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-tucano font-display font-extrabold text-canvas",
        className,
      )}
      style={{ width: rem(size), height: rem(size), fontSize: rem(Math.round(size * 0.37)) }}
    >
      {initials}
    </span>
  );
}
