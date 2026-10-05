import { useId } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "./icon";

type SearchFieldProps = {
  label: string;
  placeholder?: string;
  /** "sm": 44px, texto 14 · "lg": 52px, texto 16 (mobile e formulários). */
  size?: "sm" | "md" | "lg";
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
};

/** Busca em pílula com lupa à esquerda; o rótulo fica disponível para leitores de tela. */
export function SearchField({
  label,
  placeholder,
  size = "sm",
  defaultValue,
  className,
  inputClassName,
}: SearchFieldProps) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        className={cn(
          "pointer-events-none absolute text-caption",
          size === "lg"
            ? "top-[0.9375rem] left-3.5"
            : size === "md"
              ? "top-[0.8125rem] left-3"
              : "top-3 left-3",
        )}
      >
        <Icon name="search" size={size === "lg" ? 20 : 18} />
      </span>
      <input
        id={id}
        type="search"
        placeholder={placeholder ?? label}
        defaultValue={defaultValue}
        className={cn(
          "w-full rounded-full border border-line-strong bg-field px-3.5 text-sand",
          size === "lg"
            ? "h-13 pl-11 text-16"
            : size === "md"
              ? "h-11 pl-9.5 text-16"
              : "h-11 pl-9.5 text-14",
          inputClassName,
        )}
      />
    </div>
  );
}
