import Link from "next/link";

import { inlineLinkClass } from "@/components/ui/text-link";
import { Tag } from "@/components/ui/tag";

import type { Subscription } from "../data";

function NotSubscriptionButton({ compact }: { compact?: boolean }) {
  return (
    <button
      type="button"
      className={
        compact
          ? "h-8 self-start border-none bg-transparent p-0 text-13 whitespace-nowrap text-mist underline underline-offset-3"
          : "h-9 border-none bg-transparent px-2.5 text-13 whitespace-nowrap text-mist underline underline-offset-3"
      }
    >
      Não é assinatura?
    </button>
  );
}

/** Lista de assinaturas ativas. No mobile, "Não é assinatura?" desce para baixo do nome. */
export function SubscriptionDetailList({
  items,
  compact = false,
}: {
  items: Subscription[];
  compact?: boolean;
}) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3.5 border-b border-line py-3.5">
          <span
            aria-hidden="true"
            className="flex size-[2.625rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas font-display text-17 font-bold"
          >
            {item.nome.charAt(0)}
          </span>
          <span className="flex min-w-0 grow flex-col leading-[1.35]">
            <span className="font-bold">
              <Link href={`/assinaturas/${item.id}`} className={inlineLinkClass}>
                {item.nome}
              </Link>
            </span>
            <span className="text-13 text-caption">
              {item.categoria} · {item.conta}
            </span>
            <span className="text-13 text-mist">{item.proxima}</span>
            {item.alerta && (
              <span className="mt-1.5 flex">
                <Tag tone={item.alerta.tom}>{item.alerta.texto}</Tag>
              </span>
            )}
            {compact && <NotSubscriptionButton compact />}
          </span>
          <span className="flex flex-col items-end gap-0.5">
            <strong className="text-16 whitespace-nowrap tabular-nums">{item.valor}</strong>
            <span className="text-12 text-caption">por mês</span>
            {!compact && <NotSubscriptionButton />}
          </span>
        </li>
      ))}
    </ul>
  );
}
