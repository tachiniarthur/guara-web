"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type DialogProps = {
  title: string;
  /** Título visível, quando difere do nome acessível (ex.: mais curto no celular). */
  heading?: ReactNode;
  children?: ReactNode;
  /** Botões (Cancelar e a ação principal), alinhados à direita. */
  actions?: ReactNode;
  onClose: () => void;
  /** Janela centralizada também no celular (confirmações curtas). */
  centered?: boolean;
  className?: string;
};

/**
 * Diálogo de confirmação: painel que sobe de baixo, com alça, no celular; janela centralizada
 * no tablet (520px) e no desktop (560px). Fundo escurecido a 72%; Esc fecha.
 */
export function ConfirmDialog({
  title,
  heading,
  children,
  actions,
  onClose,
  centered,
  className,
}: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 border-none bg-[rgba(5,9,7,0.72)]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-3.5 rounded-t-[1.75rem] border-t border-line-strong bg-card px-4 pb-7 text-sand",
          centered &&
            "inset-x-auto top-1/2 bottom-auto left-1/2 w-[21.25rem] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[1.75rem] border p-7 shadow-[0_24px_64px_rgba(0,0,0,.5)]",
          "md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[32.5rem] md:-translate-x-1/2 md:-translate-y-1/2 md:gap-4 md:rounded-[1.75rem] md:border md:p-7 md:shadow-[0_24px_64px_rgba(0,0,0,.5)] lg:w-[35rem]",
          className,
        )}
      >
        <div className={cn("flex justify-center pt-2.5 pb-0.5 md:hidden", centered && "hidden")}>
          <span aria-hidden="true" className="h-1 w-10 rounded-[2px] bg-line-strong" />
        </div>
        <h2 className={cn("m-0 font-display text-20 font-bold md:text-22", centered && "text-22")}>
          {heading ?? title}
        </h2>
        {children}
        {actions && (
          <div className="flex flex-wrap items-center justify-end gap-2.5">{actions}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Abre o diálogo quando a URL tem `?<param>` (ex.: /alertas/tetos/lazer?excluir), para que o
 * link "Excluir" funcione como um link comum. Fechar tira o parâmetro.
 */
export function UrlDialog({ param, ...props }: Omit<DialogProps, "onClose"> & { param: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  if (!params.has(param)) return null;
  return <ConfirmDialog {...props} onClose={() => router.replace(pathname, { scroll: false })} />;
}

/** Texto do diálogo (15px, Seriema). */
export function DialogText({ children }: { children: ReactNode }) {
  return <p className="m-0 text-15 leading-[1.55] text-mist">{children}</p>;
}
