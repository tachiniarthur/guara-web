import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Field, FieldHint, FieldLabel, MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

/**
 * Seção do formulário: no celular os campos ficam soltos na página; a partir do tablet,
 * dentro de um card com título.
 */
export function FormSection({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-3.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-4",
        className,
      )}
    >
      <PanelHeader
        title={title}
        subtitle={subtitle}
        className="hidden @tab:flex"
        titleClassName="tracking-normal"
      />
      {children}
    </section>
  );
}

/** Campo com rótulo, "(opcional)" e dica. */
export function LabeledField({
  id,
  label,
  optional,
  hint,
  className,
  children,
}: {
  id?: string;
  label: string;
  /** Texto entre parênteses depois do rótulo ("opcional"). */
  optional?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      {label}
      {optional && (
        <>
          {" "}
          <span className="font-normal text-caption">{`(${optional})`}</span>
        </>
      )}
    </>
  );
  return (
    <Field className={className}>
      {id ? (
        <FieldLabel htmlFor={id}>{content}</FieldLabel>
      ) : (
        <span className="text-14 font-bold">{content}</span>
      )}
      {children}
      {hint && <FieldHint>{hint}</FieldHint>}
    </Field>
  );
}

/** Ações do formulário: barra fixa no celular; Cancelar e Salvar à direita a partir do tablet. */
export function SaveActions({
  label,
  href,
  cancelHref,
}: {
  label: string;
  href: string;
  cancelHref: string;
}) {
  return (
    <>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 @tab:flex">
        <ButtonLink href={cancelHref} variant="ghost" className="text-15">
          <span>Cancelar</span>
        </ButtonLink>
        <ButtonLink href={href} variant="primary" className="text-15">
          <Icon name="check" size={18} />
          <span>{label}</span>
        </ButtonLink>
      </div>
      <MobileActionBar>
        <ButtonLink href={href} variant="primary" size="xl" block>
          <Icon name="check" size={18} />
          <span>{label}</span>
        </ButtonLink>
      </MobileActionBar>
    </>
  );
}
