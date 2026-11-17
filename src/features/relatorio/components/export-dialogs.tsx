"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button, ButtonLink } from "@/components/ui/button";
import { Presence } from "@/components/ui/presence";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { SwitchRow } from "@/components/ui/switch";
import { useState } from "react";

import { useSession } from "@/features/acesso/session";
import { useUser } from "@/features/usuario/live";

import { exportFormats } from "../data";
import {
  LIVE_EXPORT_FORMATS,
  downloadExport,
  requestExport,
  useReportExport,
  type LiveExportFormat,
} from "../export-live";
import type { LiveExportPeriod } from "./export-menu";

/**
 * Diálogos de exportação do relatório: escolher o formato (`?exportar`) e o arquivo pronto
 * (`?exportado`). Com login, o arquivo é gerado pela API (`?exportado=<id>` acompanha o pedido).
 */
export function ExportDialogs({ live }: { live?: LiveExportPeriod }) {
  const params = useSearchParams();
  const session = useSession();
  const open = params.has("exportar") || params.has("exportado");
  return (
    <Presence show={open}>
      {open && (session.live ? <LiveExportPanels period={live} /> : <ExportPanels />)}
    </Presence>
  );
}

const STATUS_TEXT = {
  queued: "Na fila para gerar…",
  processing: "Gerando o arquivo…",
  ready: "Pronto para baixar.",
  failed: "Não deu para gerar o arquivo.",
  expired: "O arquivo venceu (fica 7 dias). Peça de novo.",
} as const;

