"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { Presence } from "@/components/ui/presence";
import { cn } from "@/lib/utils";

export type MonthOption = { value: string; long: string };

/**
 * Botão do mês (calendário + nome) que abre a lista dos meses para escolher. O menu fecha ao
 * escolher, ao clicar fora ou com Esc; a opção marcada recebe o foco ao abrir.
 */
export function MonthPicker({
  options,
  value,
  onChange,
  children,
  className,
}: {
  options: MonthOption[];
  value: string;
  onChange: (value: string) => void;
  /** O que o botão mostra (o mês curto no celular, o longo no desktop). */
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Mês: ${current?.long.toLowerCase().replace(" ", " de ") ?? value}. Trocar mês`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex pressable items-center gap-2 rounded-full border border-line-strong bg-card px-3.5 font-medium whitespace-nowrap hover:bg-shade",
          className,
        )}
      >
        <Icon name="calendar" size={18} />
        {children}
        <Icon
          name="chevron-down"
          size={16}
          className={cn(
            "transition-transform duration-(--duration-popover) ease-out-soft",
            open && "rotate-180",
          )}
        />
      </button>
      <Presence show={open}>
        {open && (
          <div
            role="menu"
            aria-label="Escolher mês"
            data-motion="menu"
            className="absolute top-[calc(100%+0.5rem)] right-0 z-20 flex max-h-[min(24rem,70vh)] w-[13.5rem] origin-top-right flex-col gap-0.5 overflow-y-auto rounded-bubble border border-line-strong bg-field p-2 shadow-[0_1px_2px_rgba(0,0,0,.4),0_8px_24px_rgba(0,0,0,.25)]"
          >
            {options.map((option) => {
              const checked = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={checked}
                  autoFocus={checked}
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                    if (!checked) onChange(option.value);
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-full border-none bg-transparent px-3.5 text-left text-14 text-sand hover:bg-shade focus-visible:bg-shade",
                    checked && "font-bold",
                  )}
                >
                  {option.long}
                  {checked && <Icon name="check" size={16} />}
                </button>
              );
            })}
          </div>
        )}
      </Presence>
    </div>
  );
}
