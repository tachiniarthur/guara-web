import { useId } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "./icon";

type SearchFieldProps = {
  label: string;
  placeholder?: string;
  /** "sm": 44px, texto 14 · "list": 46px, texto 16 (listas completas) · "lg": 52px, texto 16. */
  size?: "sm" | "md" | "list" | "lg";
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
};

/** Busca em pílula com lupa à esquerda; o rótulo fica disponível para leitores de tela. */
export function SearchField({
  label,
  placeholder,
  size = "sm",
  defaultValue,
  className,
  inputClassName,
  onValueChange,
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
              : size === "list"
                ? "top-3.5 left-3"
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
        onChange={onValueChange && ((event) => onValueChange(event.target.value))}
        className={cn(
          "w-full rounded-full border border-line-strong bg-field px-3.5 text-sand",
          size === "lg"
            ? "h-13 pl-11 text-16"
            : size === "md"
              ? "h-11 pl-9.5 text-16"
              : size === "list"
                ? "h-11.5 pl-9.5 text-16"
                : "h-11 pl-9.5 text-14",
          inputClassName,
        )}
      />
    </div>
  );
}
