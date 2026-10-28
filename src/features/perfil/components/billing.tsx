"use client";

import { create } from "zustand";

import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useSession } from "@/features/acesso/session";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useChangeBillingPeriod, useMyPlan } from "../api";
import {
  ANNUAL_DISCOUNT_PERCENT,
  annualPerMonth,
  annualSavings,
  billingPeriodLabel,
  planUsage,
  type BillingPeriod,
  type Plan,
} from "../planos";

/** "Mensal | Anual" com a etiqueta "10% de desconto" (escolha do plano e Planos). */
export function BillingToggle({
  value,
  onChange,
  className,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  className?: string;
}) {
  const options: { value: BillingPeriod; label: string }[] = [
    { value: "monthly", label: "Mensal" },
    { value: "annual", label: "Anual" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <div
        role="radiogroup"
        aria-label="Período de cobrança"
        className="flex rounded-full border border-line-strong bg-field p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 cursor-pointer rounded-full border-none px-4.5 text-14 font-bold transition-colors",
              value === option.value
                ? "bg-sand text-canvas"
                : "bg-transparent text-mist hover:text-sand",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Tag tone="folha">{`${ANNUAL_DISCOUNT_PERCENT}% de desconto`}</Tag>
    </div>
  );
}

/** Preço por mês do período (no anual, o total do ano dividido por 12). */
export const pricePerMonth = (plan: Plan, period: BillingPeriod) =>
  period === "annual" ? annualPerMonth(plan) : plan.mensal;

/**
 * Preço do plano no período: no mensal, o preço cheio; no anual, o preço por mês em destaque,
 * o total cobrado no ano e a economia embaixo.
 */
export function PlanPrice({
  plan,
  period,
  className,
  valueClassName = "text-30",
}: {
  plan: Plan;
  period: BillingPeriod;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "font-display leading-[1.1] font-extrabold tracking-[-0.01em] tabular-nums",
          valueClassName,
        )}
      >
        {formatCurrency(pricePerMonth(plan, period))}
        <span className="ml-1 font-sans text-14 font-medium text-mist">/mês</span>
      </span>
      {period === "annual" ? (
        <>
          <span className="text-13 text-mist">{`cobrado ${formatCurrency(plan.anual)} por ano`}</span>
          <span className="text-13 font-bold text-folha">
            {`Economize ${formatCurrency(annualSavings(plan))}`}
          </span>
        </>
      ) : (
        <span className="text-13 text-caption">cobrado todo mês</span>
      )}
    </div>
  );
}

type PlansPeriodState = {
  /** Período em que os preços aparecem na tela de Planos (começa no contratado). */
  viewing: BillingPeriod;
  /** Período contratado (no protótipo, guardado aqui; com a API, vem de `me.plan`). */
  contracted: BillingPeriod;
  view: (period: BillingPeriod) => void;
  contract: (period: BillingPeriod) => void;
};

/** Período dos preços e o contratado, compartilhados pelos cards e pela "Cobrança" de Planos. */
export const usePlansPeriod = create<PlansPeriodState>((set) => ({
  viewing: planUsage.periodo,
  contracted: planUsage.periodo,
  view: (viewing) => set({ viewing }),
  contract: (contracted) => set({ contracted, viewing: contracted }),
}));

/** Período contratado: com login, o da assinatura na API; no protótipo, o guardado aqui. */
export function useContractedPeriod(): BillingPeriod {
  const { live } = useSession();
  const stored = usePlansPeriod((s) => s.contracted);
  const { data } = useMyPlan({ enabled: live });
  return (live ? data?.subscription?.billingPeriod : undefined) ?? stored;
}

/** Alternador da tela de Planos (troca os preços de todos os cards). */
export function PlansPeriodToggle({ className }: { className?: string }) {
  const viewing = usePlansPeriod((s) => s.viewing);
  const view = usePlansPeriod((s) => s.view);
  return <BillingToggle value={viewing} onChange={view} className={className} />;
}

/**
 * "Cobrança" de Planos: o período contratado, quanto custa nele e a troca para o outro (no
 * anual, com a economia). Com login de verdade, a troca vai para a API.
 */
export function BillingSummary({ plan }: { plan: Plan }) {
  const contracted = useContractedPeriod();
  const contract = usePlansPeriod((s) => s.contract);
  const { live } = useSession();
  const change = useChangeBillingPeriod();
  const other: BillingPeriod = contracted === "annual" ? "monthly" : "annual";
  const switchPeriod = () => {
    if (!live) return contract(other);
    change.mutate(other, { onSuccess: () => contract(other) });
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-14 text-sand">
        <strong>{billingPeriodLabel[contracted]}</strong>
        {" · "}
        {contracted === "annual"
          ? `${formatCurrency(plan.anual)} por ano (${formatCurrency(annualPerMonth(plan))}/mês)`
          : `${formatCurrency(plan.mensal)} por mês`}
      </p>
      <p className="m-0 text-13 leading-[1.55] text-caption">
        {other === "annual"
          ? `No anual, o ${plan.nome} sai por ${formatCurrency(annualPerMonth(plan))}/mês, cobrado ${formatCurrency(plan.anual)} por ano: você economiza ${formatCurrency(annualSavings(plan))}.`
          : `No mensal, o ${plan.nome} custa ${formatCurrency(plan.mensal)} por mês, sem o desconto do anual.`}
      </p>
      <Button
        variant={other === "annual" ? "primary" : "secondary"}
        size="md"
        className="self-start"
        disabled={change.isPending}
        onClick={switchPeriod}
      >
        <span>{other === "annual" ? "Mudar para o anual" : "Mudar para o mensal"}</span>
      </Button>
      {change.error && <p className="m-0 text-13 text-urucum">{change.error.message}</p>}
    </div>
  );
}
