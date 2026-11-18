"use client";

import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { useSession } from "@/features/acesso/session";
import { PlanNote } from "@/features/ativo/components/asset-panels";
import {
  isPlanLimit,
  isPositionId,
  toAssetView,
  toMarketView,
  useMarketAsset,
  usePosition,
} from "@/features/ativo/live";
import { ApiError } from "@/lib/api";

const title = "text-17 tracking-normal @desk:text-19";

/** Proventos dos últimos 12 meses e eventos corporativos do ativo (API de mercado). */
export function EventosScreen({ id }: { id: string }) {
  const { live } = useSession();
  const position = usePosition(id, { enabled: live });
  const asset = position.data ? toAssetView(position.data) : null;
  const symbol = asset?.mercado ? asset.ticker : null;
  const marketQuery = useMarketAsset(symbol, { enabled: live });
  const market = marketQuery.data ? toMarketView(marketQuery.data) : null;

  if (!isPositionId(id)) notFound();
  if (position.error instanceof ApiError && position.error.code === "not_found") notFound();
  // Sem ticker da B3 (CDB, ativo dos EUA), não há proventos para listar.
  if (asset && !symbol) notFound();

  const back = `/investimentos/${id}`;
  const nome = asset?.nome ?? "Ativo";
  const failed = !live || position.error || (marketQuery.error && !isPlanLimit(marketQuery.error));
  const proventos = market?.proventos;
  const eventos = market?.eventos ?? [];

  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Proventos e eventos" subtitle={nome} back={back} balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: nome, href: back },
          { label: "Proventos e eventos" },
        ]}
      />
      <DetailHeader title="Proventos e eventos" subtitle={`${nome} · últimos 12 meses`} />
      {failed ? (
        <ErrorBlock />
      ) : isPlanLimit(marketQuery.error) ? (
        <PlanNote />
      ) : !market || !asset ? (
        <LoadingStatus />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 @tab:grid-cols-2 @desk:gap-5">
          <Panel className="p-4.5 @desk:p-5.5">
            <PanelHeader
              title="Proventos"
              subtitle={
                proventos
                  ? `${proventos.itens.length} pagamentos · ${proventos.porCota} por cota`
                  : undefined
              }
              titleClassName={title}
            />
            {proventos && (
              <div className="grid grid-cols-2 gap-2.5">
                <StatTile label="Por cota, 12 meses" value={proventos.porCota} />
                <StatTile label="Dividend yield" value={proventos.dy ?? "—"} />
              </div>
            )}
            {proventos && proventos.itens.length > 0 ? (
              <ul className="m-0 flex list-none flex-col p-0">
                {proventos.itens.map((p, i) => (
                  <li
                    key={`${p.dataCom}-${i}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-2.5 border-b border-line py-[0.6875rem] text-14"
                  >
                    <span className="flex flex-col leading-[1.3]">
                      <strong>{p.label}</strong>
                      <span className="text-12 text-caption">
                        data com {p.dataCom} · pagamento {p.pagamento}
                      </span>
                    </span>
                    <span className="font-bold whitespace-nowrap tabular-nums">{p.valor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-14 text-mist">
                {market.limites.includes("proventos")
                  ? "A fonte de dados não cobre os proventos deste ativo."
                  : "Nenhum provento nos últimos 12 meses."}
              </p>
            )}
            <p className="m-0 text-13 leading-[1.55] text-caption">
              Valores por cota, informados pela fonte de dados. O quanto você recebeu depende da
              quantidade que tinha na data com.
            </p>
          </Panel>
          <Panel className="p-4.5 @desk:p-5.5">
            <PanelHeader
              title="Eventos corporativos"
              subtitle="Desdobramentos, grupamentos e bonificações"
              titleClassName={title}
            />
            {eventos.length > 0 ? (
              <ul className="m-0 flex list-none flex-col p-0">
                {eventos.map((e, i) => (
                  <li
                    key={`${e.data}-${i}`}
                    className="grid grid-cols-[5.75rem_1fr_auto] items-center gap-2.5 border-b border-line py-[0.6875rem] text-14"
                  >
                    <span className="text-mist tabular-nums">{e.data}</span>
                    <span className="flex flex-col leading-[1.3]">
                      <strong>{e.label}</strong>
                      {e.descricao && <span className="text-12 text-caption">{e.descricao}</span>}
                    </span>
                    <span className="font-bold whitespace-nowrap tabular-nums">
                      fator {e.fator.replace(".", ",")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-14 text-mist">Nenhum evento corporativo informado.</p>
            )}
          </Panel>
        </div>
      )}
    </Page>
  );
}
