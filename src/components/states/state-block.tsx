import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Tone = "error" | "neutral";

const tones: Record<Tone, string> = {
  error: "bg-urucum-bg text-urucum",
  neutral: "bg-shade text-mist",
};

const retryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-card px-4.5 font-sans font-bold whitespace-nowrap text-sand no-underline hover:bg-shade";

/** "Tentar de novo" dos blocos de erro (40px; 36px na versão compacta). */
export function RetryButton({ compact }: { compact?: boolean }) {
  return (
    <button
      type="button"
      className={cn(retryButtonClass, compact ? "h-9 text-13" : "h-10 text-14")}
    >
      <Icon name="retry" size={18} />
      <span>Tentar de novo</span>
    </button>
  );
}

/** "Limpar filtros" do vazio com filtro. */
export function ClearFiltersButton({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn(retryButtonClass, "h-10 text-14")}>
      <Icon name="x" size={18} />
      <span>Limpar filtros</span>
    </button>
  );
}

/**
 * Bloco que ocupa o lugar do conteúdo de um card: ícone redondo, título, explicação e ação,
 * centralizados. Os títulos curtos ("—") usam a serifada grande.
 */
export function StateBlock({
  icon,
  tone = "neutral",
  title,
  children,
  action,
  className,
}: {
  icon: IconName;
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 grow flex-col items-center justify-center gap-2.5 p-2 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("flex size-14 items-center justify-center rounded-full", tones[tone])}
      >
        <Icon name={icon} size={26} />
      </span>
      <strong
        className={cn(
          "font-display font-bold",
          title === "—" ? "text-30 font-extrabold" : "text-19",
        )}
      >
        {title}
      </strong>
      {children && <p className="m-0 max-w-105 text-14 leading-[1.55] text-mist">{children}</p>}
      {action && <div className="flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/** Versão em linha, para tiles baixos: ícone quadrado à esquerda, título e uma linha de apoio. */
export function CompactStateBlock({
  icon,
  tone = "neutral",
  title,
  children,
  action,
  className,
}: {
  icon: IconName;
  tone?: Tone;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 grow items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}
      >
        <Icon name={icon} size={20} />
      </span>
      <span className="flex min-w-0 grow flex-col leading-[1.35]">
        <strong className={title === "—" ? "font-display text-22" : "text-15"}>{title}</strong>
        <span className="text-13 text-mist">{children}</span>
      </span>
      {action}
    </div>
  );
}

/** Erro padrão de um card. */
export function ErrorBlock({ compact, className }: { compact?: boolean; className?: string }) {
  return compact ? (
    <CompactStateBlock
      icon="alert-triangle"
      tone="error"
      title="Não deu para carregar"
      action={<RetryButton compact />}
      className={className}
    >
      Tente de novo em instantes.
    </CompactStateBlock>
  ) : (
    <StateBlock
      icon="alert-triangle"
      tone="error"
      title="Não deu para carregar"
      action={<RetryButton />}
      className={className}
    >
      Seus dados continuam salvos. A conexão com o Guará falhou agora.
    </StateBlock>
  );
}

/** Vazio genérico de um card ("—"), quando a tela inteira ainda não tem dados. */
export function NoDataBlock({ compact, className }: { compact?: boolean; className?: string }) {
  return compact ? (
    <CompactStateBlock icon="info-lg" title="—" className={className}>
      Aparece aqui quando houver dados.
    </CompactStateBlock>
  ) : (
    <StateBlock icon="info-lg" title="—" className={className}>
      Aparece aqui quando houver dados.
    </StateBlock>
  );
}

/** Erro num tile pequeno sem título (ex.: total do mês): ícone, frase curta e "Tentar de novo". */
export function TileErrorBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 grow flex-col items-center justify-center gap-1.5 text-center",
        className,
      )}
    >
      <Icon name="alert-triangle" size={22} className="text-urucum" />
      <strong className="text-14">Não deu para carregar</strong>
      <RetryButton compact />
    </div>
  );
}

/** Tile pequeno ainda sem dados: só o travessão. */
export function TileEmptyBlock({ className }: { className?: string }) {
  return (
    <div className={cn("flex grow items-center justify-center", className)}>
      <strong className="font-display text-26 text-caption">—</strong>
    </div>
  );
}

/** A busca ou o filtro não acharam nada. */
export function FilterEmptyBlock({
  children,
  onClear,
  className,
}: {
  children: ReactNode;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <StateBlock
      icon="search"
      title="Nada com esse filtro"
      action={<ClearFiltersButton onClick={onClear} />}
      className={className}
    >
      {children}
    </StateBlock>
  );
}

/**
 * Troca o conteúdo de um card por um bloco de estado sem mudar a altura do card: o conteúdo
 * continua ali, invisível, e o bloco fica por cima. `className` repete o espaçamento entre os
 * itens do card, para a altura ficar igual.
 */
export function StateSwap({
  replacement,
  children,
  className,
  overlayClassName,
}: {
  replacement: ReactNode;
  children: ReactNode;
  className?: string;
  /** Fundo e respiro do bloco quando ele cobre um tile inteiro (o tile fica invisível). */
  overlayClassName?: string;
}) {
  if (!replacement) return children;
  return (
    <div className={cn("relative flex min-w-0 flex-col", className)}>
      <div aria-hidden="true" inert className="invisible contents">
        {children}
      </div>
      <div className={cn("absolute inset-0 flex flex-col overflow-hidden", overlayClassName)}>
        {replacement}
      </div>
    </div>
  );
}

type ErrorKind = "big" | "tile" | "compact";

const errorKinds: Record<ErrorKind, (className: string) => ReactNode> = {
  big: (className) => <ErrorBlock className={className} />,
  tile: (className) => <TileErrorBlock className={className} />,
  compact: (className) => <ErrorBlock compact className={className} />,
};

/**
 * Erro com a variante certa para o tamanho do card em cada tela: grande (cards altos), tile
 * (cards baixos e estreitos) ou em linha (cards baixos e largos).
 */
export function ErrorBlocks({
  mobile,
  tablet = mobile,
  desktop = tablet,
}: {
  mobile: ErrorKind;
  tablet?: ErrorKind;
  desktop?: ErrorKind;
}) {
  if (mobile === tablet && tablet === desktop) return errorKinds[mobile]("");
  if (tablet === desktop) {
    return (
      <>
        {errorKinds[mobile]("@tab:hidden")}
        {errorKinds[tablet]("hidden @tab:flex")}
      </>
    );
  }
  if (mobile === tablet) {
    return (
      <>
        {errorKinds[mobile]("@desk:hidden")}
        {errorKinds[desktop]("hidden @desk:flex")}
      </>
    );
  }
  return (
    <>
      {errorKinds[mobile]("@tab:hidden")}
      {errorKinds[tablet]("hidden @tab:flex @desk:hidden")}
      {errorKinds[desktop]("hidden @desk:flex")}
    </>
  );
}
