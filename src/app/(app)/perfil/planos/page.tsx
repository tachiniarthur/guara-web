import Link from "next/link";
import type { ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  BillingToggle,
  PlanCard,
  PlanComparison,
  UsagePanel,
} from "@/features/perfil/components/plan-parts";
import { plans } from "@/features/perfil/planos";

const cancelLink = (
  <Link
    href="/perfil"
    className="flex min-h-6 items-center text-14 font-bold whitespace-nowrap text-sand underline underline-offset-3"
  >
    Cancelar assinatura
  </Link>
);

const byId = Object.fromEntries(plans.map((p) => [p.id, p]));
/** No celular, o plano atual vem primeiro. */
const mobileOrder = [byId.completo!, byId.ampliado!, byId.essencial!];

function BillingPanel({
  note,
  className,
  children,
}: {
  note: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Panel className={className ?? "p-5"}>
      <PanelHeader
        title="Cobrança"
        subtitle="Anual sai por 10 meses de mensalidade"
        titleClassName="text-18 tracking-normal"
      />
      <BillingToggle />
      <p className="m-0 text-13 leading-[1.55] text-caption">{note}</p>
      {children}
    </Panel>
  );
}

export default function PlanosPage() {
  return (
    <Page
      padding="detail"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Planos" back="/perfil" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Meu perfil", href: "/perfil" },
          { label: "Bancos conectados", href: "/perfil" },
          { label: "Planos" },
        ]}
      />
      <DetailHeader
        title="Planos"
        subtitle="Você está no Completo: 3 bancos e 300 perguntas por mês"
      />

      {/* Celular */}
      <div className="flex flex-col gap-4 @tab:hidden">
        <UsagePanel />
        <BillingToggle />
        {mobileOrder.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
        <p className="m-0 text-13 leading-[1.55] text-caption">
          A mudança vale na hora. Ao subir de plano, você paga só a diferença proporcional até
          10/10. Ao descer, o plano atual vale até o fim do período pago.
        </p>
        <div className="flex items-center justify-center gap-2.5">{cancelLink}</div>
      </div>

      {/* Tablet */}
      <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
        <div className="grid grid-cols-2 items-stretch gap-4">
          <UsagePanel />
          <BillingPanel note="A mudança vale na hora. Ao subir, você paga só a diferença proporcional até 10/10." />
        </div>
        <div className="grid grid-cols-3 items-stretch gap-3.5">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} compact />
          ))}
        </div>
        <PlanComparison />
        <div className="flex items-center justify-end gap-2.5">{cancelLink}</div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-6 @desk:flex">
        <div className="grid grid-cols-3 items-stretch gap-5">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} compact />
          ))}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-stretch gap-5">
          <div className="flex min-w-0 flex-col gap-5">
            <UsagePanel />
            <BillingPanel
              className="grow p-5"
              note="A mudança vale na hora. Ao subir, você paga só a diferença proporcional até 10/10. Ao descer, o plano atual vale até o fim do período pago."
            >
              <div aria-hidden="true" className="grow" />
              <div className="flex items-center gap-2.5">{cancelLink}</div>
            </BillingPanel>
          </div>
          <PlanComparison wide />
        </div>
      </div>
    </Page>
  );
}
