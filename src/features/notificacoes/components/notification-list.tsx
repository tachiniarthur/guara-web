import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import type { AppNotification, NotificationTone } from "../data";

const tones: Record<NotificationTone, string> = {
  urucum: "bg-urucum-bg text-urucum",
  tucano: "bg-tucano-bg text-tucano",
  arara: "bg-arara-bg text-arara",
  neutral: "bg-shade text-mist",
};

/** Avisos em cartões: ícone no tom do aviso, texto, ação e o ponto de não lida. */
export function NotificationList({ items }: { items: AppNotification[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "flex items-center gap-3.5 rounded-bubble border border-line px-4 py-3.5",
            item.nova ? "bg-card" : "bg-transparent",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              tones[item.tom],
            )}
          >
            <Icon name={item.icone} />
          </span>
          <span className="flex min-w-0 grow flex-col gap-0.5 leading-[1.4]">
            <strong className="text-15">{item.titulo}</strong>
            <span className="text-13 text-mist">{item.texto}</span>
            <span className="text-12 text-caption">{item.meta}</span>
          </span>
          {item.acao && (
            <ButtonLink href={item.acao.href} variant="secondary" size="sm">
              <span>{item.acao.label}</span>
            </ButtonLink>
          )}
          {item.nova && (
            <span aria-label="Não lida" className="size-2.5 shrink-0 rounded-full bg-tucano" />
          )}
        </li>
      ))}
    </ul>
  );
}

export function NotificationGroupTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <h2
      className={cn("m-0 text-12 font-extrabold tracking-[.1em] text-caption uppercase", className)}
    >
      {children}
    </h2>
  );
}
