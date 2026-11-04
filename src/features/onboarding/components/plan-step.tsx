"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { WarningBlock } from "@/features/acesso/components/auth-parts";
import { useSession } from "@/features/acesso/session";
import { useActivatePlan, useMe } from "@/features/perfil/api";
import { BillingToggle, PlanPrice, pricePerMonth } from "@/features/perfil/components/billing";
import {
  featuredPlan,
  planFeatureRows,
  planPitch,
  plans,
  privatePlan,
  showPrivatePlan,
  type BillingPeriod,
  type PlanId,
} from "@/features/perfil/planos";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import { onboardingSteps } from "../data";
import { LeaveOnboardingLink, useLeaveOnboarding } from "./leave-onboarding";
import { OnboardingIntro, OnboardingShell, OnboardingSteps, stepFrame } from "./onboarding-shell";

/** Linhas de cada card (cabeçalho, recursos e botão): todas alinhadas entre os cards. */
const CARD_ROWS = planFeatureRows.length + 2;

function FeatureRow({ value, off }: { value: string | null; off: string }) {
  return (
    <li
      className={cn(
        "flex items-start gap-2 px-4 py-1 text-14 leading-snug",
        value ? "text-sand" : "text-caption",
      )}
    >
      <span className={cn("mt-px", value ? "text-folha" : "text-caption")}>
        <Icon name={value ? "check" : "x"} size={16} strokeWidth={2.2} />
      </span>
      {value ?? (
        <span>
          <span className="sr-only">Não inclui: </span>
          {off}
        </span>
      )}
    </li>
  );
}

/** Card de um plano: as linhas usam o subgrid da grade, então ficam na mesma altura nos quatro. */
function PlanCard({
  name,
  price,
  priceLabel,
  pitch,
  index,
  selected = false,
  locked = false,
  featured = false,
  busy = false,
  onSelect,
  onChoose,
}: {
  name: string;
  /** Bloco do preço (no anual: por mês, o total do ano e a economia). */
  price: ReactNode;
  /** Preço falado ("R$ 16,11 por mês no anual"). */
  priceLabel?: string;
  pitch: string;
  index: number;
  selected?: boolean;
  locked?: boolean;
  featured?: boolean;
  busy?: boolean;
  onSelect?: () => void;
  onChoose?: () => void;
}) {
  const id = `plano-${index}`;
  return (
    <section
      aria-labelledby={id}
      onClick={locked ? undefined : onSelect}
      style={{ gridRow: `span ${CARD_ROWS}` }}
      className={cn(
        // gap-y-0: sem ele, cada linha herdaria o espaço entre cards da grade (24 px por linha).
        // O controle é o rádio escondido: com o teclado, o foco dele aparece no card inteiro.
        "relative grid grid-rows-subgrid gap-y-0 rounded-card bg-card transition-[border-color,background-color,box-shadow,transform] duration-200 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-tucano",
        locked
          ? "border border-dashed border-line"
          : selected
            ? "cursor-pointer border-2 border-tucano shadow-[0_0.75rem_2rem_rgba(0,0,0,0.35)]"
            : "cursor-pointer border border-line hover:-translate-y-0.5 hover:border-line-strong hover:bg-shade",
      )}
    >
      {featured && (
        <span
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-11 font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors",
            selected ? "bg-tucano text-canvas" : "border border-line-strong bg-card text-sand",
          )}
        >
          Mais popular
        </span>
      )}
      <div className="flex flex-col gap-1.5 px-4 pt-5 pb-2.5">
        <h2 id={id} className="m-0 flex items-center gap-2 text-18 font-bold">
          {name}
          {locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-shade px-2 py-0.5 text-12 font-bold text-mist">
              <Icon name="lock" size={12} strokeWidth={2.2} />
              Em breve
            </span>
          )}
        </h2>
        {locked ? (
          <span className="font-display text-26 leading-none font-extrabold text-mist">
            {price}
          </span>
        ) : (
          price
        )}
        <span className="text-13 leading-snug text-mist">{pitch}</span>
        {!locked && (
          <input
            type="radio"
            name="plano"
            aria-label={`${name}, ${priceLabel}`}
            checked={selected}
            onChange={onSelect}
            className="sr-only"
          />
        )}
      </div>
      <ul className="contents">
        {planFeatureRows.map((row) => (
          <FeatureRow key={row.off} value={row.values[index] ?? null} off={row.off} />
        ))}
      </ul>
      <div className={cn("self-end px-4 pt-3 pb-4", locked && "opacity-70")}>
        {locked ? (
          <Button variant="secondary" size="md" block disabled>
            <Icon name="lock" size={16} />
            <span>Em breve</span>
          </Button>
        ) : (
          <Button
            variant={selected ? "primary" : "secondary"}
            size="md"
            block
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onChoose?.();
            }}
          >
            <span>{`Assinar o ${name}`}</span>
          </Button>
        )}
      </div>
    </section>
  );
}

