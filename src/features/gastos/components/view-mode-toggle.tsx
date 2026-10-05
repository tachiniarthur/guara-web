"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const modes = ["Consolidado", "Por banco"] as const;

/**
 * Consolidado × por banco.
 * "card": trilho com cantos de 16 e opção ativa em card (desktop e tablet) · "pill": opção ativa em areia (mobile).
 */
export function ViewModeToggle({ appearance }: { appearance: "card" | "pill" }) {
  const [mode, setMode] = useState<(typeof modes)[number]>("Consolidado");

  if (appearance === "pill") {
    return (
      <div
        role="group"
        aria-label="Visão"
        className="flex gap-1 self-start rounded-full bg-field p-1"
      >
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={m === mode}
            onClick={() => setMode(m)}
            className={cn(
              "h-9 rounded-full border-none px-4 text-14",
              m === mode
                ? "bg-sand font-bold text-canvas"
                : "bg-transparent font-semibold text-mist",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[16.25rem]">
      <div
        role="group"
        aria-label="Modo de visualização"
        className="flex gap-1 rounded-tile bg-shade p-1"
      >
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={m === mode}
            onClick={() => setMode(m)}
            className={cn(
              "h-9 flex-1 rounded-full border-none px-3 text-14 whitespace-nowrap",
              m === mode
                ? "bg-card font-bold text-sand shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                : "bg-transparent font-medium text-mist",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
