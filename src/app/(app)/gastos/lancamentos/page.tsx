import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader, panelLinkClass } from "@/components/ui/panel";
import { SearchField } from "@/components/ui/search-field";
import { StatTile } from "@/components/ui/stat-tile";
import { BankFilter, TransactionMenus } from "@/features/gastos/components/list-filters";
import { TransactionDays } from "@/features/gastos/components/transaction-days";
import { categorySpending } from "@/features/gastos/data";
import { monthTotals, transactionDays } from "@/features/gastos/lancamentos";

function MonthTiles({ valueClassName }: { valueClassName: string }) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5">
      <StatTile
        label="Entrou"
        value={monthTotals.entrou}
        valueClassName={`${valueClassName} text-folha`}
      />
      <StatTile label="Saiu" value={monthTotals.saiu} valueClassName={valueClassName} />
    </div>
  );
}

function LoadMore() {
  return (
    <Button variant="secondary" size="md" block className="text-15">
      <span>Carregar dias anteriores</span>
    </Button>
  );
}

export default function LancamentosPage() {
  const summary = `${monthTotals.lancamentos} lançamentos em setembro · Nubank e Itaú`;
  return (
    <Page
      padding="detail"
      zoom={1.25}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Lançamentos" back="/gastos" balanced />}
    >
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

      {/* Celular e tablet: uma lista só (no tablet, dentro de um card). */}
      <div className="contents @tab:flex @tab:flex-col @tab:gap-3.5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-5.5 @desk:hidden">
        <div className="flex items-center gap-2.5 @tab:hidden">
          <span className="text-14 text-mist">{summary}</span>
        </div>
        <SearchField label="Buscar lançamento" size="list" />
        <BankFilter className="-mr-4 overflow-hidden" />
        <TransactionMenus />
        <MonthTiles valueClassName="text-17" />
        <TransactionDays days={transactionDays} />
        <LoadMore />
      </div>

      {/* Desktop: lista em duas colunas e o resumo do mês ao lado. */}
      <div className="hidden grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
        <Panel className="gap-4 p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <SearchField label="Buscar lançamento" size="list" />
            <div className="flex items-center justify-end gap-3">
              <BankFilter className="flex-wrap" />
              <TransactionMenus className="flex-nowrap" />
            </div>
          </div>
          <TransactionDays days={transactionDays} columns />
          <LoadMore />
        </Panel>
        <div className="flex min-w-0 flex-col gap-4">
          <AgentTip agent="quero-quero" named>
            A compra de R$ 1.249,90 às 02:14 está fora do seu padrão. Clique nela para confirmar se
            foi você.
          </AgentTip>
          <Panel className="gap-3.5 p-5.5">
            <PanelHeader title="Setembro" titleClassName="text-19 tracking-normal" />
            <MonthTiles valueClassName="text-19" />
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Sobrou {monthTotals.sobrou} até agora.
            </p>
          </Panel>
          <Panel className="grow gap-3.5 p-5.5">
            <PanelHeader
              title="Maiores categorias"
              subtitle="Outros gastos somam R$ 1.332,39"
              titleClassName="text-19 tracking-normal"
              action={
                <Link href="/gastos" className={panelLinkClass}>
                  Gastos
                  <Icon name="chevron-right" size={16} />
                </Link>
              }
            />
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
          </Panel>
        </div>
      </div>
    </Page>
  );
}
