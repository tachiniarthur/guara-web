"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { Presence } from "@/components/ui/presence";
import { useSession } from "@/features/acesso/session";
import { accountLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const subscribeNothing = () => () => {};

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-[0.875rem] border-none bg-transparent px-3 text-left text-15 font-semibold text-sand no-underline hover:bg-shade";

/** "Quer mesmo sair?": confirma antes de encerrar a sessão e voltar para a entrada. */
export function SignOutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // No `body`: dentro do menu lateral (sticky) o diálogo ficaria por baixo do conteúdo.
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return createPortal(
    <Presence show={open}>{open && <SignOutConfirm onClose={onClose} />}</Presence>,
    document.body,
  );
}

function SignOutConfirm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { signOut } = useSession();
  const [leaving, setLeaving] = useState(false);

  async function leave() {
    setLeaving(true);
    try {
      await signOut();
      router.replace("/boas-vindas");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <ConfirmDialog
      title="Sair da conta?"
      centered
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" className="text-15" onClick={onClose}>
            <span>Cancelar</span>
          </Button>
          <Button
            variant="danger"
            className="text-15"
            disabled={leaving}
            onClick={() => void leave()}
          >
            <Icon name="log-out" size={18} />
            <span>{leaving ? "Saindo…" : "Sair"}</span>
          </Button>
        </>
      }
    >
      <p className="m-0 text-15 leading-[1.5] text-mist">
        Você volta para a tela de entrada. Seus dados continuam guardados; é só entrar de novo
        quando quiser.
      </p>
    </ConfirmDialog>
  );
}

/** Os itens da conta (Meu perfil, Configurações e Sair), num menu ou no fim de outro menu. */
export function AccountMenuItems({
  onNavigate,
  onSignOut,
}: {
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {accountLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          role="menuitem"
          onClick={onNavigate}
          className={itemClass}
        >
          <span className="text-mist">
            <Icon name={item.icon} />
          </span>
          <span className="grow">{item.label}</span>
        </Link>
      ))}
      {/* Sair fica separado dos destinos da conta. */}
      <div role="separator" className="mx-3 my-1 h-px bg-line" />
      <button
        type="button"
        role="menuitem"
        onClick={onSignOut}
        className={cn(itemClass, "text-urucum hover:bg-urucum-bg")}
      >
        <Icon name="log-out" />
        <span className="grow">Sair</span>
      </button>
    </>
  );
}

/**
 * Menu suspenso da conta, aberto pelo cartão do usuário (menu lateral) ou pelas iniciais (trilho):
 * Meu perfil, Configurações e Sair. Esc ou um toque fora fecham; Sair pede confirmação.
 * `placement`: acima do cartão ("above") ou ao lado das iniciais ("side").
 */
export function AccountPopover({
  placement,
  label,
  triggerClassName,
  menuClassName,
  children,
}: {
  placement: "above" | "side";
  /** Nome do botão para o leitor de tela. */
  label: string;
  triggerClassName?: string;
  menuClassName?: string;
  /** O que aparece no botão (cartão do usuário ou iniciais). */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  // Esc e um toque fora (do botão e do menu) fecham.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapper.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const panel = (
    <div
      ref={menu}
      id={menuId}
      role="menu"
      aria-label="Conta"
      data-motion="menu"
      className={cn(
        "z-40 flex flex-col gap-0.5 rounded-[1.25rem] border border-line-strong bg-field p-1.5 shadow-[0_1px_2px_rgba(0,0,0,.4),0_12px_32px_rgba(0,0,0,.45)]",
        placement === "above"
          ? "absolute inset-x-0 bottom-[calc(100%+0.5rem)] origin-bottom"
          : // Ao lado do trilho (que rola e cortaria o menu): fixo na tela, fora dele.
            "fixed bottom-5 left-[6.25rem] w-60 origin-bottom-left",
        menuClassName,
      )}
    >
      <AccountMenuItems
        onNavigate={() => setOpen(false)}
        onSignOut={() => {
          setOpen(false);
          setConfirming(true);
        }}
      />
    </div>
  );

  return (
    <div ref={wrapper} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={triggerClassName}
      >
        {children}
      </button>
      {placement === "side" ? (
        mounted && createPortal(<Presence show={open}>{open && panel}</Presence>, document.body)
      ) : (
        <Presence show={open}>{open && panel}</Presence>
      )}
      <SignOutDialog open={confirming} onClose={() => setConfirming(false)} />
    </div>
  );
}
