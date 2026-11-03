import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Interruptor (48×28; "sm": 40×24): trilho amarelo-tucano ligado, bolinha escura à direita. */
export function Switch({
  size = "md",
  className,
  ...props
}: Omit<ComponentProps<"input">, "size" | "type"> & { size?: "md" | "sm" }) {
  const md = size === "md";
  return (
    <span className={cn("relative shrink-0", md ? "h-7 w-12" : "h-6 w-10", className)}>
      <input
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-line-strong transition-colors duration-(--duration-hover) peer-checked:bg-tucano"
      />
      <span
        aria-hidden="true"
        className={cn(
          // A bolinha desliza até o outro lado (e encolhe um pouco enquanto aperta).
          "pointer-events-none absolute top-[3px] left-[3px] rounded-full bg-mist transition-[translate,background-color,scale] duration-(--duration-move) ease-out-soft peer-checked:bg-canvas peer-active:scale-90",
          md ? "size-5.5 peer-checked:translate-x-5" : "size-4.5 peer-checked:translate-x-4",
        )}
      />
    </span>
  );
}

/** Linha com título, descrição e interruptor à direita (alvo de 52px). */
export function SwitchRow({
  id,
  title,
  description,
  defaultChecked,
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex min-h-13 items-center gap-3">
      <label htmlFor={id} className="flex grow cursor-pointer flex-col leading-[1.35]">
        <span className="font-semibold">{title}</span>
        {description && <span className="text-13 text-caption">{description}</span>}
      </label>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}
