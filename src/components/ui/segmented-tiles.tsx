"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { segmentItemClass, segmentTrackClass } from "./chip";

/** Escolha única em trilho segmentado (raio 16, opção atual em card), como "Tamanho do texto". */
export function SegmentedTiles<T extends string>({
  label,
  options,
  defaultValue,
  className,
  itemClassName,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  defaultValue?: T;
  className?: string;
  itemClassName?: string;
}) {
  const [value, setValue] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  return (
    <div role="group" aria-label={label} className={cn("flex", segmentTrackClass, className)}>
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
    </div>
  );
}
