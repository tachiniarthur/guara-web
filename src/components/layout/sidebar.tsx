"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CountBadge } from "@/components/ui/count-badge";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/features/acesso/session";
import { useUser } from "@/features/usuario/live";
import { isActive, mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

import { AccountPopover } from "./account-actions";
import { BrandLockup } from "./brand";
import { UserInitials } from "./user-chip";
import { MataArt } from "@/components/ui/mata-art";

/**
 * Menu lateral completo (janelas grandes): marca, destinos e o card do usuário. O Guará não fica
 * aqui: o chat abre pelo atalho da borda direita.
 */
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
        "sticky top-0 h-dvh w-[22rem] shrink-0 flex-col gap-6 overflow-hidden border-r border-line bg-canvas px-5 pt-8 pb-6 tall:gap-10 tall:pt-10",
        className,
      )}
    >
      <BrandLockup className="px-2" />

      <ul className="m-0 flex list-none flex-col gap-1 p-0 tall:gap-2">
        {mainNav.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3.5 rounded-full px-4 text-16 no-underline transition-[color,background-color,translate] duration-200 active:scale-[0.98] tall:h-14 tall:gap-4 tall:px-5 tall:text-17",
                  active
                    ? "bg-sand font-bold text-canvas"
                    : "font-medium text-mist hover:translate-x-0.5 hover:bg-shade hover:text-sand",
                )}
              >
                <Icon name={item.icon} className="tall:size-5.5" />
                <span>{item.label}</span>
                {badgeOf(item) ? <CountBadge count={badgeOf(item)!} className="ml-auto" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>

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
