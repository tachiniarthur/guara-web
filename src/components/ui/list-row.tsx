import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListRowProps = {
  title: ReactNode;
  meta?: ReactNode;
  /** Conteúdo extra embaixo do título (ex.: etiqueta "Fora do padrão"). */
  extra?: ReactNode;
  /** Valor à direita (negrito, tabular). */
  value?: ReactNode;
  valueClassName?: string;
  /** Linha de baixo do valor (ex.: percentual). */
  valueMeta?: ReactNode;
  /** Ícone ou retrato à esquerda. */
  leading?: ReactNode;
  /** Algo depois do valor (ex.: seta). */
  trailing?: ReactNode;
  href?: string;
  /** Divisória embaixo (padrão: sim). */
  divider?: boolean;
  className?: string;
};

/**
 * Linha de lista: título 15/500 e meta 12 à esquerda, valor à direita (Fundamentos · Listas e
 * dados). Com `href`, a linha inteira é um link.
 */
export function ListRow({
  title,
  meta,
  extra,
  value,
  valueClassName,
  valueMeta,
  leading,
  trailing,
  href,
  divider = true,
  className,
}: ListRowProps) {
  const rowClass = cn(
    "flex items-center gap-3 py-3 text-sand no-underline",
    divider && "border-b border-line",
    className,
  );
  const content = (
    <>
      {leading}
      <span className="flex min-w-0 grow flex-col leading-[1.35]">
        <span className="font-medium">{title}</span>
        {meta && <span className="text-12 text-caption">{meta}</span>}
        {extra && <span className="mt-1">{extra}</span>}
      </span>
      {value !== undefined &&
        (valueMeta ? (
          <span className="flex shrink-0 flex-col items-end leading-[1.35]">
            <span className={cn("font-bold whitespace-nowrap tabular-nums", valueClassName)}>
              {value}
            </span>
            {valueMeta}
          </span>
        ) : (
          <span className={cn("font-bold whitespace-nowrap tabular-nums", valueClassName)}>
            {value}
          </span>
        ))}
      {trailing}
    </>
  );
  return (
    <li>
      {href ? (
        <Link href={href} className={cn(rowClass, "hover:bg-shade/40")}>
          {content}
        </Link>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
    </li>
  );
}

/** Lista sem marcadores para ListRow. */
export function RowList({ className, children }: { className?: string; children: ReactNode }) {
  return <ul className={cn("m-0 flex list-none flex-col p-0", className)}>{children}</ul>;
}
