"use client";

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
import { findTransaction, ledgerForCategory } from "@/features/gastos/lancamentos";
import { findTeto, type TetoDetail } from "@/features/gastos/tetos";
import { useSession } from "@/features/acesso/session";
import { useCategoryLedger } from "@/features/gastos/live-ledger";
import { useTetosView } from "@/features/gastos/live-tetos";
import type { CategoryLedger } from "@/features/gastos/lancamentos";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";

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
    jan: "janeiro",
    fev: "fevereiro",
    mar: "março",
    abr: "abril",
    mai: "maio",
    jun: "junho",
    jul: "julho",
    ago: "agosto",
    set: "setembro",
    out: "outubro",
    nov: "novembro",
    dez: "dezembro",
  };
  const current = teto.historico.at(-1)?.mes.replace("*", "") ?? "";
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title="Últimos 6 meses"
        subtitle={`Teto de ${limit}${over.length ? ` · ${over.map((h) => monthNames[h.mes] ?? h.mes).join(" e ")} passou do limite` : ""}`}
        titleClassName="text-18 tracking-normal"
      />
      <TetoHistoryChart teto={teto} width={width} />
      <p className="m-0 text-12 leading-[1.55] text-caption">
        *{monthNames[current] ?? current} até hoje. Média dos 3 meses anteriores: R${" "}
        {avg.toLocaleString("pt-BR")}.
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

function CountedPanel({
  teto,
  className,
  live,
}: {
  teto: TetoDetail;
  className?: string;
  /** Modo real: os lançamentos da categoria vindos da API e o id da categoria. */
  live?: { ledger: CategoryLedger | undefined; categoryId: string; mes: string };
}) {
  const summary = live ? undefined : categorySpending.find((c) => c.id === teto.id);
  const ledger = live ? live.ledger : summary ? ledgerForCategory(teto.id, summary) : undefined;
  const items = (ledger?.dias ?? [])
    .flatMap((d) =>
      d.itens.map((item) => ({ ...item, quando: d.titulo.split(" · ")[1] ?? d.titulo })),
    )
    .slice(0, 5);
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader
        title="Lançamentos que contaram"
        subtitle={
          live
            ? `${ledger?.lancamentos ?? items.length} em ${live.mes}`
            : `${summary?.lancamentos ?? items.length} em setembro · Nubank e Itaú`
        }
        titleClassName="text-18 tracking-normal"
        action={
          // Só existe tela de categoria para as categorias com gastos; as demais vão para a lista.
          <Link
            href={
              live
                ? `/gastos/categorias/${live.categoryId}`
                : categorySpending.some((c) => c.id === teto.id)
                  ? `/gastos/categorias/${teto.id}`
                  : "/gastos/lancamentos"
            }
            className={panelLinkClass}
          >
            Ver todos
            <Icon name="chevron-right" size={16} />
          </Link>
        }
      />
      <RowList>
        {items.map((item) => (
          <ListRow
            key={item.id}
            // Lançamento sem tela de detalhe (fora da lista do mês) fica sem link.
            href={live || findTransaction(item.id) ? `/gastos/lancamentos/${item.id}` : undefined}
            title={item.descricao}
            meta={[item.quando, item.hora, item.conta].filter(Boolean).join(" · ")}
            value={item.valor}
          />
        ))}
      </RowList>
    </Panel>
  );
}

/** Um teto: com login, o da API (`id` do teto); no protótipo, o de exemplo (`id` da categoria). */
export function TetoScreen({ id }: { id: string }) {
  const { live } = useSession();
  const real = useTetosView({ enabled: live });
  const liveTeto = real.data?.items.find((item) => item.id === id);
  const ledger = useCategoryLedger(liveTeto?.categoryId ?? "other", {
    enabled: live && Boolean(liveTeto),
  });
  if (live && !real.data) {
    return (
      <Page padding="detail" header={<MobileHeader title="Teto" back="/alertas/tetos" balanced />}>
        {real.error ? <ErrorBlock /> : <LoadingStatus />}
      </Page>
    );
  }
  const teto = live ? liveTeto : findTeto(id);
  if (!teto) notFound();
  const counted = liveTeto
    ? {
        ledger: ledger.data,
        categoryId: liveTeto.categoryId,
        mes: real.data!.mes.split(" ")[0]!.toLowerCase(),
      }
    : undefined;
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
          subtitle={real.data?.mes ?? "Setembro 2026"}
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
          <CountedPanel teto={teto} live={counted} />
        </div>

        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          <TetoHighlightCard teto={teto} />
          <div className="grid grid-cols-2 items-stretch gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              <HistoryPanel teto={teto} />
              <AlertsPanel teto={teto} className="grow" />
            </div>
            <CountedPanel teto={teto} live={counted} />
          </div>
        </div>

        <div className="hidden flex-col gap-6 @desk:flex">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch gap-5">
            <TetoHighlightCard teto={teto} />
            <AlertsPanel teto={teto} />
          </div>
          <div className="grid grid-cols-2 items-stretch gap-5">
            <HistoryPanel teto={teto} width={420} />
            <CountedPanel teto={teto} live={counted} />
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
