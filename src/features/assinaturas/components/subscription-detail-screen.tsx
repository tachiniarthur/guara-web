"use client";

import { ValueBars } from "@/components/charts/value-bars";
import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { GuaraTip } from "@/components/ui/guara-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { Tag } from "@/components/ui/tag";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock, StateBlock } from "@/components/states/state-block";
import { useSession } from "@/features/acesso/session";

import {
  subscriptionDetailFor,
  subscriptions,
  type Subscription,
  type SubscriptionDetail,
} from "../data";
import { useAssinaturaDetail } from "../live";

/** Textos que, com login, saem dos dados (no protótipo, os do design). */
type Extras = {
  aumentoRotulo: string | null;
  dica: string;
  rotuloHistorico: string;
  notaPrevisto: string | null;
};
type Props = { item: Subscription; detail: SubscriptionDetail; extras?: Extras };

function Note({
  tone,
  icon,
  children,
}: {
  tone: "tucano" | "neutral";
  icon: "info-lg" | "lock";
  children: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-[0.875rem] px-3.5 py-3 text-13 leading-normal text-sand ${tone === "tucano" ? "bg-tucano-bg" : "bg-shade"}`}
    >
      <span className={`mt-px ${tone === "tucano" ? "text-tucano" : "text-mist"}`}>
        <Icon name={icon} size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function SummaryPanel({ item, detail, extras }: Props) {
  return (
    <Panel className="gap-4 p-5.5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-[3.375rem] shrink-0 items-center justify-center rounded-[0.875rem] border border-line bg-canvas font-display text-22 font-bold"
        >
          {item.nome.charAt(0)}
        </span>
        <span className="flex grow flex-col leading-[1.3]">
          <strong className="text-20">{item.nome}</strong>
          <span className="text-13 text-mist">
            {item.categoria} · {item.conta}
            {item.dia > 0 && ` · todo dia ${item.dia}`}
          </span>
        </span>
        {detail.aumento && (
          <Tag tone="tucano" status>
            <Icon name="arrow-up" size={14} strokeWidth={2} />
            {extras ? extras.aumentoRotulo : "Subiu R$ 5,00"}
          </Tag>
        )}
      </div>
      <div className="grid grid-cols-1 items-stretch gap-2.5 @tab:grid-cols-3">
        <StatTile
          label={item.periodo === "por ano" ? "Valor por ano" : "Valor por mês"}
          value={item.valor}
          hint={
            extras
              ? detail.aumento
                ? `desde ${detail.aumento.desde}`
                : item.conta
              : detail.aumento
                ? "a partir de outubro"
                : "no cartão"
          }
          valueClassName="text-19"
        />
        <StatTile
          label="Próxima cobrança"
          value={detail.proximaData}
          hint={
            extras
              ? `${item.valor} · ${item.conta}`
              : `${item.valor} no ${item.conta.split(" ")[0]}`
          }
          valueClassName="text-19"
        />
        <StatTile
          label="Por ano"
          value={detail.porAno.valor}
          hint={detail.porAno.nota}
          valueClassName="text-19"
        />
      </div>
    </Panel>
  );
}

function IncreasePanel({ detail }: { detail: SubscriptionDetail }) {
  const a = detail.aumento;
  if (!a) return null;
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader title="Aumento de preço" titleClassName="text-18 tracking-normal" />
      <p className="m-0 text-14 leading-[1.55] text-mist">
        Passou de <strong className="text-sand">{a.de}</strong> para{" "}
        <strong className="text-sand">{a.para}</strong> por mês ({a.percentual}). A primeira
        cobrança com o preço novo é a de {a.desde}.
      </p>
      <Note tone="tucano" icon="info-lg">
        {`No ano, são ${a.noAno} a mais do que você pagava.`}
      </Note>
    </Panel>
  );
}

function HistoryPanel({
  item,
  detail,
  extras,
  wide,
  className,
}: Props & { wide?: boolean; className?: string }) {
  const regular = detail.historico.filter((h) => !h.previsto);
  const next = detail.historico.find((h) => h.previsto);
  const label =
    extras?.rotuloHistorico ??
    `${item.nome}: R$ ${regular[0]?.display} de abril a setembro; R$ ${next?.display} previsto para outubro`;
  // Escala pelo maior valor (as barras sempre cabem, com espaço para o número em cima).
  const base = wide ? 178 : 128;
  const max = Math.max(...detail.historico.map((h) => h.valor), 0);
  const scale = max > 0 ? (base - (wide ? 38 : 31)) / max : 0;
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader
        title="Histórico de cobranças"
        subtitle={`Últimos 6 meses · ${detail.totalSeisMeses}`}
        titleClassName="text-18 tracking-normal"
      />
      <ValueBars
        width={wide ? 900 : 340}
        height={wide ? 200 : 150}
        base={base}
        scale={scale}
        label={label}
        items={detail.historico.map((h) => ({
          label: h.mes,
          value: h.valor,
          display: h.display,
          color: h.previsto && detail.aumento ? "#F2C230" : "#93A198",
        }))}
      />
      {detail.cobrancas.length > 0 ? (
        <RowList>
          {detail.cobrancas.map((c, i) => (
            <ListRow
              key={`${c.data}-${i}`}
              title={item.periodo === "por ano" ? "Cobrança anual" : "Cobrança mensal"}
              meta={c.data}
              value={c.valor}
            />
          ))}
        </RowList>
      ) : (
        <p className="m-0 text-14 text-mist">Nenhuma cobrança encontrada nos últimos 6 meses.</p>
      )}
      {(extras ? extras.notaPrevisto : "*outubro previsto") && (
        <p className="m-0 text-12 leading-[1.55] text-caption">
          {extras ? extras.notaPrevisto : "*outubro previsto"}
        </p>
      )}
    </Panel>
  );
}

function UsagePanel({ detail, className }: { detail: SubscriptionDetail; className?: string }) {
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader title="Uso recente" titleClassName="text-18 tracking-normal" />
      <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em]">
        —
      </span>
      <p className="m-0 text-14 leading-[1.55] text-mist">{detail.uso}</p>
    </Panel>
  );
}

function CancelPanel({ detail, className }: { detail: SubscriptionDetail; className?: string }) {
  return (
    <Panel className={`gap-3.5 p-5.5 ${className ?? ""}`}>
      <PanelHeader title="Como cancelar" titleClassName="text-18 tracking-normal" />
      <ol className="m-0 flex flex-col gap-1.5 pl-5 text-14 leading-normal text-mist">
        {detail.cancelar.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <Note tone="neutral" icon="lock">
        O Guará não cancela por você e não tem acesso à sua conta no serviço.
      </Note>
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="sm">
          <Icon name="x" size={18} />
          <span>Não é assinatura</span>
        </Button>
      </div>
    </Panel>
  );
}

function Tip({ text }: { text?: string }) {
  return (
    <GuaraTip
      named
      action={
        <ButtonLink href="/simulador/corte" variant="secondary" size="sm">
          <span>Simular corte</span>
        </ButtonLink>
      }
    >
      {text ??
        "Com o aumento, as 4 assinaturas passam a somar R$ 101,60 por mês. Quer ver quanto sobraria cortando uma delas?"}
    </GuaraTip>
  );
}

/** Detalhe de uma assinatura: com login, da API; no protótipo, dos dados de exemplo. */
export function SubscriptionDetailScreen({ id }: { id: string }) {
  const { live } = useSession();
  const fromApi = useAssinaturaDetail(id, { enabled: live });
  const prototype = live ? undefined : subscriptions.find((s) => s.id === id);
  if (live && (fromApi.error || fromApi.missing || !fromApi.data)) {
    return (
      <Page
        padding="detail"
        className="gap-4"
        header={<MobileHeader title="Assinatura" back="/assinaturas" balanced />}
      >
        <Breadcrumb
          className="hidden flex-wrap @tab:flex"
          items={[{ label: "Assinaturas", href: "/assinaturas" }, { label: "Assinatura" }]}
        />
        {fromApi.missing ? (
          <StateBlock
            icon="repeat-alt"
            title="Assinatura não encontrada"
            action={
              <ButtonLink href="/assinaturas" size="md">
                <span>Ver assinaturas</span>
              </ButtonLink>
            }
          >
            Ela pode ter sido marcada como “não é assinatura” ou ter parado de cobrar.
          </StateBlock>
        ) : fromApi.error ? (
          <ErrorBlock />
        ) : (
          <>
            <LoadingStatus />
            <p className="m-0 text-14 text-mist">Carregando a assinatura…</p>
          </>
        )}
      </Page>
    );
  }
  const item = live ? fromApi.data!.item : prototype;
  if (!item) return <ErrorBlock />;
  const detail = live ? fromApi.data!.detail : subscriptionDetailFor(item);
  const extras: Extras | undefined = live ? fromApi.data!.detail : undefined;

  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title={item.nome} subtitle="Assinatura" back="/assinaturas" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Assinaturas", href: "/assinaturas" }, { label: item.nome }]}
      />
      <DetailHeader title={item.nome} subtitle={`${item.categoria} · ${item.conta}`} />

      <div className="contents @tab:hidden">
        <SummaryPanel item={item} detail={detail} extras={extras} />
        <IncreasePanel detail={detail} />
        <Tip text={extras?.dica} />
        <HistoryPanel item={item} detail={detail} extras={extras} />
        <UsagePanel detail={detail} />
        <CancelPanel detail={detail} />
      </div>

      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <SummaryPanel item={item} detail={detail} extras={extras} />
        <div className="grid grid-cols-2 items-stretch gap-4">
          <div className="flex min-w-0 flex-col gap-4">
            <IncreasePanel detail={detail} />
            <UsagePanel detail={detail} className="grow" />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <Tip text={extras?.dica} />
            <CancelPanel detail={detail} className="grow" />
          </div>
        </div>
        <HistoryPanel item={item} detail={detail} extras={extras} />
      </div>

      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-stretch gap-5">
          <div className="flex min-w-0 flex-col gap-4">
            <SummaryPanel item={item} detail={detail} extras={extras} />
            <HistoryPanel item={item} detail={detail} extras={extras} wide className="grow" />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <IncreasePanel detail={detail} />
            <UsagePanel detail={detail} />
            <CancelPanel detail={detail} className="grow" />
          </div>
        </div>
        <Tip text={extras?.dica} />
      </div>
    </Page>
  );
}
