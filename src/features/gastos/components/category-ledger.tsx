import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

import type { CategoryLedger } from "../lancamentos";

/** Total da categoria no mês, comparação com o mês anterior e o teto (quando há). */
export function CategorySummary({ ledger }: { ledger: CategoryLedger }) {
  const { teto, comparacao } = ledger;
  return (
    <Panel className="gap-2.5 p-4.5">
      <span className="text-14 text-mist">
        {ledger.nome} em setembro · {ledger.lancamentos} lançamentos
      </span>
      <span className="font-display text-34 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
        {ledger.total}
      </span>
      <span className="text-14 text-mist">
        {comparacao.parte}
        {comparacao.variacao && (
          <>
            {" · "}
            <strong className="text-urucum">{comparacao.variacao}</strong> {comparacao.antes}
          </>
        )}
      </span>
      {teto && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-14">
            <span className="text-mist">Teto de {teto.valor}</span>
            <strong>{teto.estado}</strong>
          </div>
          <div aria-hidden="true" className="relative h-2.5 rounded-[5px] bg-shade">
            <div
              className="h-2.5 rounded-[5px] bg-tucano"
              style={{ width: `${teto.percentual}%` }}
            />
            {teto.marcos.map((marco) => (
              <span
                key={marco}
                aria-hidden="true"
                className="absolute -top-[3px] h-4 w-0.5 rounded-[1px] bg-sand"
                style={{ left: `calc(${marco}% - 1px)` }}
              />
            ))}
          </div>
          <span className="text-12 text-caption">{teto.nota}</span>
        </div>
      )}
    </Panel>
  );
}

/** Onde foi o dinheiro da categoria (subcategorias). */
export function CategoryWhere({
  ledger,
  className,
}: {
  ledger: CategoryLedger;
  className?: string;
}) {
  if (!ledger.onde.length) return null;
  return (
    <Panel className={cn("gap-3.5 p-4.5", className)}>
      <PanelHeader title="Onde foi" titleClassName="text-17 tracking-normal" />
      <RowList>
        {ledger.onde.map((item, i) => (
          <ListRow
            key={item.nome}
            title={item.nome}
            meta={`${item.lancamentos} lançamentos`}
            value={item.valor}
            valueMeta={
              <span className="text-12 whitespace-nowrap text-caption">{item.percentual}</span>
            }
            divider={i < ledger.onde.length - 1}
          />
        ))}
      </RowList>
    </Panel>
  );
}

export function SeeAllButton({ count }: { count: number }) {
  return (
    <ButtonLink href="/gastos/lancamentos" variant="secondary" size="md" block className="text-15">
      <span>Ver os {count} lançamentos</span>
    </ButtonLink>
  );
}

export function ChatWithTamandua() {
  return (
    <ButtonLink href="/conversas" variant="secondary" size="sm">
      <Icon name="chat" size={18} />
      <span>Conversar com o Tamanduá</span>
    </ButtonLink>
  );
}
