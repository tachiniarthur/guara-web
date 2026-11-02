"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { formatCpf, onlyDigits } from "@/lib/cpf";
import { cn } from "@/lib/utils";

/** Mensagem de erro de um campo (com ícone), ligada ao campo por `aria-describedby`. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-13 leading-[1.45] text-urucum"
    >
      <Icon name="alert-triangle" size={16} />
      <span>{children}</span>
    </span>
  );
}

type FieldProps = {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
};

const border = (error?: string | null) => (error ? "border-urucum" : undefined);
const describedBy = (id: string, error?: string | null, hint?: ReactNode) =>
  error ? `${id}-erro` : hint ? `${id}-dica` : undefined;

/** Campo de senha com botão de mostrar e esconder. Nunca sugere nem corrige o texto. */
export function PasswordField({
  id,
  label,
  error,
  hint,
  mode = "current",
  className,
  ...props
}: FieldProps & Omit<ComponentProps<"input">, "id" | "type"> & { mode?: "current" | "new" }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <TextInput
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={mode === "new" ? "new-password" : "current-password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn("pr-12", border(error), className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Esconder a senha" : "Mostrar a senha"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-none bg-transparent text-mist hover:text-sand"
        >
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      </div>
      {error ? (
        <FieldError id={`${id}-erro`}>{error}</FieldError>
      ) : hint ? (
        <span id={`${id}-dica`} className="text-13 text-caption">
          {hint}
        </span>
      ) : null}
    </Field>
  );
}

/** Campo de CPF: põe a máscara ao digitar ("529.982.247-25") e entrega só os dígitos. */
export function CpfField({
  id,
  label,
  error,
  hint,
  value,
  onValueChange,
  ...props
}: FieldProps &
  Omit<ComponentProps<"input">, "id" | "type" | "value" | "onChange"> & {
    /** Os 11 dígitos (ou menos, enquanto digita), sem máscara. */
    value: string;
    onValueChange: (digits: string) => void;
  }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <TextInput
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="000.000.000-00"
        maxLength={14}
        value={formatCpf(value)}
        onChange={(event) => onValueChange(onlyDigits(event.target.value).slice(0, 11))}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={border(error)}
        {...props}
      />
      {error ? (
        <FieldError id={`${id}-erro`}>{error}</FieldError>
      ) : hint ? (
        <span id={`${id}-dica`} className="text-13 text-caption">
          {hint}
        </span>
      ) : null}
    </Field>
  );
}
