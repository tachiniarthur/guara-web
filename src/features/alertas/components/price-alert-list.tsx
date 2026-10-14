import Link from "next/link";

import { inlineLinkClass } from "@/components/ui/text-link";
import { Icon } from "@/components/ui/icon";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import type { PriceAlert } from "../data";

/** Etiqueta "↑ VENDA" (urucum) ou "↓ COMPRA" (folha). */
export function DirectionTag({
  direcao,
  status,
}: {
  direcao: PriceAlert["direcao"];
  /** Sem seta e sem espaçamento extra (cabeçalho do detalhe do alerta). */
  status?: boolean;
}) {
  if (status) {
    return (
      <Tag tone={direcao === "venda" ? "urucum" : "folha"} status>
        {direcao === "venda" ? "VENDA" : "COMPRA"}
      </Tag>
    );
  }
  return direcao === "venda" ? (
    <Tag tone="urucum">
      <Icon name="arrow-up" size={14} strokeWidth={2} />
      VENDA
    </Tag>
  ) : (
    <Tag tone="folha">
      <Icon name="arrow-down" size={14} strokeWidth={2} />
      COMPRA
    </Tag>
  );
}

/** Alertas de preço com a distância até o alvo. */
export function PriceAlertList({ items, columns = 1 }: { items: PriceAlert[]; columns?: 1 | 3 }) {
  return (
    <ul
      className={cn(
        "m-0 grid list-none gap-x-7 p-0",
        columns === 3 ? "grid-cols-3" : "grid-cols-1",
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 border-b border-line py-3.5">
          <div className="flex items-center gap-2">
            <span className="grow font-bold">
              <Link href={`/alertas/precos/${item.id}`} className={inlineLinkClass}>
                {item.ativo}
              </Link>
            </span>
            <DirectionTag direcao={item.direcao} />
          </div>
          <span
            className={cn(
              "text-14 text-mist tabular-nums",
              columns === 3 && "block min-h-[2.625rem] leading-normal",
            )}
          >
            {item.condicao}
          </span>
          <div aria-hidden="true" className="h-1.5 rounded-[3px] bg-line">
            <div
              className={cn(
                "h-1.5 rounded-[3px]",
                item.direcao === "venda" ? "bg-urucum" : "bg-folha",
              )}
              style={{ width: `${item.progresso}%` }}
            />
          </div>
          <span className="text-12 text-caption">{item.faltam}</span>
        </li>
      ))}
    </ul>
  );
}
