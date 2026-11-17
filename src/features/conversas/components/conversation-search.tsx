"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Texto da busca com uma pausa (a busca só sai quando a pessoa para de digitar). */
export function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Busca nas conversas (campo em pílula com lupa). */
export function ConversationSearch({
  id,
  value,
  onChange,
  autoFocus,
  className,
  inputClassName,
  iconClassName,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar conversas
      </label>
      <span
        className={cn(
          "pointer-events-none absolute top-[0.8125rem] left-3 text-caption",
          iconClassName,
        )}
      >
        <Icon name="search" size={18} />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        maxLength={200}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar conversas"
        className={cn(
          "h-12 w-full rounded-full border border-line-strong bg-field pr-3.5 pl-[2.375rem] text-15 text-sand",
          inputClassName,
        )}
      />
    </div>
  );
}
