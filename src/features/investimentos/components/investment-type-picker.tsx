"use client";

import { useState } from "react";

import { investmentTypes, type InvestmentType } from "@/features/investimentos/data";
import { cn } from "@/lib/utils";

/** Tipo de investimento: pílulas em 2 colunas no mobile; trilho segmentado em 3 colunas a partir do tablet. */
export function InvestmentTypePicker({
  defaultValue = investmentTypes[0],
}: {
  defaultValue?: InvestmentType;
}) {
  const [value, setValue] = useState<InvestmentType>(defaultValue);

  return (
    <div
      role="group"
      aria-label="Tipo de investimento"
      className="grid grid-cols-2 gap-2 @tab:grid-cols-3 @tab:gap-1 @tab:rounded-tile @tab:bg-shade @tab:p-1"
    >
      {investmentTypes.map((type) => {
        const pressed = type === value;
        return (
          <button
            key={type}
            type="button"
            aria-pressed={pressed}
            onClick={() => setValue(type)}
            className={cn(
              "flex h-11 min-w-0 items-center gap-1.5 rounded-full border px-3.5 text-14 font-medium whitespace-nowrap transition-colors @tab:justify-center @tab:border-0 @tab:px-3",
              pressed
                ? "border-sand bg-sand text-canvas @tab:bg-card @tab:font-bold @tab:text-sand @tab:shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                : "border-line bg-card text-mist hover:text-sand @tab:bg-transparent",
            )}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
