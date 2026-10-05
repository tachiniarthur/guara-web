import { cn } from "@/lib/utils";

/** Pílula de filtro (36px; 40px em "base"; 44px em "md"). Ativa em areia. */
export const chipClass = (pressed: boolean, size: "sm" | "base" | "md" = "sm") =>
  cn(
    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 font-sans text-14 font-medium whitespace-nowrap transition-colors",
    size === "sm" ? "h-9" : size === "base" ? "h-10" : "h-11",
    pressed ? "border-sand bg-sand text-canvas" : "border-line bg-card text-mist hover:text-sand",
  );

/** Trilho segmentado em bloco (raio 16): fundo rebaixado com a opção atual em card. */
export const segmentTrackClass = "gap-1 rounded-tile bg-shade p-1";

export const segmentItemClass = (current: boolean) =>
  cn(
    "flex h-11 min-w-0 items-center justify-center rounded-full px-3 text-14 whitespace-nowrap no-underline transition-colors",
    current
      ? "bg-card font-bold text-sand shadow-[0_1px_2px_rgba(0,0,0,.08)]"
      : "bg-transparent font-medium text-mist hover:text-sand",
  );

/** Pílula de alternância (36px, negrito 13px), como "Incluir na conta" no Simulador. */
export const toggleChipClass = (pressed: boolean) =>
  cn(
    "h-9 rounded-full border px-3.5 text-13 font-bold whitespace-nowrap transition-colors",
    pressed
      ? "border-sand bg-sand text-canvas"
      : "border-line-strong bg-transparent text-mist hover:text-sand",
  );
