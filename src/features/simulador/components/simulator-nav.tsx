import Link from "next/link";

import { segmentItemClass, segmentTrackClass } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

import { simulators, type SimulatorId } from "../data";

/** Troca o tipo de simulação: pílulas no mobile; trilho segmentado a partir do tablet. */
export function SimulatorNav({ current }: { current: SimulatorId }) {
  return (
    <>
      <nav aria-label="Tipo de simulação" className="flex gap-2 overflow-hidden @tab:hidden">
        {simulators.map((item) => {
          const active = item.id === current;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : "false"}
              className={cn(
                "flex h-[2.625rem] shrink-0 items-center rounded-full border px-3 text-14 whitespace-nowrap no-underline",
                active
                  ? "border-sand bg-sand font-bold text-canvas"
                  : "border-line bg-card font-medium text-mist",
              )}
            >
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Tipo de simulação" className={cn("hidden @tab:flex", segmentTrackClass)}>
        {simulators.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={item.id === current ? "page" : "false"}
            className={cn("flex-1", segmentItemClass(item.id === current))}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
