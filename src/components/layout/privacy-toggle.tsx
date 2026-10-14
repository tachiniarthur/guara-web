"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/stores/privacy";

/** Liga e desliga "ocultar valores" (olho no card de saldo). */
export function PrivacyToggle({ className }: { className?: string }) {
  const { hidden, toggle } = usePrivacy();
  return (
    <button
      type="button"
      aria-label="Ocultar valores"
      aria-pressed={hidden}
      onClick={toggle}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-mist hover:bg-shade",
        className,
      )}
    >
      <Icon name={hidden ? "eye-alt" : "eye"} />
    </button>
  );
}

/**
 * Lembrete com os valores ocultos: "Mostrar valores" no cabeçalho (só aparece enquanto estão
 * ocultos). "icon": botão redondo do celular · "pill": botão com texto do desktop.
 */
export function ShowValuesButton({
  variant,
  className,
}: {
  variant: "icon" | "pill";
  className?: string;
}) {
  const { hidden, setHidden } = usePrivacy();
  if (!hidden) return null;
  return variant === "icon" ? (
    <button
      type="button"
      aria-label="Mostrar valores"
      title="Mostrar valores"
      onClick={() => setHidden(false)}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-shade text-tucano",
        className,
      )}
    >
      <Icon name="eye-alt" />
    </button>
  ) : (
    <button
      type="button"
      aria-label="Mostrar valores"
      onClick={() => setHidden(false)}
      className={cn(
        "flex h-12 items-center gap-2 rounded-full border border-line-strong bg-shade px-4 text-14 font-bold whitespace-nowrap text-sand",
        className,
      )}
    >
      <Icon name="eye-alt" size={18} />
      Mostrar valores
    </button>
  );
}
