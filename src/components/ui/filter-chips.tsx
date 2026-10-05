"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { chipClass } from "./chip";
import { Icon, type IconName } from "./icon";

export type FilterChipOption = { value: string; label: string; icon?: IconName };

type FilterChipsProps = {
  options: FilterChipOption[];
  label: string;
  defaultValue?: string;
  /** Botão extra ao fim (ex.: "+ Conectar"). */
  trailing?: ReactNode;
  wrap?: boolean;
  /** Altura: 36px (padrão), 40px ou 44px. */
  size?: "sm" | "base" | "md";
  className?: string;
};

/** Grupo de filtros em pílula (só um ativo por vez). */
export function FilterChips({
  options,
  label,
  defaultValue,
  trailing,
  wrap = true,
  size = "sm",
  className,
}: FilterChipsProps) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value);

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-2", wrap ? "flex-wrap" : "overflow-hidden", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => setValue(option.value)}
          className={chipClass(option.value === value, size)}
        >
          {option.icon && <Icon name={option.icon} size={16} />}
          {option.label}
        </button>
      ))}
      {trailing}
    </div>
  );
}

/** Pílula tracejada para adicionar algo ao grupo (ex.: conectar outro banco). */
export function AddChip({
  icon = "plus",
  children,
  className,
}: {
  icon?: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-transparent px-3 text-14 whitespace-nowrap text-mist hover:text-sand",
        className,
      )}
    >
      <Icon name={icon} size={16} />
      {children}
    </button>
  );
}
