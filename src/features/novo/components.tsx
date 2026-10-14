import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/brand";
import { Icon, type IconName } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { user } from "@/features/usuario/data";
import { cn } from "@/lib/utils";

/** Barra do celular de quem ainda não conectou banco: logo, título e as iniciais (Meu perfil). */
export function NewUserHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2.5 px-4 md:hidden">
      <BrandLogo size={44} />
      <strong className="grow text-17">{title}</strong>
      <Link
        href="/perfil"
        aria-label="Meu perfil"
        className="flex size-11 items-center justify-center rounded-full bg-tucano font-display text-15 font-extrabold text-canvas no-underline"
      >
        {user.iniciais}
      </Link>
    </header>
  );
}

/** Quatro números ainda sem dados ("—"), no topo do desktop. */
export function EmptyStatTiles({ items }: { items: { label: string; hint: string }[] }) {
  return (
    <div className="grid grid-cols-4 items-stretch gap-5">
      {items.map((item) => (
        <Panel key={item.label} className="gap-1.5 p-5.5">
          <span className="text-14 text-mist">{item.label}</span>
          <span className="font-display text-26 leading-[1.1] font-extrabold tracking-[-0.01em] text-caption tabular-nums">
            —
          </span>
          <span className="text-13 text-caption">{item.hint}</span>
        </Panel>
      ))}
    </div>
  );
}

/** Ícone em bloco rebaixado (32px) para as listas de exemplo. */
export function RowIcon({
  icon,
  tone = "neutral",
}: {
  icon: IconName;
  tone?: "neutral" | "tucano";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-xl",
        tone === "tucano" ? "bg-tucano-bg text-tucano" : "bg-shade text-mist",
      )}
    >
      <Icon name={icon} size={20} />
    </span>
  );
}

/** Card com uma lista do que aparece depois de conectar (valores em "—"). */
export function PreviewListPanel({
  title,
  items,
  note,
  className,
}: {
  title: string;
  items: readonly { icon: IconName; titulo: string; texto?: string; valor?: string }[];
  note?: ReactNode;
  className?: string;
}) {
  return (
    <Panel className={cn("p-4.5", className)}>
      <PanelHeader title={title} titleClassName="text-17 tracking-normal" />
      <RowList>
        {items.map((item, i) => (
          <ListRow
            key={item.titulo}
            title={item.titulo}
            meta={item.texto}
            value={item.valor}
            valueMeta={item.valor ? <></> : undefined}
            divider={i < items.length - 1}
            leading={<RowIcon icon={item.icon} />}
          />
        ))}
      </RowList>
      {note && <p className="m-0 text-13 leading-[1.55] text-caption">{note}</p>}
    </Panel>
  );
}
