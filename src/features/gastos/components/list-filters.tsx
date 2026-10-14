"use client";

import { useState } from "react";

import { dropdownPillClass, filterChipClass } from "@/components/ui/chip";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const banks = ["Todos os bancos", "Nubank", "Itaú"];

/** Filtro por banco das listas completas (um ativo por vez). */
export function BankFilter({ className }: { className?: string }) {
  const [current, setCurrent] = useState(banks[0]);
  return (
    <div role="group" aria-label="Filtrar por banco" className={cn("flex gap-2", className)}>
      {banks.map((bank) => (
        <button
          key={bank}
          type="button"
          aria-pressed={bank === current}
          onClick={() => setCurrent(bank)}
          className={filterChipClass(bank === current)}
        >
          {bank}
        </button>
      ))}
    </div>
  );
}

/** Menu em pílula (ex.: período), com ícone e seta. */
export function DropdownPill({ icon, label }: { icon: IconName; label: string }) {
  return (
    <button type="button" aria-haspopup="listbox" className={dropdownPillClass}>
      <Icon name={icon} size={16} />
      {label}
      <Icon name="chevron-down" size={14} />
    </button>
  );
}

/** Período, categorias e tipo da lista de lançamentos. */
export function TransactionMenus({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DropdownPill icon="calendar" label="Setembro 2026" />
      <DropdownPill icon="tag" label="Categorias" />
      <DropdownPill icon="filter" label="Saídas e entradas" />
    </div>
  );
}
