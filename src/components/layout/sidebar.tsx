"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { CountBadge } from "@/components/ui/count-badge";
import { Icon } from "@/components/ui/icon";
import { agentOrder, agents } from "@/features/assistentes/data";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { useSession } from "@/features/acesso/session";
import { useUser } from "@/features/usuario/live";
import { isActive, mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { AccountPopover } from "./account-actions";
import { BrandLockup } from "./brand";
import { UserInitials } from "./user-chip";
import { MataArt } from "@/components/ui/mata-art";

/** Assistentes com algo novo para mostrar (bolinha urucum no menu). */
const agentsWithNews = new Set(["quero_quero"]);

/** A turma no menu fica curta; os demais assistentes estão em "Ver todos os assistentes". */
const sidebarAgents = agentOrder.filter((id) => id !== "caramelo" && id !== "onca");

/** Menu lateral completo (janelas grandes): marca, destinos, a turma e o card do usuário. */
export function Sidebar({ className }: { className?: string }) {
  const user = useUser();
  const { live } = useSession();
  // Alertas: as notificações não lidas (com login); no protótipo, o número do design.
  const badgeOf = (item: { href: string; badge?: number }) =>
    live && item.href === "/alertas" ? user.notificacoesNovas : item.badge;
  const { bancosResumo } = user;
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className={cn(
        "sticky top-0 h-dvh w-[22rem] shrink-0 flex-col gap-6 overflow-hidden border-r border-line bg-canvas px-5 pt-8 pb-6",
        className,
      )}
    >
      <BrandLockup className="px-2" />

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {mainNav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3.5 rounded-full px-4 text-16 no-underline transition-[color,background-color,translate] duration-200 active:scale-[0.98]",
                  active
                    ? "bg-sand font-bold text-canvas"
                    : "font-medium text-mist hover:translate-x-0.5 hover:bg-shade hover:text-sand",
                )}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {badgeOf(item) ? <CountBadge count={badgeOf(item)!} className="ml-auto" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5 px-3">
          <span className="text-12 font-extrabold tracking-[.14em] text-caption uppercase">
            Assistentes
          </span>
          <span className="text-13 text-caption">Cada um cuida de uma parte do dinheiro</span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {sidebarAgents.map((id) => {
            const agent = agents[id];
            return (
              <li key={id}>
                <OpenChat
                  agent={id}
                  className="flex min-h-[4.5rem] w-full items-center gap-3 rounded-[1.125rem] border-none bg-transparent px-2.5 py-1.5 text-left text-sand hover:bg-shade"
                >
                  <AgentAvatar agent={id} size={48} />
                  <span className="flex min-w-0 flex-col leading-[1.3]">
                    <strong className="text-15">{agent.nome}</strong>
                    <span className="text-13 text-caption">{agent.papel}</span>
                  </span>
                  {agentsWithNews.has(id) && (
                    <span
                      aria-label="1 alerta novo"
                      className="mr-1.5 ml-auto size-2.5 shrink-0 rounded-full bg-urucum"
                    />
                  )}
                </OpenChat>
              </li>
            );
          })}
        </ul>
        <Link
          href="/assistentes"
          className="mx-3 mt-1 flex min-h-8 items-center gap-1 self-start text-14 font-bold text-sand underline underline-offset-3 hover:text-tucano"
        >
          Ver todos os assistentes
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>

      {/* Espaço flexível: o card do usuário fica sempre no rodapé, sem rolagem no menu. */}
      <div className="min-h-0 grow" />

      {/* O cartão do usuário abre o menu da conta: Meu perfil, Configurações e Sair. */}
      <AccountPopover
        placement="above"
        label={`${user.nome}, ${bancosResumo}. Abrir o menu da conta`}
        triggerClassName="relative isolate flex w-full pressable items-center gap-3 overflow-hidden rounded-bubble border border-line-strong bg-mata p-3 text-left leading-[1.3] text-sand"
      >
        <MataArt className="absolute inset-0 -z-20 size-full" align="right" />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,17,14,0.85)_0%,rgba(11,17,14,0.55)_50%,rgba(11,17,14,0.1)_100%)]"
        />
        <UserInitials initials={user.iniciais} />
        <span className="flex min-w-0 grow flex-col">
          <strong className="text-15">{user.nome}</strong>
          <span className="text-13 text-mist">{bancosResumo}</span>
        </span>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-mist"
        >
          <Icon name="more" />
        </span>
      </AccountPopover>
    </nav>
  );
}
