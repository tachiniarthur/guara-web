import Link from "next/link";

import { cn } from "@/lib/utils";

import { Icon, type IconName } from "./icon";

export type ActionItem = {
  icon: IconName;
  label: string;
  description?: string;
  href?: string;
  /** Ação destrutiva (urucum). */
  danger?: boolean;
};

/** Lista de ações com ícone (ex.: "Mais ações" de um lançamento). */
export function ActionList({ items, className }: { items: ActionItem[]; className?: string }) {
  return (
    <ul className={cn("m-0 flex list-none flex-col p-0", className)}>
      {items.map((item) => {
        const rowClass = cn(
          "flex min-h-[3.8125rem] w-full items-center gap-3.5 border-b border-line bg-transparent px-1.5 py-1 text-left no-underline hover:bg-shade/40",
          item.danger ? "text-urucum" : "text-sand",
        );
        const content = (
          <>
            <span className={item.danger ? "text-urucum" : "text-mist"}>
              <Icon name={item.icon} />
            </span>
            <span className="flex grow flex-col leading-[1.35]">
              <span className="text-16 font-semibold">{item.label}</span>
              {item.description && <span className="text-13 text-caption">{item.description}</span>}
            </span>
          </>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className={rowClass}>
                {content}
              </Link>
            ) : (
              <button type="button" className={cn(rowClass, "border-x-0 border-t-0")}>
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
