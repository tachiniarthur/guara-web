import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const paddings = {
  /** Telas de conteúdo (Início, Gastos, Investimentos...). */
  default: "px-4 pt-2 pb-28 md:px-7 md:pt-7 md:pb-30 lg:px-9 lg:pt-8 lg:pb-9",
  /** Listas com barra inferior (Gastos, Alertas...). */
  list: "px-4 pt-1 pb-27 md:px-7 md:pt-7 md:pb-27.5 lg:px-9 lg:pt-8 lg:pb-9",
  /** Formulários (Novo teto, Novo alerta, Adicionar investimento, Meu perfil). */
  form: "px-4 pt-1 pb-27 md:px-7 md:pt-7 md:pb-27.5 lg:px-12 lg:py-8",
  none: "",
} as const;

type PageProps = {
  /** Barra superior do mobile (MobileHeader). */
  header?: ReactNode;
  padding?: keyof typeof paddings;
  className?: string;
  children: ReactNode;
};

/** Conteúdo de uma tela dentro do app shell, com os respiros de cada classe de janela. */
export function Page({ header, padding = "default", className, children }: PageProps) {
  return (
    <>
      {header}
      <div className={cn("flex flex-col", paddings[padding], className)}>{children}</div>
    </>
  );
}

/** Título de página (h1) com subtítulo; escala com a largura do conteúdo. */
export function PageTitle({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <h1 className="m-0 font-display text-30 leading-[1.1] font-extrabold tracking-[-0.02em] @tab:text-36 @desk:text-44 @desk:leading-[1.05]">
        {title}
      </h1>
      {subtitle && <p className="m-0 text-15 text-mist @tab:text-16 @desk:text-18">{subtitle}</p>}
    </div>
  );
}
