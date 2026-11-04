"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { segmentItemClass, segmentTrackClass } from "./chip";
import { SlidingGroup } from "./sliding-group";

/** Escolha única em trilho segmentado (raio 16, opção atual em card), como "Tamanho do texto". */
export function SegmentedTiles<T extends string>({
  label,
  options,
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  itemClassName,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  defaultValue?: T;
  /** Controlado: a opção vem de fora (com `onValueChange`). */
  value?: T;
  onValueChange?: (value: T) => void;
  className?: string;
  itemClassName?: string;
}) {
  const [own, setOwn] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const value = controlled ?? own;
  const setValue = (next: T) => {
    setOwn(next);
    onValueChange?.(next);
  };
  return (
    <SlidingGroup
      active={value}
      indicatorClassName="bg-card shadow-[0_1px_2px_rgba(0,0,0,.08)]"
      aria-label={label}
      className={cn("flex", segmentTrackClass, className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => setValue(option.value)}
          className={cn(
            "flex-1 border-none",
            segmentItemClass(option.value === value),
            itemClassName,
          )}
        >
          {option.label}
        </button>
      ))}
    </SlidingGroup>
  );
}
