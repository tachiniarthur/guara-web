import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { EmptyStateLayout } from "@/components/ui/empty-state";
import { GuidePanel, type GuideItem } from "@/components/ui/guide-panel";
import { Icon } from "@/components/ui/icon";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { PriceAlertList } from "@/features/alertas/components/price-alert-list";
import { priceAlerts } from "@/features/alertas/data";

const howItWorks: GuideItem[] = [
  {
    icon: "arrow-down",
    titulo: "Compra",
    texto: "Avisa quando o preço cair até o valor escolhido",
  },
  { icon: "arrow-up", titulo: "Venda", texto: "Avisa quando o preço subir até o valor escolhido" },
  { icon: "retry", titulo: "A cada cotação", texto: "Conferimos sempre que a cotação atualiza" },
  {
    icon: "pause",
    titulo: "Um aviso só",
    texto: "Depois de avisar, o alerta pausa até você decidir",
  },
];

function NewAlertButton({ label = "Novo alerta" }: { label?: string }) {
  return (
    <ButtonLink href="/alertas/novo-preco" variant="forest" size="md" className="text-15">
      <Icon name="plus" size={18} />
      <span>{label}</span>
    </ButtonLink>
  );
}

const tip = (
  <AgentTip agent="caramelo" named>
    É só dizer o ativo e o preço que eu fico de guarda. Funciona até para ativos que você ainda não
    tem.
  </AgentTip>
);

/** Todos os alertas de preço (e o estado vazio, em /alertas/precos?vazio). */
export default async function AlertasPrecoPage({
  searchParams,
}: {
  searchParams: Promise<{ vazio?: string }>;
}) {
  const empty = (await searchParams).vazio !== undefined;
  return (
    <Page
      padding="detail"
      zoom={empty ? undefined : 1.4}
      fill={empty}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Alertas de preço" back="/alertas" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Alertas", href: "/alertas" }, { label: "Alertas de preço" }]}
      />
      <DetailHeader
        title="Alertas de preço"
        subtitle={empty ? "Nenhum alerta criado" : `${priceAlerts.length} alertas ativos`}
        actions={empty ? undefined : <NewAlertButton />}
      />
      {empty ? (
        <EmptyStateLayout
          icon="trending-up"
          title="Nenhum alerta de preço"
          message="Escolha uma ação, FII, ETF ou cripto e o valor. Avisamos uma única vez quando o preço chegar lá."
          action={<NewAlertButton label="Criar alerta" />}
          side={
            <>
              {tip}
              <GuidePanel title="Como funcionam os alertas" items={howItWorks} />
            </>
          }
        />
      ) : (
        <div className="flex flex-col gap-4 @desk:grid @desk:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] @desk:items-stretch @desk:gap-5">
          <Panel className="gap-1 p-5.5">
            <PanelHeader
              title="Vigiados pelo Caramelo"
              subtitle="Aviso por notificação e e-mail"
              titleClassName="text-19 tracking-normal"
            />
            <PriceAlertList items={priceAlerts} />
          </Panel>
          <div className="flex min-w-0 flex-col gap-4">
            {tip}
            <GuidePanel title="Como funcionam os alertas" items={howItWorks} />
          </div>
        </div>
      )}
    </Page>
  );
}
