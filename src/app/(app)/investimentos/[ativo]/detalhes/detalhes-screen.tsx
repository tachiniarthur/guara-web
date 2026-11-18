"use client";

import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailList } from "@/components/ui/detail-list";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSession } from "@/features/acesso/session";
import { toAssetFacts } from "@/features/ativo/facts";
import {
  isPlanLimit,
  isPositionId,
  toAssetView,
  useMarketAsset,
  usePosition,
} from "@/features/ativo/live";
import { ApiError } from "@/lib/api";

/**
 * Mais detalhes do ativo (API): Identificação, Negociação, Custos e Risco, só com o que a posição
 * e a fonte de mercado mandam. No celular, uma coluna; no tablet, duas; no desktop, quatro.
 */
export function DetalhesScreen({ id }: { id: string }) {
  const { live } = useSession();
  const position = usePosition(id, { enabled: live });
  const asset = position.data ? toAssetView(position.data) : null;
  const symbol = asset?.mercado ? asset.ticker : null;
  const marketQuery = useMarketAsset(symbol, { enabled: live });

  if (!isPositionId(id)) notFound();
  if (position.error instanceof ApiError && position.error.code === "not_found") notFound();

  const back = `/investimentos/${id}`;
  const nome = asset?.nome ?? "Ativo";
  // Sem a página do ativo no plano (ou sem a fonte), a ficha sai só com os dados da posição.
  const marketPending = Boolean(symbol) && !marketQuery.data && !marketQuery.error;
  const sections =
    position.data && !marketPending ? toAssetFacts(position.data, marketQuery.data ?? null) : null;
  const marketMissing = Boolean(symbol) && Boolean(marketQuery.error);

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Detalhes do ativo" subtitle={nome} back={back} balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: nome, href: back },
          { label: "Mais detalhes" },
        ]}
      />
      <DetailHeader title={`Detalhes de ${nome}`} subtitle={asset?.descricao} />
      {!live || position.error ? (
        <ErrorBlock />
      ) : !sections ? (
        <LoadingStatus />
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-4 @tab:grid-cols-2 @desk:grid-cols-4 @desk:gap-5">
            {sections.map((section) => (
              <Panel key={section.titulo} className="p-4.5">
                <PanelHeader title={section.titulo} titleClassName="text-17 tracking-normal" />
                <DetailList items={section.linhas} />
              </Panel>
            ))}
          </div>
          <p className="m-0 text-13 leading-[1.55] text-caption">
            {marketMissing
              ? isPlanLimit(marketQuery.error)
                ? "A cotação e os dados de negociação fazem parte de outro plano; aqui ficam só os dados da sua posição."
                : "Não deu para carregar a cotação agora; aqui ficam só os dados da sua posição."
              : "Dados da sua posição e, quando o ativo tem ticker, da fonte de mercado."}{" "}
            Taxas de administração e de corretagem, descrição da empresa e indicadores por período
            entram aqui quando a fonte de dados trouxer.
          </p>
        </>
      )}
    </Page>
  );
}
