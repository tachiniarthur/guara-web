"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { filterChipClass } from "./chip";

/** Filtro em pílulas das listas (um ativo por vez), como "Todas · Gastos · Conta". */
export function ListFilter({
  options,
  label,
  defaultValue,
  value,
  onChange,
  className,
}: {
  options: string[];
  label: string;
  /** Opção já marcada (a primeira, por padrão). */
  defaultValue?: string;
  /** Opção marcada, quando quem usa controla o filtro. */
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [own, setOwn] = useState(defaultValue ?? options[0]);
  const current = value ?? own;
  const setCurrent = (option: string) => {
    setOwn(option);
    onChange?.(option);
  };
  return (
    <div role="group" aria-label={label} className={cn("flex gap-2", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === current}
          onClick={() => setCurrent(option)}
          className={filterChipClass(option === current)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
