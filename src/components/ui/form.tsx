import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "./icon";

/** Rótulo de campo (negrito). O tamanho varia por tela; passe-o em `className`. */
export function FieldLabel({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-14 font-bold", className)} {...props} />;
}

/** Grupo rótulo + controle + dica, empilhados com 8px. */
export function Field({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex min-w-0 flex-col gap-2", className)}>{children}</div>;
}

export function FieldHint({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("text-13 text-caption", className)} {...props} />;
}

/** Campo de texto em pílula (fundo rebaixado, borda de controle). */
export const inputClass =
  "h-13 w-full rounded-full border border-line-strong bg-field px-3.5 text-16 text-sand";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input type="text" className={cn(inputClass, className)} {...props} />;
}

/** Valor em destaque (Fraunces 800), como o teto ou o valor-gatilho. */
export function AmountInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className={cn(inputClass, "font-display font-extrabold tabular-nums", className)}
      {...props}
    />
  );
}

type SelectInputProps = ComponentProps<"select"> & {
  /** Mostra a seta à direita (desktop e tablet). */
  chevron?: boolean;
  chevronClassName?: string;
};

export function SelectInput({
  chevron = true,
  className,
  chevronClassName,
  children,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        className={cn(inputClass, "appearance-none", chevron && "pr-10", className)}
        {...props}
      >
        {children}
      </select>
      {chevron && (
        <span
          className={cn("pointer-events-none absolute top-4 right-3.5 text-mist", chevronClassName)}
        >
          <Icon name="chevron-down" />
        </span>
      )}
    </div>
  );
}

/** Legenda de um grupo de campos (fieldset). */
export function Legend({ className, ...props }: ComponentProps<"legend">) {
  return <legend className={cn("mb-1 p-0 text-14 font-bold", className)} {...props} />;
}

type CheckboxRowProps = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  defaultChecked?: boolean;
  /** Cor do marcador (areia por padrão; amarelo-tucano em algumas telas do mobile). */
  accent?: "sand" | "tucano";
  /** Liga/desliga (anuncia como interruptor). */
  isSwitch?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
};

/** Caixa de seleção com rótulo (e descrição opcional), alvo mínimo de 52px. */
export function CheckboxRow({
  id,
  label,
  description,
  defaultChecked,
  accent = "sand",
  isSwitch,
  disabled,
  className,
  labelClassName,
}: CheckboxRowProps) {
  return (
    <div className={cn("flex min-h-13 items-center gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        role={isSwitch ? "switch" : undefined}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={cn(
          "m-0 size-5.5 shrink-0",
          accent === "tucano" ? "accent-tucano" : "accent-sand",
        )}
      />
      <label htmlFor={id} className="flex grow flex-col leading-[1.35]">
        <span className={cn("font-medium", labelClassName)}>{label}</span>
        {description && <span className="text-13 text-caption">{description}</span>}
      </label>
    </div>
  );
}

/** Opção em cartão (60px, raio 20) com título e descrição; marcada ganha borda de 2px em areia. */
export function RadioCard({
  name,
  title,
  description,
  value,
  defaultChecked,
  className,
}: {
  name: string;
  title: ReactNode;
  description?: ReactNode;
  value?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-15 cursor-pointer items-center gap-3.5 rounded-bubble border border-line-strong bg-field px-4 py-2.5 text-16 font-medium has-checked:border-2 has-checked:border-sand has-checked:font-bold",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="m-0 size-5.5 shrink-0 accent-sand"
      />
      <span className="flex flex-col leading-[1.35]">
        <span>{title}</span>
        {description && <span className="text-13 font-normal text-caption">{description}</span>}
      </span>
    </label>
  );
}

/** Barra fixa no rodapé das telas de formulário no mobile. */
export function MobileActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-line bg-canvas px-4 pt-3 pb-6 md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Pequeno card de métrica (rótulo + número em Fraunces). */
export function StatTile({
  label,
  value,
  tone = "sand",
  className,
  labelClassName,
  valueClassName,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: "sand" | "urucum" | "folha";
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 rounded-tile bg-field px-4 py-3.5", className)}>
      <dt className={cn("text-15 text-caption", labelClassName)}>{label}</dt>
      <dd
        className={cn(
          "m-0 font-display text-24 font-bold tabular-nums",
          tone === "urucum" ? "text-urucum" : tone === "folha" ? "text-folha" : "text-sand",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}
