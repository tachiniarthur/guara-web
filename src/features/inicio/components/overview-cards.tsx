import type { ReactNode } from "react";

import { CardBody } from "@/components/states/screen-state-context";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TextLink } from "@/components/ui/text-link";
import { priceAlerts } from "@/features/alertas/data";
import { subscriptions, subscriptionTotals } from "@/features/assinaturas/data";
import { allocation, portfolio } from "@/features/investimentos/data";
import { goals, goalsSummary } from "@/features/metas/data";
import { cn } from "@/lib/utils";

/** Card resumido da Visão geral: ícone e título, número em destaque, detalhe e link. */
function OverviewCard({
  icon,
  title,
  value,
  caption,
  link,
  children,
}: {
  icon: IconName;
  title: string;
  value: string;
  caption: ReactNode;
  link: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <Card className="gap-3.5">
      <CardHeader
        title={
          <span className="flex items-center gap-2 text-15 font-semibold text-mist">
            <Icon name={icon} size={18} />
            {title}
          </span>
        }
      />
      <CardBody className="flex grow flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <strong className="font-display text-26 leading-tight font-extrabold tabular-nums">
            {value}
          </strong>
          <span className="text-13 text-mist">{caption}</span>
        </div>
        <div className="grow">{children}</div>
        <TextLink href={link.href} className="self-start">
          {link.label}
        </TextLink>
      </CardBody>
    </Card>
  );
}

/** A meta principal (a primeira em andamento) e o alerta de preço mais perto de disparar. */
const mainGoal = goals.find((goal) => goal.percentual > 0) ?? goals[0]!;
const nearestAlert = priceAlerts.reduce((best, alert) =>
  alert.progresso > best.progresso ? alert : best,
);
/** As próximas cobranças, da mais próxima para a mais distante. */
const nextCharges = [...subscriptions].sort((a, b) => a.dia - b.dia).slice(0, 3);

/**
 * Visão geral do Início: investimentos, próximas cobranças, metas e alertas de preço, cada um
 * com o número principal e um atalho para a tela completa.
 */
export function OverviewCards({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 @tab:grid-cols-2 @desk:grid-cols-4 @desk:gap-6",
        className,
      )}
    >
      <OverviewCard
        icon="trending-up"
        title="Investimentos"
        value={portfolio.patrimonio}
        caption={portfolio.variacaoMes}
        link={{ href: "/investimentos", label: "Ver carteira" }}
      >
        <div
          role="img"
          aria-label={`Alocação: ${allocation.map((s) => `${s.classe} ${s.atual}%`).join(", ")}`}
          className="flex h-2 origin-left animate-grow-x gap-[2px] overflow-hidden rounded-full"
        >
          {allocation.map((slice) => (
            <span key={slice.classe} style={{ flexGrow: slice.atual, background: slice.cor }} />
          ))}
        </div>
      </OverviewCard>

      <OverviewCard
        icon="repeat"
        title="Próximas cobranças"
        value={subscriptionTotals.mensal}
        caption={`por mês em ${subscriptions.length} assinaturas`}
        link={{ href: "/assinaturas", label: "Ver assinaturas" }}
      >
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {nextCharges.map((charge) => (
            <li key={charge.id} className="flex items-baseline justify-between gap-3 text-14">
              <span className="min-w-0 truncate">
                {charge.nome}{" "}
                <span className="text-caption">
                  · {charge.proxima.replace("Próxima cobrança em ", "")}
                </span>
              </span>
              <strong className="shrink-0 tabular-nums">{charge.valor}</strong>
            </li>
          ))}
        </ul>
      </OverviewCard>

      <OverviewCard
        icon="target"
        title="Metas"
        value={goalsSummary.guardado}
        caption={`guardados em ${goals.length} metas`}
        link={{ href: "/metas", label: "Ver metas" }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-14">
            <span className="min-w-0 truncate">{mainGoal.nome}</span>
            <strong className="shrink-0 tabular-nums">{mainGoal.percentual}%</strong>
          </div>
          <ProgressBar
            value={mainGoal.percentual}
            tone="folha"
            height={8}
            label={`${mainGoal.nome}: ${mainGoal.guardado} de ${mainGoal.alvo}`}
          />
          <span className="text-12 text-caption">
            {mainGoal.guardado} de {mainGoal.alvo}
          </span>
        </div>
      </OverviewCard>

      <OverviewCard
        icon="bell"
        title="Alertas de preço"
        value={`${priceAlerts.length} ativos`}
        caption="vigiados para você"
        link={{ href: "/alertas", label: "Ver alertas" }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-14">
            <span className="min-w-0 truncate">
              {nearestAlert.ativo}{" "}
              <span className="text-caption">
                · {nearestAlert.direcao === "venda" ? "venda" : "compra"}
              </span>
            </span>
            <strong className="shrink-0 tabular-nums">{nearestAlert.faltam}</strong>
          </div>
          <ProgressBar
            value={nearestAlert.progresso}
            tone="tucano"
            height={8}
            label={`${nearestAlert.ativo}: ${nearestAlert.condicao}`}
          />
          <span className="text-12 text-caption">{nearestAlert.condicao}</span>
        </div>
      </OverviewCard>
    </div>
  );
}