function LiveExportPanels({ period }: { period?: LiveExportPeriod }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const close = () => router.replace(pathname, { scroll: false });
  const [format, setFormat] = useState<LiveExportFormat>("pdf");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const id = params.get("exportado") || null;
  const item = useReportExport(id);
  const current = period ?? { period: "mes" as const, label: "Este mês", range: "este mês" };

  if (!id) {
    return (
      <ConfirmDialog
        title="Exportar relatório"
        onClose={close}
        actions={
          <>
            <ButtonLink href={pathname} replace scroll={false} variant="ghost" className="text-15">
              <span>Cancelar</span>
            </ButtonLink>
            <Button
              variant="primary"
              className="text-15"
              disabled={sending}
              onClick={async () => {
                setSending(true);
                setFailed(null);
                try {
                  const created = await requestExport(format, current.period);
                  router.replace(`${pathname}?exportado=${created.id}`, { scroll: false });
                } catch (error) {
                  setFailed(
                    error instanceof Error && error.message
                      ? error.message
                      : "Não deu para pedir o arquivo. Tente de novo.",
                  );
                } finally {
                  setSending(false);
                }
              }}
            >
              <Icon name="arrow-down-to" size={18} />
              <span>{sending ? "Pedindo…" : "Gerar arquivo"}</span>
            </Button>
          </>
        }
      >
        <DetailList
          items={[
            {
              label: "Período",
              value: format === "pdf" ? "Este mês" : `${current.label} · ${current.range}`,
            },
            { label: "Bancos", value: "Todos os bancos conectados" },
          ]}
        />
        <fieldset
          aria-label="Formato"
          className="m-0 flex flex-col gap-2 border-none p-0"
          onChange={(event) =>
            setFormat((event.target as unknown as HTMLInputElement).value as LiveExportFormat)
          }
        >
          {LIVE_EXPORT_FORMATS.map((option) => (
            <RadioCard
              key={option.id}
              name="formato"
              value={option.id}
              title={option.label}
              description={option.detail}
              defaultChecked={format === option.id}
            />
          ))}
        </fieldset>
        {failed && (
          <p role="alert" className="m-0 text-14 text-urucum">
            {failed}
          </p>
        )}
      </ConfirmDialog>
    );
  }

  const status = item.data?.status;
  return (
    <ConfirmDialog
      title={status === "ready" ? "Relatório pronto" : "Exportar relatório"}
      onClose={close}
      actions={
        <>
          <ButtonLink href={pathname} replace scroll={false} variant="ghost" className="text-15">
            <span>Fechar</span>
          </ButtonLink>
          <Button
            variant="primary"
            className="text-15"
            disabled={status !== "ready"}
            onClick={() =>
              item.data &&
              void downloadExport(item.data).catch(() =>
                setFailed("Não deu para baixar. Tente de novo."),
              )
            }
          >
            <Icon name="arrow-down-to" size={18} />
            <span>Baixar</span>
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-tile border border-line-strong bg-shade px-3.5 py-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
        >
          <Icon name={status === "ready" ? "check" : "file-doc"} size={20} />
        </span>
        <span className="flex min-w-0 flex-col leading-[1.3]">
          <strong className="text-14">{item.data?.fileName ?? "Arquivo do relatório"}</strong>
          <span role="status" className="text-12 text-caption">
            {item.error
              ? "Não deu para consultar o pedido."
              : status
                ? (item.data?.error ?? STATUS_TEXT[status])
                : "Consultando…"}
          </span>
        </span>
      </div>
      {(status === undefined || status === "queued" || status === "processing") && !item.error && (
        <p className="m-0 text-13 leading-[1.55] text-mist">
          Pode fechar esta janela: quando ficar pronto, o aviso chega nas notificações.
        </p>
      )}
      {failed && (
        <p role="alert" className="m-0 text-14 text-urucum">
          {failed}
        </p>
      )}
    </ConfirmDialog>
  );
}

function ExportPanels() {
  const user = useUser();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const close = () => router.replace(pathname, { scroll: false });

  if (params.has("exportar")) {
    return (
      <ConfirmDialog
        title="Exportar relatório"
        onClose={close}
        actions={
          <>
            <ButtonLink href={pathname} replace scroll={false} variant="ghost" className="text-15">
              <span>Cancelar</span>
            </ButtonLink>
            <ButtonLink
              href={`${pathname}?exportado`}
              replace
              scroll={false}
              variant="primary"
              className="text-15"
            >
              <Icon name="arrow-down-to" size={18} />
              <span>Gerar arquivo</span>
            </ButtonLink>
          </>
        }
      >
        <DetailList
          items={[
            { label: "Período", value: "1 a 23 de setembro" },
            { label: "Bancos", value: "Nubank e Itaú · 118 lançamentos" },
          ]}
        />
        <fieldset aria-label="Formato" className="m-0 flex flex-col gap-2 border-none p-0">
          {exportFormats.map((format, i) => (
            <RadioCard
              key={format.id}
              name="formato"
              value={format.id}
              title={format.label}
              description={format.detail}
              defaultChecked={i === 0}
            />
          ))}
        </fieldset>
        <SwitchRow
          id="exportar-email"
          title="Enviar também por e-mail"
          description={`Para ${user.email}`}
          defaultChecked
        />
      </ConfirmDialog>
    );
  }

  if (params.has("exportado")) {
    return (
      <ConfirmDialog
        title="Relatório pronto"
        onClose={close}
        actions={
          <>
            <ButtonLink href={pathname} replace scroll={false} variant="ghost" className="text-15">
              <span>Fechar</span>
            </ButtonLink>
            <Button variant="primary" className="text-15">
              <Icon name="arrow-down-to" size={18} />
              <span>Baixar</span>
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-folha-bg text-folha"
          >
            <Icon name="check" size={24} strokeWidth={2.4} />
          </span>
          <p className="m-0 text-15 leading-[1.55] text-mist">
            Enviamos uma cópia para <strong className="text-sand">{user.email}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-tile border border-line-strong bg-shade px-3.5 py-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
          >
            <Icon name="file-doc" size={20} />
          </span>
          <span className="flex min-w-0 flex-col leading-[1.3]">
            <strong className="text-14">guara-relatorio-setembro-2026.pdf</strong>
            <span className="text-12 text-caption">PDF · 1 a 23 de setembro · Nubank e Itaú</span>
          </span>
        </div>
      </ConfirmDialog>
    );
  }

  return null;
}

/** Link que abre o diálogo de exportação na própria tela. */
export function ExportLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link href={`${pathname}?exportar`} scroll={false} className={className}>
      {children}
    </Link>
  );
}
