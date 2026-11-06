"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { EmptyStateLayout } from "@/components/ui/empty-state";
import { GuidePanel, type GuideItem } from "@/components/ui/guide-panel";
import { Icon } from "@/components/ui/icon";
import {
  PreviousMonthsPanel,
  TetoListPanel,
  TetosSummaryCard,
} from "@/features/gastos/components/teto-cards";
import { useSession } from "@/features/acesso/session";
import { useTetosView } from "@/features/gastos/live-tetos";
import { previousMonths, tetoDetails, tetosSummary } from "@/features/gastos/tetos";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";

function NewTetoButton({
  size = "md",
  label = "Novo teto",
  block,
}: {
  size?: "md" | "lg";
  label?: string;
  block?: boolean;
}) {
  return (
    <ButtonLink
      href="/alertas/novo-teto"
      variant="forest"
      size={size}
      block={block}
      className="text-15"
    >
      <Icon name="plus" size={18} />
      <span>{label}</span>
    </ButtonLink>
  );
}

const howItWorks: GuideItem[] = [
  {
    icon: "repeat-alt",
    titulo: "Recomeça todo dia 1º",
    texto: "O consumo zera no começo de cada mês",
  },
  {
    icon: "alert-triangle",
    titulo: "Avisos no caminho",
    texto: "Opcional: por exemplo R$ 500 e R$ 700 num teto de R$ 1.000",
  },
  {
    icon: "check",
    titulo: "Um aviso de cada, por mês",
    texto: "Pelo celular, por e-mail ou pelos dois",
  },
  {
    icon: "bank",
    titulo: "Todos os bancos juntos",
    texto: "Conta crédito e débito do Nubank e do Itaú",
  },
];

function EmptyTetos() {
  return (
    <EmptyStateLayout
      icon="target"
      title="Nenhum teto ainda"
      message="Um teto avisa antes de você passar do limite que escolheu para uma categoria. Os avisos chegam uma vez por mês."
      action={<NewTetoButton label="Criar teto" />}
      side={
        <>
          <AgentTip
            agent="tamandua"
            named
            action={
              <ButtonLink href="/alertas/novo-teto" variant="secondary" size="sm">
                <span>Criar teto de Alimentação</span>
              </ButtonLink>
            }
          >
            Alimentação teve média de R$ 910 nos últimos 3 meses. Um teto de R$ 1.000 deixaria folga
            e avisaria em julho, quando passou disso.
          </AgentTip>
          <GuidePanel title="Como funcionam os tetos" items={howItWorks} />
        </>
      }
    />
  );
}

/** Tetos de gasto: com login, os da API; no protótipo, os de exemplo (`?vazio`). */
export function TetosScreen({ vazio }: { vazio: boolean }) {
  const { live } = useSession();
  const real = useTetosView({ enabled: live });
  if (live && !real.data) {
    return (
      <Page
        padding="detail"
        header={<MobileHeader title="Tetos de gasto" back="/alertas" balanced />}
      >
        {real.error ? <ErrorBlock /> : <LoadingStatus />}
      </Page>
    );
  }
  const view = real.data;
  const empty = view ? view.items.length === 0 : vazio;
  const items = view ? view.items : tetoDetails;
  const summary = view ? view.summary : tetosSummary;
  const months = view ? view.previousMonths : previousMonths;
  // Dica do Tamanduá: o teto mais apertado (só no protótipo vem escrita).
  const tightest = view
    ? [...view.items]
        .filter((t) => t.status !== "no-ritmo")
        .sort((a, b) => b.percentual - a.percentual)[0]
    : undefined;
  return (
    <Page
      padding="detail"
      zoom={empty ? undefined : 1.4}
      fill={empty}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Tetos de gasto" back="/alertas" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Alertas", href: "/alertas" }, { label: "Tetos de gasto" }]}
      />
      <DetailHeader
        title="Tetos de gasto"
        subtitle={empty ? "Nenhum teto criado" : (view?.mes ?? "Setembro 2026")}
        actions={empty ? undefined : <NewTetoButton />}
      />
      {empty ? (
        <EmptyTetos />
      ) : (
        <>
          <div className="contents @desk:hidden">
            <TetosSummaryCard summary={summary} />
            <TetoListPanel items={items} />
            <PreviousMonthsPanel months={months} />
            <div className="@tab:hidden">
              <NewTetoButton size="lg" block />
            </div>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] items-stretch gap-5 @desk:grid">
            <TetoListPanel items={items} />
            <div className="flex min-w-0 flex-col gap-4">
              <TetosSummaryCard summary={summary} />
              {view ? (
                tightest && (
                  <AgentTip
                    agent="tamandua"
                    named
                    action={
                      <ButtonLink
                        href={`/gastos/categorias/${tightest.categoryId}`}
                        variant="secondary"
                        size="sm"
                      >
                        <span>Ver lançamentos de {tightest.categoria}</span>
                      </ButtonLink>
                    }
                  >
                    {tightest.categoria} já está em {tightest.destaque.percentual} do teto.
                  </AgentTip>
                )
              ) : (
                <AgentTip
                  agent="tamandua"
                  named
                  action={
                    <ButtonLink href="/gastos/categorias/transporte" variant="secondary" size="sm">
                      <span>Ver lançamentos de Transporte</span>
                    </ButtonLink>
                  }
                >
                  Transporte já está em 86% e ainda faltam 7 dias. Se seguir assim, passa do teto.
                  Quer ver de onde vieram as corridas?
                </AgentTip>
              )}
              <PreviousMonthsPanel className="grow" months={months} />
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
