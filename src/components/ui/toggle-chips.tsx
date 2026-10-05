"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { toggleChipClass } from "./chip";

/** Grupo de pílulas alternáveis: escolha única ou múltipla (`multiple`). */
export function ToggleChips({
  label,
  options,
  defaultPressed = [],
  multiple = false,
  className,
}: {
  label: string;
  options: readonly string[];
  defaultPressed?: readonly string[];
  multiple?: boolean;
  className?: string;
}) {
  const [pressed, setPressed] = useState<readonly string[]>(defaultPressed);

  function toggle(option: string) {
    if (multiple) {
      setPressed((current) =>
        current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
      );
    } else {
      setPressed([option]);
    }
  }

  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={pressed.includes(option)}
          onClick={() => toggle(option)}
          className={toggleChipClass(pressed.includes(option))}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
