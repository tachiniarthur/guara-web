import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** "‹ Voltar" no topo das telas de entrada. */
export function AuthBackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 self-start text-15 font-semibold text-mist no-underline hover:text-sand"
    >
      <Icon name="chevron-left" size={18} />
      Voltar
    </Link>
  );
}

/** Título e apoio das telas de entrada (26 no celular, 30 a partir do tablet). */
export function AuthIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="m-0 font-display text-26 leading-[1.2] font-extrabold tracking-[-0.01em] md:text-30">
        {title}
      </h1>
      <p className="m-0 text-15 leading-[1.55] text-mist">{children}</p>
    </div>
  );
}

/** Aviso em bloco tingido (atenção) com ícone. */
export function WarningBlock({
  icon,
  children,
  className,
}: {
  icon: IconName;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[0.875rem] bg-tucano-bg px-3.5 py-3 text-13 leading-normal text-sand",
        className,
      )}
    >
      <span className="mt-px text-tucano">
        <Icon name={icon} size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}

/** Botão desativado no estilo dos protótipos (fundo rebaixado, texto apagado). */
export const disabledButtonClass =
  "h-13 w-full rounded-full border border-line bg-shade text-16 font-bold text-caption";

/** Molde das telas de entrada por e-mail (card de 560 no tablet, 520 ampliado no desktop). */
export const authShell = {
  zoom: 1.6,
  desktopWidth: "lg:max-w-[32.5rem]",
  tabletWidth: "md:w-[35rem]",
  className: "gap-5 pb-10 md:gap-6.5 lg:gap-5.5",
};
