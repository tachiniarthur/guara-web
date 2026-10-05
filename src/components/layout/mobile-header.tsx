import type { ReactNode } from "react";

import { IconButtonLink } from "@/components/ui/icon-button";
import { user } from "@/features/usuario/data";
import { cn } from "@/lib/utils";

import { AccountMenuButton } from "./account-menu";
import { BrandLockup } from "./brand";

type MobileHeaderProps = {
  /** "brand": logo e nome; caso contrário, título centralizado. */
  variant?: "brand" | "title";
  title?: string;
  subtitle?: string;
  /** Link de volta (seta) ou de fechar (x) à esquerda. */
  back?: string;
  close?: string;
  /** Ações à direita (antes do botão da conta). */
  actions?: ReactNode;
  /** Mostra o botão com as iniciais que abre o menu da conta. */
  account?: boolean;
  /** Mostra o sino de notificações (variante "brand"). */
  notifications?: boolean;
  className?: string;
};

/** Barra superior das telas compactas (até 599 px). Some a partir do tablet. */
export function MobileHeader({
  variant = "title",
  title,
  subtitle,
  back,
  close,
  actions,
  account = false,
  notifications = false,
  className,
}: MobileHeaderProps) {
  return (
    <header className={cn("flex h-15 shrink-0 items-center gap-2 px-2 md:hidden", className)}>
      {variant === "brand" ? (
        <>
          <div className="pl-2">
            <BrandLockup size="md" />
          </div>
          <div className="grow" />
        </>
      ) : (
        <>
          {back ? (
            <IconButtonLink href={back} icon="chevron-left" label="Voltar" variant="ghost" />
          ) : close ? (
            <IconButtonLink href={close} icon="x" label="Fechar" variant="ghost" />
          ) : (
            <div className="w-11 shrink-0" />
          )}
          <div className="flex min-w-0 grow flex-col items-center leading-[1.3]">
            {title && <strong className="text-16">{title}</strong>}
            {subtitle && <span className="text-12 text-caption">{subtitle}</span>}
          </div>
        </>
      )}
      <div className="flex items-center gap-1">
        {notifications && (
          <IconButtonLink
            href="/alertas"
            icon="bell"
            label={`Notificações, ${user.notificacoesNovas} novas`}
            variant="ghost"
          />
        )}
        {actions}
        {account && <AccountMenuButton />}
      </div>
    </header>
  );
}
