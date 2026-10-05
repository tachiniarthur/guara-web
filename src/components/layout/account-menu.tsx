"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { CountBadge } from "@/components/ui/count-badge";
import { Icon } from "@/components/ui/icon";
import { bancosResumo, user } from "@/features/usuario/data";
import { accountMenu } from "@/lib/navigation";

import { UserInitials } from "./user-chip";

/** Botão com as iniciais que abre o menu da conta (destinos fora da barra inferior). */
export function AccountMenuButton() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`Menu da conta de ${user.nome}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0"
      >
        <UserInitials initials={user.iniciais} size={34} className="text-13" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu da conta"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 border-none bg-[rgba(5,8,6,0.55)] p-0"
          />
          <div
            id={menuId}
            role="menu"
            aria-label="Conta"
            className="fixed top-[3.625rem] right-3 z-31 flex w-[18.75rem] flex-col gap-0.5 rounded-[1.375rem] border border-line-strong bg-field p-2 shadow-[0_1px_2px_rgba(0,0,0,.4),0_12px_32px_rgba(0,0,0,.45)]"
          >
            <div className="mb-1 flex items-center gap-3 border-b border-line px-3 pt-2.5 pb-3">
              <UserInitials initials={user.iniciais} size={40} className="text-15" />
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <strong className="text-15">{user.nome}</strong>
                <span className="text-13 text-caption">{bancosResumo}</span>
              </span>
            </div>
            {accountMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-[0.875rem] px-3 text-15 font-semibold text-sand no-underline hover:bg-shade"
              >
                <span className="text-mist">
                  <Icon name={item.icon} />
                </span>
                <span className="grow">{item.label}</span>
                {item.badge ? (
                  <CountBadge count={item.badge} size="sm" label={`${item.badge} novos`} />
                ) : null}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
