"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/** Alternância em pílulas sobre trilho rebaixado (34px), a opção atual em areia. */
export function PillToggle<T extends string>({
  options,
  label,
  defaultValue,
  value,
  onChange,
  textClassName = "text-14",
  className,
  itemClassName,
}: {
  options: readonly { value: T; label: string }[];
  label: string;
  defaultValue?: T;
  /** Valor controlado (com `onChange`). */
  value?: T;
  onChange?: (value: T) => void;
  /** Corpo do texto (14px por padrão). */
  textClassName?: string;
  className?: string;
  /** Ajuste de cada opção (ex.: `flex-1` para ocupar a largura toda). */
  itemClassName?: string;
}) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? own;
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex gap-1 self-start rounded-full bg-field p-1", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={current === option.value}
          onClick={() => {
            setOwn(option.value);
            onChange?.(option.value);
          }}
          className={cn(
            "flex h-8.5 items-center justify-center rounded-full border-none px-3.5 font-semibold whitespace-nowrap transition-colors",
            textClassName,
            itemClassName,
            current === option.value
              ? "bg-sand text-canvas"
              : "bg-transparent text-mist hover:text-sand",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
