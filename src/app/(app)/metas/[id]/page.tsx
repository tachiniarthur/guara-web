import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ValueBars } from "@/components/charts/value-bars";
import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink, Button } from "@/components/ui/button";
import { DetailGrid, DetailList } from "@/components/ui/detail-list";
import { Icon, type IconName } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { MataCard } from "@/features/gastos/components/teto-cards";
import { OncaTip } from "@/features/metas/components/goal-parts";
import { goalDetail as detail, goals } from "@/features/metas/data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return goals.filter((g) => g.detalhe).map((g) => ({ id: g.id }));
}

const goal = goals.find((g) => g.id === detail.id)!;

function Hero({ wide }: { wide?: boolean }) {
  return (
    <MataCard className={cn(wide && "p-6")}>
      <div className="flex items-center gap-2.5">
        <span className="grow text-14 text-[#C5D8CB]">Guardado</span>
        <Tag tone="folha" status>
          <Icon name="check" size={14} strokeWidth={2} />
          {goal.status.texto}
        </Tag>
      </div>
      <span
        className={cn(
          "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
          wide ? "text-38" : "text-36",
        )}
      >
        {goal.guardado}
        <span className="text-16 font-medium text-mist">{` de ${goal.alvo}`}</span>
      </span>
      <div aria-hidden="true" className="relative h-3 rounded-md bg-[rgba(11,17,14,.55)]">
        <div className="h-3 rounded-md bg-folha" style={{ width: `${goal.percentual}%` }} />
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className={cn(
              "absolute -top-[3px] h-4.5 w-0.5 rounded-[1px]",
              m <= goal.percentual ? "bg-sand" : "bg-sand/50",
            )}
            style={{ left: `calc(${m}% - 1px)` }}
          />
        ))}
      </div>
      <span className="text-14 text-[#E4EEE6]">
        {`${goal.percentual}% · faltam `}
        <strong className="text-white">{detail.faltam}</strong>
        {" · com R$ 990/mês você completa em "}
        <strong className="text-white">{detail.completa}</strong>
      </span>
    </MataCard>
  );
}

function Section({
  title,
  subtitle,
  action,
  wide,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn(wide ? "p-5.5" : "p-4.5", className)}>
      <PanelHeader
        title={title}
        subtitle={subtitle}
        action={action}
        titleClassName="text-17 tracking-normal @tab:text-19"
      />
      {children}
    </Panel>
  );
}

function Growth({ wide }: { wide?: boolean }) {
  return (
    <Section title="Como a reserva cresceu" subtitle="Saldo no fim de cada mês" wide={wide}>
      <ValueBars
        items={detail.saldo.meses.map((m) => ({ ...m, color: "#6CC08E" }))}
        width={wide ? 460 : 340}
        height={wide ? 220 : 150}
        base={wide ? 198 : 128}
        scale={wide ? 9.974 : 6.138}
        label={detail.saldo.rotulo}
      />
      <p className="m-0 text-13 leading-[1.55] text-caption">{detail.saldo.nota}</p>
    </Section>
  );
}

function Milestones({ wide, className }: { wide?: boolean; className?: string }) {
  return (
    <Section title="Marcos" subtitle="A Onça avisa a cada etapa" wide={wide} className={className}>
      <RowList>
        {detail.marcos.map((m, i) => {
          const icon: IconName = m.feito ? "check" : m.final ? "target" : "flag";
          return (
            <ListRow
              key={m.titulo}
              title={m.titulo}
              meta={m.nota}
              divider={i < detail.marcos.length - 1}
              leading={
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    m.feito ? "bg-folha-bg text-folha" : "bg-shade text-mist",
                  )}
                >
                  <Icon name={icon} size={20} />
                </span>
              }
            />
          );
        })}
      </RowList>
    </Section>
  );
}

function Movements({ wide }: { wide?: boolean }) {
  return (
    <Section
      title="Depósitos e rendimentos"
      wide={wide}
      action={
        <Link
          href={`/metas/${detail.id}`}
          className="flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
        >
          Ver todos
          <Icon name="chevron-right" size={16} />
        </Link>
      }
    >
      <RowList>
        {detail.movimentos.map((m) => (
          <ListRow
            key={`${m.titulo}-${m.data}`}
            title={m.titulo}
            meta={m.data}
            value={m.valor}
            valueMeta={<></>}
            valueClassName={m.valor.startsWith("−") ? "text-urucum" : "text-folha"}
          />
        ))}
      </RowList>
    </Section>
  );
}

const deleteLink = (
  <div className="flex items-center gap-2.5">
    <Link
      href="/metas"
      className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
    >
      Excluir meta
    </Link>
  </div>
);

function AdjustButtons() {
  return (
    <>
      <Button variant="secondary" size="sm">
        <Icon name="edit" size={18} />
        <span>Editar meta</span>
      </Button>
      <Button variant="secondary" size="sm">
        <Icon name="plus" size={18} />
        <span>Depositar agora</span>
      </Button>
      <Button variant="ghost" size="sm">
        <Icon name="pause" size={18} />
        <span>Pausar</span>
      </Button>
    </>
  );
}

function Adjustments({ wide, className }: { wide?: boolean; className?: string }) {
  if (wide) {
    return (
      <Panel className="p-5.5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="m-0 font-display text-19 leading-[1.25] font-bold">Ajustes</h2>
          <div className="flex items-center gap-2">
            <AdjustButtons />
            <Link
              href="/metas"
              className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
            >
              Excluir meta
            </Link>
          </div>
        </div>
        <DetailGrid items={detail.ajustes} className="grid-cols-4 text-15" />
      </Panel>
    );
  }
  return (
    <Section title="Ajustes" className={className}>
      <DetailList items={detail.ajustes} />
      <div className="flex flex-wrap items-center gap-2">
        <AdjustButtons />
      </div>
      {deleteLink}
    </Section>
  );
}

const simulate = (
  <ButtonLink href="/simulador/corte" variant="secondary" size="sm">
    <span>Simular</span>
  </ButtonLink>
);

export default async function MetaPage({ params }: PageProps<"/metas/[id]">) {
  const { id } = await params;
  if (id !== detail.id) notFound();

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title={goal.nome}
          back="/metas"
          actions={<IconButton icon="more" label="Mais opções da meta" />}
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Suas metas", href: "/metas" }, { label: goal.nome }]}
      />
      <DetailHeader
        title={goal.nome}
        subtitle={detail.criada}
        actions={
          <IconButton icon="more" label="Mais opções da meta" className="hidden @desk:flex" />
        }
      />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <Hero />
        <OncaTip action={simulate}>{detail.dica}</OncaTip>
        <Growth />
        <Milestones />
        <Movements />
        <Adjustments />
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <Hero />
        <div className="grid grid-cols-2 items-stretch gap-4">
          <div className="flex min-w-0 flex-col gap-4">
            <Growth />
            <Milestones className="grow" />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <OncaTip action={simulate}>{detail.dica}</OncaTip>
            <Movements />
            <Adjustments className="grow" />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5">
          <Hero wide />
          <OncaTip action={simulate}>{detail.dica}</OncaTip>
        </div>
        <div className="grid grid-cols-3 items-stretch gap-5">
          <Growth wide />
          <Milestones wide />
          <Movements wide />
        </div>
        <Adjustments wide />
      </div>
    </Page>
  );
}
