"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { toggleChipClass } from "./chip";

/** Grupo de pílulas alternáveis: escolha única ou múltipla (`multiple`). */
export function ToggleChips({
  label,
  options,
  defaultPressed = [],
  pressed: controlled,
  onToggle,
  multiple = false,
  className,
}: {
  label: string;
  options: readonly string[];
  defaultPressed?: readonly string[];
  /** Controlado: quem usa guarda a seleção e recebe cada toque em `onToggle`. */
  pressed?: readonly string[];
  onToggle?: (option: string) => void;
  multiple?: boolean;
  className?: string;
}) {
  const [own, setPressed] = useState<readonly string[]>(defaultPressed);
  const pressed = controlled ?? own;

  function toggle(option: string) {
    if (onToggle) {
      onToggle(option);
      return;
    }
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