/**
 * Onboarding 1 · Plano: os três planos lado a lado; clicar no card escolhe (borda em destaque) e
 * o botão de cada um assina. Todo plano é pago; enquanto não há pagamento, o ambiente de teste da
 * API ativa o plano na hora. No protótipo, só avança.
 */
export function PlanStep() {
  const router = useRouter();
  const { live, refresh } = useSession();
  const activate = useActivatePlan();
  const me = useMe({ enabled: live });
  const leave = useLeaveOnboarding();
  const [choosing, setChoosing] = useState<PlanId | null>(null);
  const [selected, setSelected] = useState<PlanId>(featuredPlan);
  // O anual vem escolhido (10% de desconto); a pessoa pode trocar para o mensal.
  const [period, setPeriod] = useState<BillingPeriod>("annual");

  // O CPF vem antes do plano: quem chegou aqui sem ele (URL digitada) volta para informá-lo.
  const missingCpf = live && me.isSuccess && !me.data.cpfMasked;
  useEffect(() => {
    if (missingCpf) router.replace("/onboarding/cpf");
  }, [missingCpf, router]);

  function choose(planId: PlanId) {
    setSelected(planId);
    if (!live) return router.push("/onboarding/bancos");
    setChoosing(planId);
    activate.mutate(
      { planId, billingPeriod: period },
      {
        // O plano já vem na resposta (cache de `me.plan`): avança na hora e atualiza a sessão por trás.
        onSuccess: () => {
          router.push("/onboarding/bancos");
          void refresh();
        },
        onSettled: () => setChoosing(null),
      },
    );
  }

  return (
    <OnboardingShell
      {...stepFrame}
      className="lg:gap-5"
      mobileTop={<MobileHeader onBack={() => void leave()} />}
    >
      <LeaveOnboardingLink className="max-md:hidden" />
      <OnboardingSteps current={1} steps={onboardingSteps} />
      <OnboardingIntro title="Escolha seu plano">
        Todos têm os assistentes de IA. No anual, 10% de desconto. Troque ou cancele quando quiser,
        em Meu perfil.
      </OnboardingIntro>
      <BillingToggle value={period} onChange={setPeriod} />
      {activate.error && (
        <WarningBlock icon="alert-triangle">{activate.error.message}</WarningBlock>
      )}
      <div
        role="radiogroup"
        aria-label="Planos"
        className="grid gap-x-4 gap-y-6 pt-2 min-[56rem]:grid-cols-2 lg:grid-cols-[repeat(var(--plans),minmax(0,1fr))]"
        style={{ "--plans": plans.length + (showPrivatePlan ? 1 : 0) } as CSSProperties}
      >
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            name={plan.nome}
            price={<PlanPrice plan={plan} period={period} valueClassName="text-30" />}
            priceLabel={
              period === "annual"
                ? `${formatCurrency(pricePerMonth(plan, period))} por mês no anual, cobrado ${formatCurrency(plan.anual)} por ano`
                : `${formatCurrency(plan.mensal)} por mês`
            }
            pitch={planPitch[plan.id]}
            index={index}
            featured={plan.id === featuredPlan}
            selected={plan.id === selected}
            busy={choosing !== null}
            onSelect={() => setSelected(plan.id)}
            onChoose={() => choose(plan.id)}
          />
        ))}
        {showPrivatePlan && (
          <PlanCard
            name={privatePlan.nome}
            price={privatePlan.preco}
            pitch={privatePlan.pitch}
            index={plans.length}
            locked
          />
        )}
      </div>
    </OnboardingShell>
  );
}
