import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ValueBars } from "@/components/charts/value-bars";
import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { OFFLINE_NOTE, parseScreenState, type ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import {
  ErrorBlock,
  ErrorBlocks,
  NoDataBlock,
  StateBlock,
  StateSwap,
  TileEmptyBlock,
} from "@/components/states/state-block";
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

function Hero({ wide, replacement }: { wide?: boolean; replacement?: ReactNode }) {
  return (
    <MataCard className={cn(wide && "p-6")}>
      <StateSwap replacement={replacement} className="grow gap-2.5">
        <HeroContent wide={wide} />
      </StateSwap>
    </MataCard>
  );
}

function HeroContent({ wide }: { wide?: boolean }) {
  return (
    <>
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
    </>
  );
}

type StateProps = { state: ScreenState | null };

function Section({
  title,
  subtitle,
  action,
  wide,
  state,
  replacement,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  wide?: boolean;
  /** Estado da tela: sem internet troca o subtítulo pela hora dos dados guardados. */
  state?: ScreenState | null;
  /** Bloco de estado no lugar do conteúdo (o card perde a ação do canto). */
  replacement?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn(wide ? "p-5.5" : "p-4.5", className)}>
      <PanelHeader
        title={title}
        subtitle={
          subtitle && state === "sem-internet" ? (
            <span className="text-tucano">{OFFLINE_NOTE}</span>
          ) : (
            subtitle
          )
        }
        action={!replacement && action}
        titleClassName="text-17 tracking-normal @tab:text-19"
      />
      <StateSwap replacement={replacement} className="grow gap-3.5">
        {children}
      </StateSwap>
    </Panel>
  );
}

/** Erro grande no erro; "—" genérico no vazio (o card principal do vazio recebe `main`). */
const sectionState = (state: ScreenState | null, main?: ReactNode) =>
  state === "erro" ? <ErrorBlock /> : state === "vazio" ? (main ?? <NoDataBlock />) : null;

const noDeposits = (
  <StateBlock
    icon="target"
    title="Ainda sem depósitos"
    action={
      <ButtonLink href="/metas/nova" size="md">
        <span>Ajustar a meta</span>
      </ButtonLink>
    }
  >
    A meta começa a contar no primeiro depósito. Até lá, o guardado e a previsão ficam com “—”.
  </StateBlock>
);

function Growth({ wide, state, main }: { wide?: boolean; main?: boolean } & StateProps) {
  return (
    <Section
      title="Como a reserva cresceu"
      subtitle="Saldo no fim de cada mês"
      wide={wide}
      state={state}
      replacement={sectionState(state, main && noDeposits)}
    >
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

function Milestones({
  wide,
  state,
  main,
  className,
}: { wide?: boolean; main?: boolean; className?: string } & StateProps) {
  return (
    <Section
      title="Marcos"
      subtitle="A Onça avisa a cada etapa"
      wide={wide}
      state={state}
      replacement={sectionState(state, main && noDeposits)}
      className={className}
    >
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

function Movements({ wide, state, main }: { wide?: boolean; main?: boolean } & StateProps) {
  return (
    <Section
      title="Depósitos e rendimentos"
      wide={wide}
      state={state}
      replacement={sectionState(state, main && noDeposits)}
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

function Adjustments({
  wide,
  state,
  className,
}: { wide?: boolean; className?: string } & StateProps) {
  const failed = state === "erro";
  if (wide) {
    return (
      <Panel className="p-5.5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="m-0 font-display text-19 leading-[1.25] font-bold">Ajustes</h2>
          {!failed && (
            <div className="flex items-center gap-2">
              <AdjustButtons />
              <Link
                href="/metas"
                className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
              >
                Excluir meta
              </Link>
            </div>
          )}
        </div>
        <StateSwap replacement={failed && <ErrorBlock compact />}>
          <DetailGrid items={detail.ajustes} className="grid-cols-4 text-15" />
        </StateSwap>
      </Panel>
    );
  }
  return (
    <Section title="Ajustes" className={className} replacement={failed && <ErrorBlock />}>
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

/** Dica da Onça; no erro e no vazio vira um tile de estado com o mesmo tamanho. */
function Tip({ replacement }: { replacement?: ReactNode }) {
  return (
    <StateSwap replacement={replacement} overlayClassName="rounded-bubble bg-shade p-4">
      <OncaTip action={simulate}>{detail.dica}</OncaTip>
    </StateSwap>
  );
}

export default async function MetaPage({ params, searchParams }: PageProps<"/metas/[id]">) {
  const { id } = await params;
  if (id !== detail.id) notFound();
  const state = parseScreenState((await searchParams).estado);
  const failed = state === "erro";
  const empty = state === "vazio";

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
      {state === "carregando" && <LoadingStatus />}
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

      <Skeleton active={state === "carregando"}>
        {/* Celular */}
        <div className="flex flex-col gap-4 @tab:hidden">
          <Hero
            replacement={failed ? <ErrorBlocks mobile="tile" /> : empty && <TileEmptyBlock />}
          />
          <Tip replacement={failed ? <ErrorBlocks mobile="tile" /> : empty && <TileEmptyBlock />} />
          <Growth state={state} />
          <Milestones state={state} />
          <Movements state={state} main />
          <Adjustments state={state} />
        </div>

        {/* Tablet */}
        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          <Hero replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />} />
          <div className="grid grid-cols-2 items-stretch gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              <Growth state={state} />
              <Milestones state={state} main className="grow" />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <Tip
                replacement={failed ? <ErrorBlocks mobile="tile" /> : empty && <TileEmptyBlock />}
              />
              <Movements state={state} />
              <Adjustments state={state} className="grow" />
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-6 @desk:flex">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-stretch gap-5">
            <Hero
              wide
              replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />}
            />
            <Tip replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />} />
          </div>
          <div className="grid grid-cols-3 items-stretch gap-5">
            <Growth wide state={state} main />
            <Milestones wide state={state} />
            <Movements wide state={state} />
          </div>
          <Adjustments wide state={state} />
        </div>
      </Skeleton>
    </Page>
  );
}
