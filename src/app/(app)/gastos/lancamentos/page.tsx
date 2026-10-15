import Link from "next/link";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { OFFLINE_NOTE, parseScreenState, type ScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import {
  ErrorBlock,
  NoDataBlock,
  StateBlock,
  StateSwap,
  TileEmptyBlock,
} from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { TransactionBrowser } from "@/features/gastos/components/transaction-browser";
import { categorySpending } from "@/features/gastos/data";
import { monthTotals } from "@/features/gastos/lancamentos";

type StateProps = { state: ScreenState | null };

/** Entrou e saiu do mês; no erro os números viram "—". */
function MonthTiles({ valueClassName, state }: { valueClassName: string } & StateProps) {
  const tile = (children: ReactNode) => (
    <StateSwap
      replacement={state === "erro" && <TileEmptyBlock />}
      overlayClassName="rounded-tile bg-field px-4 py-3.5"
    >
      {children}
    </StateSwap>
  );
  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5">
      {tile(
        <StatTile
          label="Entrou"
          value={monthTotals.entrou}
          valueClassName={`${valueClassName} text-folha`}
        />,
      )}
      {tile(<StatTile label="Saiu" value={monthTotals.saiu} valueClassName={valueClassName} />)}
    </div>
  );
}

const noTransactions = (
  <StateBlock
    icon="wallet"
    title="Ainda sem lançamentos"
    action={
      <ButtonLink href="/onboarding/bancos" variant="forest" size="md" className="text-15">
        <span>Conectar banco</span>
      </ButtonLink>
    }
  >
    Assim que um banco for conectado, seus gastos e entradas aparecem aqui, organizados por dia.
  </StateBlock>
);

function LoadMore() {
  return (
    <Button variant="secondary" size="md" block className="text-15">
      <span>Carregar dias anteriores</span>
    </Button>
  );
}

export default async function LancamentosPage({ searchParams }: PageProps<"/gastos/lancamentos">) {
  const state = parseScreenState((await searchParams).estado);
  const empty = state === "vazio";
  const failed = state === "erro";
  // No vazio e no erro, a lista inteira dá lugar ao aviso (no celular, depois dos filtros).
  const listState = failed ? <ErrorBlock /> : empty && noTransactions;
  const summary = `${monthTotals.lancamentos} lançamentos em setembro · Nubank e Itaú`;
  return (
    <Page
      padding="detail"
      zoom={1.25}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Lançamentos" back="/gastos" balanced />}
    >
      {state === "carregando" && <LoadingStatus />}
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Gastos", href: "/gastos" }, { label: "Lançamentos" }]}
      />
      <DetailHeader
        title="Todos os lançamentos"
        subtitle={summary}
        actions={
          <ButtonLink href="/relatorio?exportar" variant="secondary" size="sm">
            <Icon name="arrow-down-to" size={18} />
            <span>Exportar</span>
          </ButtonLink>
        }
      />

      <Skeleton active={state === "carregando"}>
        {listState ? (
          <>
            {/* Celular: no vazio ficam a busca e os bancos, com o aviso logo abaixo; no erro,
                cada dia mostra o aviso no lugar da lista. */}
            <div className="contents @tab:hidden">
              {empty ? (
                <>
                  <TransactionBrowser filtersOnly />
                  {noTransactions}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="text-14 text-mist">{summary}</span>
                  </div>
                  <TransactionBrowser
                    failed
                    tiles={<MonthTiles valueClassName="text-17" state={state} />}
                    footer={<LoadMore />}
                  />
                </>
              )}
            </div>
            {/* Tablet: o card inteiro dá lugar ao aviso, com a mesma altura. */}
            <div className="hidden flex-col gap-3.5 rounded-card border border-line bg-card p-5.5 @tab:flex @desk:hidden">
              <StateSwap replacement={listState} className="grow gap-3.5">
                <TransactionBrowser
                  tiles={<MonthTiles valueClassName="text-17" state={null} />}
                  footer={<LoadMore />}
                />
              </StateSwap>
            </div>
          </>
        ) : (
          /* Celular e tablet: uma lista só (no tablet, dentro de um card). */
          <div className="contents @tab:flex @tab:flex-col @tab:gap-3.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-5.5 @desk:hidden">
            <div className="flex items-center gap-2.5 @tab:hidden">
              <span className="text-14 text-mist">{summary}</span>
            </div>
            <TransactionBrowser
              preset={state === "vazio-filtro"}
              tiles={<MonthTiles valueClassName="text-17" state={state} />}
              footer={<LoadMore />}
            />
          </div>
        )}

        {/* Desktop: lista em duas colunas e o resumo do mês ao lado. */}
        <div className="hidden grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
          <Panel className="gap-4 p-6">
            <StateSwap replacement={listState} className="grow gap-4">
              <TransactionBrowser columns preset={state === "vazio-filtro"} footer={<LoadMore />} />
            </StateSwap>
          </Panel>
          <div className="flex min-w-0 flex-col gap-4">
            <StateSwap
              replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />}
              overlayClassName="rounded-bubble bg-shade p-4"
            >
              <AgentTip agent="quero-quero" named>
                A compra de R$ 1.249,90 às 02:14 está fora do seu padrão. Clique nela para confirmar
                se foi você.
              </AgentTip>
            </StateSwap>
            <Panel className="gap-3.5 p-5.5">
              <PanelHeader title="Setembro" titleClassName="text-19 tracking-normal" />
              <StateSwap
                replacement={failed ? <ErrorBlock compact /> : empty && <NoDataBlock compact />}
                className="gap-3.5"
              >
                <MonthTiles valueClassName="text-19" state={null} />
                <p className="m-0 text-13 leading-[1.55] text-caption">
                  Sobrou {monthTotals.sobrou} até agora.
                </p>
              </StateSwap>
            </Panel>
            <Panel className="grow gap-3.5 p-5.5">
              <PanelHeader
                title="Maiores categorias"
                subtitle={
                  state === "sem-internet" ? (
                    <span className="text-tucano">{OFFLINE_NOTE}</span>
                  ) : (
                    !listState && "Outros gastos somam R$ 1.332,39"
                  )
                }
                titleClassName="text-19 tracking-normal"
                action={
                  !listState && (
                    <Link href="/gastos" className={panelLinkClass}>
                      Gastos
                      <Icon name="chevron-right" size={16} />
                    </Link>
                  )
                }
              />
              <StateSwap
                replacement={failed ? <ErrorBlock /> : empty && <NoDataBlock />}
                className="grow"
              >
                <RowList>
                  {categorySpending.map((c, i) => (
                    <ListRow
                      key={c.id}
                      href={`/gastos/categorias/${c.id}`}
                      title={c.nome}
                      meta={`${c.lancamentos} ${c.lancamentos === 1 ? "lançamento" : "lançamentos"} · ${c.percentual}%`}
                      value={c.valorFormatado}
                      divider={i < categorySpending.length - 1}
                    />
                  ))}
                </RowList>
              </StateSwap>
            </Panel>
          </div>
        </div>
      </Skeleton>
    </Page>
  );
}
