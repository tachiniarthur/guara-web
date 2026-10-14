import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Pares rótulo × valor em linhas com divisória (ex.: "Data · Terça, 23/09"). */
export function DetailList({
  items,
  className,
}: {
  items: { label: ReactNode; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("m-0 flex flex-col text-14", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex justify-between gap-3 border-b border-line py-[0.6875rem]">
          <dt className="text-mist">{item.label}</dt>
          <dd className="m-0 text-right font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Pares em grade de duas colunas (rótulo em cima, valor embaixo). */
export function DetailGrid({
  items,
  className,
}: {
  items: { label: ReactNode; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-caption">{item.label}</dt>
          <dd className="m-0 font-semibold text-sand">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
