import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

import { planComparison, plans, planUsage, type Plan } from "../planos";

const current = plans.find((p) => p.atual)!;

/** Card de um plano. "compact": rótulos curtos do tablet e do desktop ("Escolher este"). */
export function PlanCard({ plan, compact }: { plan: Plan; compact?: boolean }) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3.5 rounded-card bg-card p-5",
        plan.atual ? "border-2 border-tucano" : "border border-line",
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <h2 className="m-0 grow font-display text-22 font-bold">{plan.nome}</h2>
        {plan.atual && (
          <Tag tone="tucano" status>
            <Icon name="check" size={14} strokeWidth={2} />
            Seu plano
          </Tag>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-30 leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums">
          {plan.preco}
          {plan.mensal && <span className="text-16 font-medium text-mist"> /mês</span>}
        </span>
        <span className="text-13 text-caption">{plan.apoio}</span>
      </div>
      <div className="flex flex-col gap-2 rounded-[0.875rem] bg-field px-3.5 py-3">
        <span className="flex items-center gap-2 font-bold">
          <span className="text-mist">
            <Icon name="bank" size={18} />
          </span>
          {plan.bancos}
        </span>
        <span className="flex items-center gap-2 text-14 text-mist">
          <Icon name="chat" size={18} />
          {plan.perguntas}
        </span>
      </div>
      <ul className="m-0 flex grow list-none flex-col gap-2 p-0">
        {plan.recursos.map((r) => (
          <li key={r} className="flex items-start gap-2 text-14 text-mist">
            <span className="mt-0.5 text-folha">
              <Icon name="check" size={16} strokeWidth={2.2} />
            </span>
            {r}
          </li>
        ))}
      </ul>
      {plan.aviso && (
        <Note icon="alert-triangle" tone="warning" className="gap-2.5">
          {compact ? plan.aviso.curto : plan.aviso.longo}
        </Note>
      )}
      <Button
        variant={plan.id === "ampliado" ? "primary" : "secondary"}
        size="lg"
        block
        className={cn(compact && !plan.atual && "text-14")}
      >
        <span>
          {plan.atual ? "Plano atual" : compact ? "Escolher este" : `Mudar para o ${plan.nome}`}
        </span>
      </Button>
    </section>
  );
}

/** Uso do plano atual: bancos conectados e perguntas aos assistentes no mês. */
export function UsagePanel({ className }: { className?: string }) {
  const { bancos, perguntas } = planUsage;
  return (
    <Panel className={cn("p-5", className)}>
      <PanelHeader
        title={`Seu uso no plano ${current.nome}`}
        subtitle={planUsage.renova}
        titleClassName="text-18 tracking-normal"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grow text-14 text-mist">Bancos conectados</span>
          <strong>{`${bancos.usados} de ${bancos.total}`}</strong>
        </div>
        <div
          role="img"
          aria-label={`${bancos.usados} de ${bancos.total} bancos`}
          className="flex h-2 gap-1"
        >
          {Array.from({ length: bancos.total }, (_, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-[4px]", i < bancos.usados ? "bg-folha" : "bg-line")}
            />
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="grow text-14 text-mist">
            Perguntas aos assistentes em {perguntas.mes}
          </span>
          <strong>{`${perguntas.usadas} de ${perguntas.total}`}</strong>
        </div>
        <div aria-hidden="true" className="relative h-2 rounded-[4px] bg-shade">
          <div
            className="h-2 rounded-[4px] bg-arara"
            style={{ width: `${Math.round((perguntas.usadas / perguntas.total) * 100)}%` }}
          />
        </div>
      </div>
    </Panel>
  );
}

export function BillingToggle() {
  return (
    <PillToggle
      label="Cobrança"
      options={[
        { value: "mensal", label: "Mensal" },
        { value: "anual", label: "Anual · 2 meses grátis" },
      ]}
      className="flex self-stretch"
      itemClassName="flex-1"
    />
  );
}

/** Tabela "Comparar recursos" (tablet e desktop), com a coluna do plano atual destacada. */
export function PlanComparison({ wide }: { wide?: boolean }) {
  return (
    <Panel className={wide ? "p-6" : "p-5.5"}>
      <PanelHeader title="Comparar recursos" titleClassName="tracking-normal" />
      <table className="w-full border-collapse text-14">
        <thead>
          <tr>
            <td />
            {plans.map((p) => (
              <th
                key={p.id}
                scope="col"
                className={cn(
                  "px-3 py-2.5 text-left text-13 font-bold",
                  p.atual ? "text-tucano" : "text-caption",
                )}
              >
                {p.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {planComparison.map((row) => (
            <tr key={row.recurso} className="border-t border-line">
              <th scope="row" className="py-[0.6875rem] pr-3 pl-0 text-left font-medium text-mist">
                {row.recurso}
              </th>
              {row.valores.map((v, i) => (
                <td
                  key={i}
                  className={cn(
                    "px-3 py-[0.6875rem]",
                    plans[i]?.atual ? "bg-tucano/6 font-bold" : "font-medium",
                  )}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
