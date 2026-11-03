"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

/**
 * Botão que leva a outra tela e mostra o carregando até ela abrir (a navegação roda numa
 * transição: `pending` dura até a tela nova estar pronta). Toques repetidos no meio não fazem nada.
 */
export function PendingLinkButton({
  href,
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "type"> & { href: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <Button
      {...props}
      aria-busy={pending || undefined}
      aria-disabled={pending || undefined}
      className={cn(pending && "cursor-progress", className)}
      onClick={() => {
        if (pending) return;
        startTransition(() => router.push(href));
      }}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </Button>
  );
}
