"use client";

import Link from "next/link";
import { useState } from "react";

import { CardAction, CardBody } from "@/components/states/screen-state-context";
import { GuaraAvatar } from "@/components/ui/guara-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Collapse } from "@/components/ui/collapse";
import { CountBadge } from "@/components/ui/count-badge";
import { Icon } from "@/components/ui/icon";
import { panelLinkClass } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

import type { PendingItem } from "../types";

/** Quantas pendências o card mostra antes do "Ver mais" (as mais importantes vêm primeiro). */
export const PENDING_VISIBLE = 5;

function PendingList({ items }: { items: PendingItem[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "flex items-center gap-3 rounded-tile px-2.5 py-2",
            item.urgente ? "bg-urucum-bg" : "bg-shade",
          )}
        >
          <GuaraAvatar size={44} />
          <span className="flex min-w-0 grow flex-col leading-[1.3]">
            <strong className="text-15 @tab:truncate">{item.titulo}</strong>
            <span className="text-13 text-mist @tab:truncate">{item.detalhe}</span>
            <span
              className={cn("text-12 font-bold", item.urgente ? "text-urucum" : "text-caption")}
            >
              {item.origem}
            </span>
          </span>
          <Link
            href={item.href}
            className={cn(
              buttonVariants({ variant: item.urgente ? "primary" : "outline", size: "md" }),
              "px-3.5 @tab:px-5",
            )}
          >
            <span>{item.acao}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Precisa de você": decisões pendentes que o Guará separou, das mais importantes para as menos.
 * Mostra as 5 primeiras; "Ver mais" abre o resto no próprio card.
 */
export function PendingCard({
  className,
  pendingItems = [],
}: {
  className?: string;
  pendingItems?: PendingItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const rest = pendingItems.slice(PENDING_VISIBLE);
  return (
    <Card className={cn("gap-3.5", className)}>
      <CardHeader
        title="Precisa de você"
        action={
          <CardAction>
            <CountBadge
              count={pendingItems.length}
              size="lg"
              label={`${pendingItems.length} pendências`}
            />
          </CardAction>
        }
      />
      <CardBody className="grow">
        {pendingItems.length === 0 && (
          <p className="m-0 text-14 text-mist">Nada precisa de você agora.</p>
        )}
        {/* As 5 primeiras e o resto num bloco só: o espaço entre a 5ª e a 6ª é o mesmo das outras. */}
        <div>
          <PendingList items={pendingItems.slice(0, PENDING_VISIBLE)} />
          {rest.length > 0 && (
            <Collapse open={expanded} className="pt-2">
              <PendingList items={rest} />
            </Collapse>
          )}
        </div>
        {rest.length > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
              className={cn(panelLinkClass, "cursor-pointer border-none bg-transparent p-0")}
            >
              {expanded ? "Ver menos" : `Ver mais ${rest.length}`}
              <Icon
                name="chevron-down"
                size={16}
                className={cn(
                  "transition-transform duration-(--duration-move) ease-out-soft",
                  expanded && "rotate-180",
                )}
              />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
