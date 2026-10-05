import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

/** Caminho até a tela atual (ex.: Gastos / Assinaturas). */
export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Caminho" className={cn("flex items-center gap-2 text-14", className)}>
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <span aria-hidden="true" className="text-caption">
              /
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-mist underline underline-offset-3 hover:text-sand"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-bold text-sand">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
