"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { Presence } from "@/components/ui/presence";
import { cn } from "@/lib/utils";

import { exportFormats } from "../data";
import { LIVE_EXPORT_FORMATS, requestExport, type LiveExportFormat } from "../export-live";
import type { ReportPeriodId } from "../live";

/** O período aberto no Relatório (com login): o arquivo sai dele. */
export type LiveExportPeriod = { period: ReportPeriodId; label: string; range: string };

/**
 * "Exportar" com o menu de formatos. Protótipo: PDF, Excel e CSV de exemplo. Com login, PDF dos
 * gastos do mês e CSV dos lançamentos do período, gerados pela API.
 */
export function ExportMenu({
  defaultOpen = false,
  className,
  live,
}: {
  defaultOpen?: boolean;
  className?: string;
  live?: LiveExportPeriod;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState<LiveExportFormat | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent | KeyboardEvent) {
      if (
        event instanceof KeyboardEvent
          ? event.key === "Escape"
          : !ref.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-full pressable items-center justify-center gap-2 rounded-full border border-line-strong bg-card px-4 text-14 font-bold whitespace-nowrap hover:bg-shade @tab:w-auto"
      >
        <Icon name="download" size={18} />
        Exportar
        <Icon
          name="chevron-down"
          size={16}
          className={cn(
            "transition-transform duration-(--duration-popover) ease-out-soft",
            open && "rotate-180",
          )}
        />
      </button>
      <Presence show={open}>
        {open && (
          <div
            role="menu"
            aria-label="Exportar relatório"
            data-motion="menu"
            className="absolute top-[3.25rem] right-0 z-5 flex w-[21.75rem] origin-top-right flex-col gap-0.5 rounded-bubble border border-line-strong bg-field p-2 shadow-[0_1px_2px_rgba(0,0,0,.4),0_8px_24px_rgba(0,0,0,.25)]"
          >
            {(live ? LIVE_EXPORT_FORMATS : exportFormats).map((format, i) => (
              <button
                key={format.id}
                type="button"
                role="menuitem"
                autoFocus={i === 0}
                disabled={busy !== null}
                onClick={async () => {
                  if (!live) {
                    setOpen(false);
                    router.replace(`${pathname}?exportado`, { scroll: false });
                    return;
                  }
                  setBusy(format.id as LiveExportFormat);
                  setFailed(null);
                  try {
                    const item = await requestExport(format.id as LiveExportFormat, live.period);
                    setOpen(false);
                    router.replace(`${pathname}?exportado=${item.id}`, { scroll: false });
                  } catch (error) {
                    setFailed(
                      error instanceof Error && error.message
                        ? error.message
                        : "Não deu para pedir o arquivo. Tente de novo.",
                    );
                  } finally {
                    setBusy(null);
                  }
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-full border-none bg-transparent px-3 py-2 text-left text-sand hover:bg-shade focus-visible:bg-shade"
              >
                <span className="flex size-[2.375rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas">
                  <Icon name={format.icon} size={18} />
                </span>
                <span className="flex flex-col leading-[1.35]">
                  <strong className="text-14">
                    {busy === format.id ? "Pedindo o arquivo…" : format.label}
                  </strong>
                  <span className="text-12 text-caption">{format.detail}</span>
                </span>
              </button>
            ))}
            {failed && (
              <p role="alert" className="m-0 px-3 pt-1 text-12 leading-normal text-urucum">
                {failed}
              </p>
            )}
            {live ? (
              <p className="m-0 mt-1 border-t border-line px-3 pt-2.5 pb-1 text-12 leading-normal text-mist">
                O CSV usa o período atual:{" "}
                <strong className="text-sand">{`${live.label} · ${live.range}`}</strong>. Quando
                ficar pronto, o aviso chega nas notificações.
              </p>
            ) : (
              <p className="m-0 mt-1 border-t border-line px-3 pt-2.5 pb-1 text-12 leading-normal text-mist">
                Usa o período e os filtros atuais:{" "}
                <strong className="text-sand">Este mês · Todos os bancos</strong>. O arquivo também
                chega no seu e-mail.
              </p>
            )}
          </div>
        )}
      </Presence>
    </div>
  );
}
