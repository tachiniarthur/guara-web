import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Caminho até a tela atual, sempre a partir do Início (ex.: Início / Investimentos / Adicionar).
 * `items` é o caminho depois do Início, terminando na tela atual (sem `href`); na própria tela de
 * Início, `items` vazio mostra só "Início". Os itens antes da tela atual são links.
 */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  const trail: Crumb[] = items.length
    ? [{ label: "Início", href: "/" }, ...items]
    : [{ label: "Início" }];
  return (
    <nav aria-label="Caminho" className={cn("flex items-center gap-2 text-14", className)}>
      {trail.map((item, i) => {
        const current = i === trail.length - 1;
        return (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 && (
              <span aria-hidden="true" className="text-caption">
                /
              </span>
            )}
            {item.href && !current ? (
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
        );
      })}
    </nav>
  );
}
