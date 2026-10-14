import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/ui/detail-list";
import { Icon, type IconName } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { LineChart } from "@/features/ativo/components/line-compare-chart";
import { propertyDetail, vehicleDetail } from "@/features/bens/data";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { cn } from "@/lib/utils";

const details = { apto: propertyDetail, onix: vehicleDetail };
type Detail = typeof propertyDetail | typeof vehicleDetail;

export function generateStaticParams() {
  return Object.keys(details).map((bem) => ({ bem }));
}

function Hero({ bem, wide }: { bem: Detail; wide?: boolean }) {
  return (
    <MataCard className={cn("gap-2", wide && "p-6")}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
        >
          <Icon name={bem.tipo === "imovel" ? "building" : "car-front"} size={20} />
        </span>
        <span className="flex flex-col leading-[1.3]">
          <span className="text-14 text-[#C5D8CB]">{bem.linha}</span>
          <strong className="text-18">{bem.nome}</strong>
        </span>
      </div>
      <span className="text-14 text-[#C5D8CB]">{bem.rotuloValor}</span>
      <span
        className={cn(
          "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
          wide ? "text-38" : "text-36",
        )}
      >
        {bem.valor}
      </span>
      <span className="text-14 text-[#E4EEE6]">{bem.atualizacao}</span>
    </MataCard>
  );
}

function Actions({ bem }: { bem: Detail }) {
  const items: { icon: IconName; label: string; ghost?: boolean }[] =
    bem.tipo === "imovel"
      ? [
          { icon: "retry", label: "Atualizar valor" },
          { icon: "edit", label: "Atualizar saldo" },
          { icon: "edit", label: "Editar", ghost: true },
        ]
      : [
          { icon: "edit", label: "Editar" },
          { icon: "tag", label: "Marcar como vendido", ghost: true },
        ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Button key={item.label} variant={item.ghost ? "ghost" : "secondary"} size="sm">
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </Button>
      ))}
    </div>
  );
}

function Section({
  title,
  subtitle,
  wide,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn(wide ? "p-5.5" : "p-4.5", className)}>
      <PanelHeader
        title={title}
        subtitle={subtitle}
        titleClassName="text-17 tracking-normal @tab:text-19"
      />
      {children}
    </Panel>
  );
}

const deleteLink = (
  <div className="flex items-center gap-2.5">
    <Link
      href="/investimentos"
      className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
    >
      Excluir bem
    </Link>
  </div>
);

function NetWorth({ bem, wide, className }: { bem: Detail; wide?: boolean; className?: string }) {
  return (
    <Section title="No seu patrimônio" wide={wide} className={className}>
      <DetailList items={bem.patrimonio} />
      {wide && deleteLink}
    </Section>
  );
}

function Financing({ wide }: { wide?: boolean }) {
  const f = propertyDetail.financiamento;
  return (
    <Section title="Financiamento" wide={wide}>
      <div className="grid grid-cols-2 items-stretch gap-2.5">
        <StatTile
          label="Saldo devedor"
          value={f.saldo.valor}
          hint={f.saldo.nota}
          valueClassName="text-19 text-urucum"
        />
        <StatTile
          label="Valor líquido"
          value={f.liquido.valor}
          hint={f.liquido.nota}
          valueClassName="text-19 text-folha"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-13 text-mist">
          <span>Já é seu</span>
          <strong className="text-sand">{f.quitado}%</strong>
        </div>
        <div aria-hidden="true" className="relative h-2.5 rounded-[5px] bg-shade">
          <div className="h-2.5 rounded-[5px] bg-folha" style={{ width: `${f.quitado}%` }} />
        </div>
      </div>
      <Note icon="info-lg" tone="info">
        {f.aviso}
      </Note>
    </Section>
  );
}

function History({ wide, className }: { wide?: boolean; className?: string }) {
  const items = propertyDetail.historico;
  return (
    <Section
      title="Histórico de valor"
      subtitle="Estimativas que você informou"
      wide={wide}
      className={className}
    >
      <RowList>
        {items.map((item, i) => (
          <ListRow
            key={item.mes}
            title={item.mes}
            meta={item.origem}
            value={item.valor}
            valueMeta={
              item.variacao && (
                <span className="text-12 whitespace-nowrap text-caption">{item.variacao}</span>
              )
            }
            divider={i < items.length - 1}
          />
        ))}
      </RowList>
    </Section>
  );
}

function FipeChart({ wide }: { wide?: boolean }) {
  const f = vehicleDetail.fipe;
  return (
    <Section title="Valor na Tabela FIPE" subtitle="Últimos 6 meses" wide={wide}>
      <LineChart
        lines={[{ nome: "FIPE", cor: "#6DB3EC", valores: f.valores }]}
        domain={[77, 82]}
        ticks={[78, 80, 82]}
        tickLabel={(v) => `${v} mil`}
        xLabels={f.meses.map((label, index) => ({ index, label }))}
        label={f.rotulo}
        width={wide ? 600 : 340}
        height={wide ? 220 : 150}
      />
      <p className="m-0 text-13 leading-[1.55] text-caption">{f.nota}</p>
    </Section>
  );
}

function VehicleData({ wide, className }: { wide?: boolean; className?: string }) {
  return (
    <Section title="Dados do veículo" wide={wide} className={className}>
      <DetailList items={vehicleDetail.dados} />
    </Section>
  );
}

export default async function BemPage({ params }: PageProps<"/investimentos/bens/[bem]">) {
  const { bem: id } = await params;
  const bem = details[id as keyof typeof details];
  if (!bem) notFound();
  const imovel = bem.tipo === "imovel";

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title={bem.nome}
          back="/investimentos"
          actions={<IconButton icon="more" label="Mais opções do bem" />}
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Bens", href: "/investimentos" },
          { label: bem.nome },
        ]}
      />
      <DetailHeader
        title={bem.nome}
        actions={
          <div className="hidden @desk:block">
            <Actions bem={bem} />
          </div>
        }
      />

      {/* Celular e tablet */}
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:hidden">
        <Hero bem={bem} />
        <Actions bem={bem} />
        <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch">
          <div className="contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-4">
            {imovel ? <Financing /> : <FipeChart />}
            <NetWorth bem={bem} className="order-last grow @tab:order-none" />
          </div>
          <div className="contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-4">
            {imovel ? <History className="grow" /> : <VehicleData className="grow" />}
          </div>
        </div>
        {deleteLink}
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5">
          <Hero bem={bem} wide />
          <NetWorth bem={bem} wide />
        </div>
        <div
          className={cn(
            "grid items-stretch gap-5",
            imovel ? "grid-cols-2" : "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
          )}
        >
          {imovel ? <Financing wide /> : <FipeChart wide />}
          {imovel ? <History wide /> : <VehicleData wide />}
        </div>
      </div>
    </Page>
  );
}
