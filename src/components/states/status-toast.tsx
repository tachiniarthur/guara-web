"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const tones = {
  error: { border: "border-urucum", icon: "bg-urucum-bg text-urucum" },
  offline: { border: "border-tucano", icon: "bg-tucano-bg text-tucano" },
  neutral: { border: "border-mist", icon: "bg-shade text-mist" },
} as const;

const subscribeNothing = () => () => {};

/**
 * Aviso flutuante: no topo para erro e falta de internet (abaixo do cabeçalho no celular) e no
 * rodapé para confirmações com desfazer. No desktop ele acompanha a ampliação do conteúdo.
 */
export function StatusToast({
  tone,
  icon,
  title,
  children,
  action,
  position = "top",
}: {
  tone: keyof typeof tones;
  icon: IconName;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  position?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(true);
  // Fora da área de conteúdo (que amplia no desktop), direto no corpo da página.
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none z-40 flex justify-center px-3 md:px-0",
        position === "top"
          ? "absolute inset-x-0 top-16 md:top-6 lg:top-5"
          : "fixed inset-x-0 bottom-24 md:bottom-25 lg:bottom-27.5",
      )}
    >
      <div
        role={tone === "error" ? "alert" : "status"}
        className={cn(
          "pointer-events-auto flex w-full items-center gap-3 rounded-[1.125rem] border bg-field px-3.5 py-3 shadow-[0_12px_32px_rgba(0,0,0,.45)] md:w-140 lg:w-155 lg:zoom-area lg:[--zoom:1.35]",
          tones[tone].border,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            tones[tone].icon,
          )}
        >
          <Icon name={icon} size={18} />
        </span>
        <span className="flex min-w-0 grow flex-col leading-[1.35]">
          <strong className="text-15">{title}</strong>
          <span className="text-13 text-mist">{children}</span>
        </span>
        {action}
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={() => setOpen(false)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-mist hover:bg-shade"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

/** Erro ao atualizar a tela (`?estado=erro`). */
export function ErrorToast() {
  return (
    <StatusToast
      tone="error"
      icon="alert-triangle"
      title="Não deu para atualizar agora"
      action={
        <button
          type="button"
          className="hidden h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-tucano bg-tucano px-4.5 text-14 font-bold whitespace-nowrap text-canvas md:inline-flex"
        >
          <Icon name="retry" size={18} />
          <span>Tentar de novo</span>
        </button>
      }
    >
      Seus dados continuam salvos.
    </StatusToast>
  );
}

/** Sem internet (`?estado=sem-internet`): a tela mostra os dados guardados. */
export function OfflineToast() {
  return (
    <StatusToast tone="offline" icon="wifi-off" title="Sem internet">
      Mostrando os dados de hoje, 14:30. Atualizamos quando a conexão voltar.
    </StatusToast>
  );
}
