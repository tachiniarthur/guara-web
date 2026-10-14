import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { DialogText, UrlDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import Link from "next/link";
import { TetoHighlightCard, TetoHistoryChart } from "@/features/gastos/components/teto-cards";
import { categorySpending } from "@/features/gastos/data";
import { ledgerForCategory } from "@/features/gastos/lancamentos";
import { findTeto, tetoDetails, type TetoDetail } from "@/features/gastos/tetos";

export function generateStaticParams() {
  return tetoDetails.map((teto) => ({ id: teto.id }));
}

function EditButton({ teto }: { teto: TetoDetail }) {
  return (
    <ButtonLink href={`/alertas/tetos/${teto.id}/editar`} variant="secondary" size="sm">
      <Icon name="edit" size={18} />
      <span>Editar teto</span>
    </ButtonLink>
  );
}

function DeleteButton({ teto }: { teto: TetoDetail }) {
  return (
    <ButtonLink
      href={`/alertas/tetos/${teto.id}?excluir`}
      scroll={false}
      variant="danger-outline"
      size="sm"
    >
      <Icon name="trash" size={18} />
      <span>Excluir</span>
    </ButtonLink>
  );
}

function HistoryPanel({ teto, width }: { teto: TetoDetail; width?: number }) {
  const limit = teto.tetoCompleto.replace(",00", "");
  const over = teto.historico.filter((h) => h.valor > Number(limit.replace(/\D/g, "")));
  const last3 = teto.historico.slice(2, 5);
  const avg = Math.round(last3.reduce((sum, h) => sum + h.valor, 0) / last3.length);
  const monthNames: Record<string, string> = {
    abr: "abril",
    mai: "maio",
    jun: "junho",
    jul: "julho",
    ago: "agosto",
  };
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title="Últimos 6 meses"
        subtitle={`Teto de ${limit}${over.length ? ` · ${over.map((h) => monthNames[h.mes] ?? h.mes).join(" e ")} passou do limite` : ""}`}
        titleClassName="text-18 tracking-normal"
      />
      <TetoHistoryChart teto={teto} width={width} />
      <p className="m-0 text-12 leading-[1.55] text-caption">
        *setembro até o dia 23. Média dos últimos 3 meses: R$ {avg.toLocaleString("pt-BR")}.
      </p>
    </Panel>
  );
}

function AlertsPanel({ teto, className }: { teto: TetoDetail; className?: string }) {
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader
        title="Avisos"
        subtitle="Cada aviso chega uma única vez por mês"
        titleClassName="text-18 tracking-normal"
      />
      <RowList>
        {teto.avisos.map((aviso, i) => (
          <ListRow
            key={aviso.titulo}
            title={aviso.titulo}
            meta={aviso.quando}
            value={
              aviso.enviado ? (
                <Tag tone="folha" status>
                  <Icon name="check" size={14} strokeWidth={2} />
                  Enviado
                </Tag>
              ) : (
                <Tag tone="neutral" status>
                  Aguardando
                </Tag>
              )
            }
            divider={i < teto.avisos.length - 1}
          />
        ))}
      </RowList>
    </Panel>
  );
}

function CountedPanel({ teto, className }: { teto: TetoDetail; className?: string }) {
  const summary = categorySpending.find((c) => c.id === teto.id);
  const ledger = summary ? ledgerForCategory(teto.id, summary) : undefined;
  const items = (ledger?.dias ?? [])
    .flatMap((d) =>
      d.itens.map((item) => ({ ...item, quando: d.titulo.split(" · ")[1] ?? d.titulo })),
    )
    .slice(0, 5);
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader
        title="Lançamentos que contaram"
        subtitle={`${summary?.lancamentos ?? items.length} em setembro · Nubank e Itaú`}
        titleClassName="text-18 tracking-normal"
        action={
          <Link href={`/gastos/categorias/${teto.id}`} className={panelLinkClass}>
            Ver todos
            <Icon name="chevron-right" size={16} />
          </Link>
        }
      />
      <RowList>
        {items.map((item) => (
          <ListRow
            key={item.id}
            href={`/gastos/lancamentos/${item.id}`}
            title={item.descricao}
            meta={[item.quando, item.hora, item.conta].filter(Boolean).join(" · ")}
            value={item.valor}
          />
        ))}
      </RowList>
    </Panel>
  );
}

export default async function TetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teto = findTeto(id);
  if (!teto) notFound();
  const path = `/alertas/tetos/${teto.id}`;
  const avisos = teto.marcos.map((m) => `R$ ${m.rotulo.replace("teto ", "")}`);

  return (
    <>
      <Page
        padding="detail"
        zoom={1.4}
        className="gap-4 @tab:gap-5 @desk:gap-6"
        header={<MobileHeader title={`Teto de ${teto.categoria}`} back="/alertas/tetos" balanced />}
      >
        <Breadcrumb
          className="hidden flex-wrap @tab:flex"
          items={[
            { label: "Alertas", href: "/alertas" },
            { label: "Tetos de gasto", href: "/alertas/tetos" },
            { label: teto.categoria },
          ]}
        />
        <DetailHeader
          title={`Teto de ${teto.categoria}`}
          subtitle="Setembro 2026"
          actions={
            <div className="flex items-center gap-2">
              <EditButton teto={teto} />
              <DeleteButton teto={teto} />
            </div>
          }
        />

        <div className="contents @tab:hidden">
          <TetoHighlightCard teto={teto} />
          <div className="flex items-center gap-2">
            <EditButton teto={teto} />
            <DeleteButton teto={teto} />
          </div>
          <HistoryPanel teto={teto} />
          <AlertsPanel teto={teto} />
          <CountedPanel teto={teto} />
        </div>

        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          <TetoHighlightCard teto={teto} />
          <div className="grid grid-cols-2 items-stretch gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              <HistoryPanel teto={teto} />
              <AlertsPanel teto={teto} className="grow" />
            </div>
            <CountedPanel teto={teto} />
          </div>
        </div>

        <div className="hidden flex-col gap-6 @desk:flex">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch gap-5">
            <TetoHighlightCard teto={teto} />
            <AlertsPanel teto={teto} />
          </div>
          <div className="grid grid-cols-2 items-stretch gap-5">
            <HistoryPanel teto={teto} width={420} />
            <CountedPanel teto={teto} />
          </div>
        </div>
      </Page>
      <Suspense>
        <UrlDialog
          param="excluir"
          title={`Excluir o teto de ${teto.categoria}?`}
          actions={
            <>
              <ButtonLink href={path} scroll={false} variant="ghost" size="md" className="text-15">
                <span>Cancelar</span>
              </ButtonLink>
              <ButtonLink href="/alertas/tetos" variant="danger" size="md" className="text-15">
                <Icon name="trash" size={18} />
                <span>Excluir teto</span>
              </ButtonLink>
            </>
          }
        >
          <DialogText>
            Os avisos de {avisos.slice(0, -1).join(", ")} e {avisos.at(-1)} param. O histórico do
            teto some, mas seus lançamentos de {teto.categoria} não mudam.
          </DialogText>
        </UrlDialog>
      </Suspense>
    </>
  );
}
