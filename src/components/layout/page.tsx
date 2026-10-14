import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

const paddings = {
  /** Telas de conteúdo (Início, Gastos, Investimentos...). */
  default: "px-4 pt-2 pb-28 md:px-7 md:pt-7 md:pb-30 lg:px-9 lg:pt-8 lg:pb-9",
  /** Listas com barra inferior (Gastos, Alertas...). */
  list: "px-4 pt-1 pb-27 md:px-7 md:pt-7 md:pb-27.5 lg:px-9 lg:pt-8 lg:pb-9",
  /** Telas internas sem painel de conversas (detalhes e listas completas). */
  detail: "px-4 pt-1 pb-27 md:px-7 md:pt-7 md:pb-27.5 lg:px-12 lg:pt-8 lg:pb-12",
  /** Formulários (Novo teto, Novo alerta, Adicionar investimento, Meu perfil). */
  form: "px-4 pt-1 pb-27 md:px-7 md:pt-7 md:pb-27.5 lg:px-12 lg:py-8",
  none: "",
} as const;

type PageProps = {
  /** Barra superior do mobile (MobileHeader). */
  header?: ReactNode;
  padding?: keyof typeof paddings;
  /**
   * Ampliação da área de conteúdo no desktop (ex.: 1.4), para telas com pouco conteúdo.
   * Os respiros da página não ampliam; ver `zoom-area` em globals.css.
   */
  zoom?: number;
  /** Ajustes nos respiros da página (com `zoom`, `className` vale só para o conteúdo). */
  paddingClassName?: string;
  /** Ocupa a altura toda da janela no desktop (estados vazios e de erro). */
  fill?: boolean;
  className?: string;
  children: ReactNode;
};

/** Conteúdo de uma tela dentro do app shell, com os respiros de cada classe de janela. */
export function Page({
  header,
  padding = "default",
  zoom,
  paddingClassName,
  fill,
  className,
  children,
}: PageProps) {
  return (
    <>
      {header}
      {zoom ? (
        <div className={cn("flex flex-col", paddings[padding], paddingClassName)}>
          <div
            className={cn("flex flex-col lg:zoom-area", className)}
            style={{ "--zoom": zoom } as CSSProperties}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col",
            paddings[padding],
            fill && "lg:min-h-dvh",
            paddingClassName,
            className,
          )}
        >
          {children}
        </div>
      )}
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

/** Cabeçalho das telas internas a partir do tablet: título (28/32), apoio e ações à direita. */
export function DetailHeader({
  title,
  subtitle,
  actions,
  className,
  subtitleClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  subtitleClassName?: string;
}) {
  return (
    <header className={cn("hidden items-end justify-between gap-4 @tab:flex", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
          {title}
        </h1>
        {subtitle && <p className={cn("m-0 text-15 text-mist", subtitleClassName)}>{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
