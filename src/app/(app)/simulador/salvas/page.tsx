import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { parseScreenState } from "@/components/states/screen-state";
import { LoadingStatus, Skeleton } from "@/components/states/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SavedSimulationList } from "@/features/simulador/components/saved-list";
import { savedSimulations } from "@/features/simulador/saved";

export default async function SimulacoesSalvasPage({
  searchParams,
}: PageProps<"/simulador/salvas">) {
  const state = parseScreenState((await searchParams).estado);
  const count = savedSimulations.length - (state === "excluida" ? 1 : 0);
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Simulações salvas" back="/simulador" balanced />}
    >
      {state === "carregando" && <LoadingStatus />}
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Simulador", href: "/simulador" }, { label: "Simulações salvas" }]}
      />
      <DetailHeader
        title="Simulações salvas"
        subtitle={`${count} simulações`}
        actions={
          <ButtonLink href="/simulador" variant="secondary" size="sm" className="hidden @desk:flex">
            <Icon name="trending-up" size={18} />
            <span>Abrir o simulador</span>
          </ButtonLink>
        }
      />
      <Skeleton active={state === "carregando"}>
        <SavedSimulationList state={state} />
        {state !== "vazio" && (
          <p className="m-0 text-13 leading-[1.55] text-caption">
            Simulações usam seus números do dia em que foram salvas. Ao abrir, você pode atualizar
            com os dados de hoje.
          </p>
        )}
      </Skeleton>
    </Page>
  );
}
