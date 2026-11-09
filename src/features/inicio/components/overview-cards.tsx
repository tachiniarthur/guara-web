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

import type { OverviewData } from "../live";

export type OverviewCardId = "investimentos" | "cobrancas" | "metas" | "alertas";

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

/** Os dados de exemplo no formato da Visão geral (modo protótipo). */
function prototypeOverview(): OverviewData {
  const mainGoal = goals.find((goal) => goal.percentual > 0) ?? goals[0]!;
  const nearestAlert = priceAlerts.reduce((best, alert) =>
    alert.progresso > best.progresso ? alert : best,
  );
  const nextCharges = [...subscriptions].sort((a, b) => a.dia - b.dia).slice(0, 3);
  return {
    investimentos: {
      valor: portfolio.patrimonio,
      legenda: portfolio.variacaoMes,
      alocacao: allocation.map(({ classe, atual, cor }) => ({ classe, atual, cor })),
    },
    cobrancas: {
      valor: subscriptionTotals.mensal,
      legenda: `por mês em ${subscriptions.length} assinaturas`,
      itens: nextCharges.map((charge) => ({
        id: charge.id,
        nome: charge.nome,
        quando: charge.proxima.replace("Próxima cobrança em ", ""),
        valor: charge.valor,
      })),
    },
    metas: {
      valor: goalsSummary.guardado,
      legenda: `guardados em ${goals.length} metas`,
      principal: {
        nome: mainGoal.nome,
        percentual: mainGoal.percentual,
        guardado: mainGoal.guardado,
        alvo: mainGoal.alvo,
      },
    },
    alertas: {
      valor: `${priceAlerts.length} ativos`,
      legenda: "vigiados para você",
      maisPerto: {
        ativo: nearestAlert.ativo,
        direcao: nearestAlert.direcao === "venda" ? "venda" : "compra",
        faltam: nearestAlert.faltam,
        progresso: nearestAlert.progresso,
        condicao: nearestAlert.condicao,
      },
    },
  };
}

/**
 * Visão geral do Início: investimentos, próximas cobranças, metas e alertas de preço, cada um
 * com o número principal e um atalho para a tela completa.
 */
export function OverviewCards({
  className,
  data = prototypeOverview(),
  only,
}: {
  className?: string;
  data?: OverviewData;
  /** Só um dos cartões, sem a grade (cada cartão é um bloco do layout editável). */
  only?: OverviewCardId;
}) {
  const { investimentos, cobrancas, metas, alertas } = data;
  const cards: Record<OverviewCardId, ReactNode> = {
    investimentos: (
      <OverviewCard
        icon="trending-up"
        title="Investimentos"
        value={investimentos.valor}
        caption={investimentos.legenda}
        link={{ href: "/investimentos", label: "Ver carteira" }}
      >
        <div
          role="img"
          aria-label={`Alocação: ${investimentos.alocacao.map((s) => `${s.classe} ${s.atual}%`).join(", ")}`}
          className="flex h-2 origin-left animate-grow-x gap-[2px] overflow-hidden rounded-full"
        >
          {investimentos.alocacao.map((slice) => (
            <span key={slice.classe} style={{ flexGrow: slice.atual, background: slice.cor }} />
          ))}
        </div>
      </OverviewCard>
    ),
    cobrancas: (
      <OverviewCard
        icon="repeat"
        title="Próximas cobranças"
        value={cobrancas.valor}
        caption={cobrancas.legenda}
        link={{ href: "/assinaturas", label: "Ver assinaturas" }}
      >
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {cobrancas.itens.map((charge) => (
            <li key={charge.id} className="flex items-baseline justify-between gap-3 text-14">
              <span className="min-w-0 truncate">
                {charge.nome} <span className="text-caption">· {charge.quando}</span>
              </span>
              <strong className="shrink-0 tabular-nums">{charge.valor}</strong>
            </li>
          ))}
        </ul>
      </OverviewCard>
    ),
    metas: (
      <OverviewCard
        icon="target"
        title="Metas"
        value={metas.valor}
        caption={metas.legenda}
        link={{ href: "/metas", label: "Ver metas" }}
      >
        {metas.principal && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 text-14">
              <span className="min-w-0 truncate">{metas.principal.nome}</span>
              <strong className="shrink-0 tabular-nums">{metas.principal.percentual}%</strong>
            </div>
            <ProgressBar
              value={metas.principal.percentual}
              tone="folha"
              height={8}
              label={`${metas.principal.nome}: ${metas.principal.guardado} de ${metas.principal.alvo}`}
            />
            <span className="text-12 text-caption">
              {metas.principal.guardado} de {metas.principal.alvo}
            </span>
          </div>
        )}
      </OverviewCard>
    ),
    alertas: (
      <OverviewCard
        icon="bell"
        title="Alertas de preço"
        value={alertas.valor}
        caption={alertas.legenda}
        link={{ href: "/alertas", label: "Ver alertas" }}
      >
        {alertas.maisPerto && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 text-14">
              <span className="min-w-0 truncate">
                {alertas.maisPerto.ativo}{" "}
                <span className="text-caption">· {alertas.maisPerto.direcao}</span>
              </span>
              <strong className="shrink-0 tabular-nums">{alertas.maisPerto.faltam}</strong>
            </div>
            <ProgressBar
              value={alertas.maisPerto.progresso}
              tone="tucano"
              height={8}
              label={`${alertas.maisPerto.ativo}: ${alertas.maisPerto.condicao}`}
            />
            <span className="text-12 text-caption">{alertas.maisPerto.condicao}</span>
          </div>
        )}
      </OverviewCard>
    ),
  };
  if (only) return cards[only];
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 @tab:grid-cols-2 @desk:grid-cols-4 @desk:gap-6",
        className,
      )}
    >
      {cards.investimentos}
      {cards.cobrancas}
      {cards.metas}
      {cards.alertas}
    </div>
  );
}
