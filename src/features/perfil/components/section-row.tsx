import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Seção de Meu perfil e de Configurações: um bloco largo por assunto, um embaixo do outro. No
 * desktop, o título e a explicação ficam numa coluna à esquerda e o conteúdo à direita; no celular,
 * empilhados.
 */
export function SectionRow({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-card border border-line bg-card p-5 text-sand @tab:p-6 @desk:grid @desk:grid-cols-[17rem_minmax(0,1fr)] @desk:gap-12 @desk:p-7",
        className,
      )}
    >
      <header className="flex flex-col gap-1">
        <h2 id={id} className="m-0 font-display text-18 leading-[1.25] font-bold">
          {title}
        </h2>
        {description && <p className="m-0 text-14 leading-[1.5] text-mist">{description}</p>}
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
