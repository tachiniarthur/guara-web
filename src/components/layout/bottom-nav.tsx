"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { bottomNav, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Barra inferior das telas compactas: 5 destinos com "Conversar" em destaque no centro. */
export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 h-21 border-t border-line bg-card px-1 pt-2 pb-4",
        className,
      )}
    >
      <ul className="m-0 flex list-none items-start p-0">
        {bottomNav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="flex min-w-0 flex-1 justify-center">
              {item.featured ? (
                // "Conversar" abre a conversa por cima da tela, sem sair dela.
                <OpenChat
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-1 border-none bg-transparent p-0 text-sand"
                >
                  <span className="flex h-10 w-13 items-center justify-center rounded-bubble bg-tucano text-canvas">
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span className="text-12 font-bold whitespace-nowrap">{item.shortLabel}</span>
                </OpenChat>
              ) : (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex min-w-14 flex-col items-center gap-1 no-underline"
                >
                  <span
                    className={cn(
                      "mt-1 flex h-8 w-13 items-center justify-center rounded-3xl",
                      active ? "bg-shade text-sand" : "text-mist",
                    )}
                  >
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span
                    className={cn(
                      "text-12 whitespace-nowrap",
                      active ? "font-bold text-sand" : "font-medium text-mist",
                    )}
                  >
                    {item.shortLabel}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
