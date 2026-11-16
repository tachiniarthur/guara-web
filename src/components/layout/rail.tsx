"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GuaraAvatar } from "@/components/ui/guara-avatar";
import { Icon } from "@/components/ui/icon";
import { guara } from "@/features/guara/identity";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { useUser } from "@/features/usuario/live";
import { isActive, mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { AccountPopover } from "./account-actions";
import { BrandLogo } from "./brand";

/** Trilho lateral com rótulos (janelas médias). Na horizontal fica mais compacto para caber na altura. */
export function Rail({ className }: { className?: string }) {
  const user = useUser();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className={cn(
        "sticky top-0 isolate scrollbar-none h-dvh w-[5.5rem] shrink-0 flex-col items-center gap-6 overflow-y-auto border-r border-line pt-6 pb-5 landscape:gap-4 landscape:pt-[1.125rem] landscape:pb-4",
        className,
      )}
    >
      <BrandLogo size={56} />

      <ul className="m-0 flex list-none flex-col gap-3 p-0 landscape:gap-1.5">
        {mainNav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-14 w-[4.5rem] flex-col items-center gap-1 text-mist no-underline"
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-3xl transition-[background-color,color,scale] duration-200",
                    active ? "scale-105 bg-shade text-sand" : "text-mist hover:bg-shade/60",
                  )}
                >
                  <Icon name={item.icon} size={22} />
                </span>
                <span
                  className={cn(
                    item.shortLabel.length > 10 ? "text-11" : "text-12",
                    active ? "font-bold text-sand" : "font-medium text-mist",
                  )}
                >
                  {item.shortLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex w-[4.5rem] flex-col items-center border-t border-line pt-3.5">
        <OpenChat
          fresh
          aria-label={`Conversar com o ${guara.nome}`}
          title={guara.nome}
          className="flex min-h-11 w-[4.5rem] flex-col items-center gap-1 border-none bg-transparent p-0"
        >
          <GuaraAvatar size={40} variant="ring" className="landscape:size-8!" />
          <span className="text-11 font-semibold whitespace-nowrap text-mist landscape:hidden">
            {guara.curto}
          </span>
        </OpenChat>
      </div>

      <div className="grow" />

      <AccountPopover
        placement="side"
        label={`Menu da conta de ${user.nome}`}
        triggerClassName="flex size-11 pressable items-center justify-center rounded-full border-none bg-tucano p-0 text-14 font-bold text-canvas"
      >
        {user.iniciais}
      </AccountPopover>
    </nav>
  );
}
