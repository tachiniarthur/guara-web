"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { filterChipClass } from "./chip";

/** Filtro em pílulas das listas (um ativo por vez), como "Todas · Gastos · Conta". */
export function ListFilter({
  options,
  label,
  defaultValue,
  className,
}: {
  options: string[];
  label: string;
  /** Opção já marcada (a primeira, por padrão). */
  defaultValue?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(defaultValue ?? options[0]);
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
