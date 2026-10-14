"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailList } from "@/components/ui/detail-list";
import { RadioCard } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { SwitchRow } from "@/components/ui/switch";
import { user } from "@/features/usuario/data";

import { exportFormats } from "../data";

/**
 * Diálogos de exportação do relatório: escolher o formato (`?exportar`) e o arquivo pronto
 * (`?exportado`).
 */
export function ExportDialogs() {
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
