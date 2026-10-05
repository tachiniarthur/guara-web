"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Icon } from "@/components/ui/icon";
import { agentOrder, agents } from "@/features/assistentes/data";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { user } from "@/features/usuario/data";
import { isActive, mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { BrandLogo } from "./brand";

/** Trilho lateral com rótulos (janelas médias). Na horizontal fica mais compacto para caber na altura. */
export function Rail({ className }: { className?: string }) {
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
                    "flex h-8 w-14 items-center justify-center rounded-3xl",
                    active ? "bg-shade text-sand" : "text-mist",
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

      <div className="flex w-[4.5rem] flex-col items-center gap-2 border-t border-line pt-3.5">
        <span className="text-9 font-extrabold tracking-[.04em] text-caption uppercase">
          Assistentes
        </span>
        <ul
          aria-label="Assistentes"
          className="m-0 flex list-none flex-col items-center gap-2.5 p-0 landscape:grid landscape:grid-cols-[repeat(2,2rem)] landscape:justify-center landscape:gap-x-2 landscape:gap-y-1.5"
        >
          {agentOrder.map((id) => {
            const agent = agents[id];
            return (
              <li key={id}>
                <OpenChat
                  agent={id}
                  aria-label={`Conversar com ${agent.nome}, ${agent.papel}${id === "quero-quero" ? ", 1 alerta novo" : ""}`}
                  title={`${agent.nome} · ${agent.papel}`}
                  className="flex min-h-11 w-[4.5rem] flex-col items-center gap-1 border-none bg-transparent p-0 landscape:min-h-8 landscape:w-8"
                >
                  <span className="relative">
                    <AgentAvatar
                      agent={id}
                      size={40}
                      variant="ring"
                      className="landscape:size-8!"
                    />
                    {id === "quero-quero" && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-px -right-px size-[0.6875rem] rounded-full bg-urucum shadow-[0_0_0_2px_var(--guara-canvas)]"
                      />
                    )}
                  </span>
                  <span className="text-11 font-semibold whitespace-nowrap text-mist landscape:hidden">
                    {agent.nome}
                  </span>
                </OpenChat>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grow" />

      <Link
        href="/perfil"
        aria-label="Meu perfil"
        className="flex size-11 items-center justify-center rounded-full bg-tucano text-14 font-bold text-canvas no-underline"
      >
        {user.iniciais}
      </Link>
    </nav>
  );
}
