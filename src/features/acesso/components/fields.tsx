"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { formatCpf, onlyDigits } from "@/lib/cpf";
import { passwordChecks } from "@/lib/password";
import { formatPhone } from "@/lib/phone";
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

/**
 * Campo de senha com botão de mostrar e esconder. Nunca sugere nem corrige o texto. `rules` mostra
 * embaixo as regras da senha nova, marcadas enquanto a pessoa digita; `matches` (na confirmação)
 * diz se ela já é igual à senha.
 */
export function PasswordField({
  id,
  label,
  error,
  hint,
  mode = "current",
  rules = false,
  matches,
  value,
  className,
  ...props
}: FieldProps &
  Omit<ComponentProps<"input">, "id" | "type" | "value"> & {
    mode?: "current" | "new";
    rules?: boolean;
    matches?: string;
    value: string;
  }) {
  const [visible, setVisible] = useState(false);
  const checks = rules ? passwordChecks(value) : null;
  // Regra que ainda falta fica vermelha na lista, em vez de repetida como erro embaixo do campo.
  const showError = Boolean(error) && !checks?.some((check) => !check.ok);
  const match = matches !== undefined && value && !error ? value === matches : null;
  const described =
    [
      showError && `${id}-erro`,
      checks && `${id}-regras`,
      match !== null && `${id}-igual`,
      !showError && !checks && hint && `${id}-dica`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
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
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          className={cn("pr-12", border(error), className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Esconder a senha" : "Mostrar a senha"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-none bg-transparent text-mist hover:text-sand"
        >
          <Icon name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      </div>
      {showError ? <FieldError id={`${id}-erro`}>{error}</FieldError> : null}
      {checks ? (
        <ul
          id={`${id}-regras`}
          aria-label="A senha precisa ter"
          className="sm:grid-cols-2 m-0 grid list-none grid-cols-1 gap-x-4 gap-y-1 p-0"
        >
          {checks.map((check) => (
            <li
              key={check.id}
              className={cn(
                "flex items-center gap-1.5 text-13 leading-snug",
                check.ok ? "text-folha" : error ? "text-urucum" : "text-caption",
              )}
            >
              {check.ok ? (
                <Icon name="check" size={14} />
              ) : (
                <span aria-hidden className="mx-[4px] size-1.5 shrink-0 rounded-full bg-current" />
              )}
              <span>{check.label}</span>
              <span className="sr-only">{check.ok ? "(feito)" : "(falta)"}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {match !== null ? (
        <span
          id={`${id}-igual`}
          className={cn("flex items-center gap-1.5 text-13", match ? "text-folha" : "text-caption")}
        >
          {match && <Icon name="check" size={14} />}
          {match ? "As senhas são iguais." : "As senhas ainda não são iguais."}
        </span>
      ) : null}
      {!showError && !checks && hint ? (
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

/** Campo de celular: põe a máscara ao digitar ("(11) 98765-4321") e entrega só os dígitos. */
export function PhoneField({
  id,
  label,
  error,
  hint,
  value,
  onValueChange,
  ...props
}: FieldProps &
  Omit<ComponentProps<"input">, "id" | "type" | "value" | "onChange"> & {
    /** Os 11 dígitos com DDD (ou menos, enquanto digita), sem máscara. */
    value: string;
    onValueChange: (digits: string) => void;
  }) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <TextInput
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(00) 00000-0000"
        maxLength={15}
        value={formatPhone(value)}
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
