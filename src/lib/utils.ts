import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Ensina ao tailwind-merge a escala tipográfica em px do tema (text-13, text-28...);
// sem isso ela é tratada como cor e um `text-sand` depois apagaria o tamanho.
// A escala não define altura de linha, então `text-*` não deve apagar um `leading-*`.
const twMerge = extendTailwindMerge({
  override: {
    conflictingClassGroups: { "font-size": [] },
  },
  extend: {
    theme: {
      text: [
        "9",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "22",
        "24",
        "26",
        "28",
        "30",
        "32",
        "34",
        "36",
        "38",
        "40",
        "42",
        "44",
      ],
      radius: ["card", "tile", "bubble"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
