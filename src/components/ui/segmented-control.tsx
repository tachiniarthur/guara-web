"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: ReactNode; ariaLabel?: string };

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  /** Valor inicial (não controlado). */
  defaultValue?: T;
  value?: T;
  onValueChange?: (value: T) => void;
  label: string;
  /** sm: 36px · md: 40px de altura. */
  size?: "sm" | "md";
  className?: string;
  itemClassName?: string;
};

/** Grupo de botões alternáveis em pílula (ex.: "Tudo junto / Por banco", "Mês / Ano"). */
export function SegmentedControl<T extends string>({
  options,
  defaultValue,
  value: controlled,
  onValueChange,
  label,
  size = "md",
  className,
  itemClassName,
}: SegmentedControlProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const value = controlled ?? internal;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex gap-1 rounded-full bg-shade p-1", className)}
    >
      {options.map((option) => {
        const pressed = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            aria-label={option.ariaLabel}
            onClick={() => {
              setInternal(option.value);
              onValueChange?.(option.value);
            }}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full border-none px-4 whitespace-nowrap transition-colors",
              size === "md" ? "h-10 text-14" : "h-9 text-13",
              pressed
                ? "bg-sand font-bold text-canvas"
                : "bg-transparent font-medium text-mist hover:text-sand",
              itemClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
