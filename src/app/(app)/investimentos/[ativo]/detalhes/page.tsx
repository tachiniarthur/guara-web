import { notFound } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DetailList } from "@/components/ui/detail-list";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { assets } from "@/features/ativo/data";
import { assetFacts } from "@/features/ativo/more";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(assetFacts).map((ativo) => ({ ativo }));
}

/*
 * Ordem das seções: no celular, a do cadastro (Identificação, Negociação, Custos, Risco); no
 * tablet, duas colunas (Identificação e Custos | Negociação e Risco); no desktop, quatro
 * colunas na ordem do tablet lido por coluna.
 */
const mobileOrder = ["order-1", "order-2", "order-3", "order-4"];

export default async function MaisDetalhesPage({
  params,
}: PageProps<"/investimentos/[ativo]/detalhes">) {
  const { ativo } = await params;
  const facts = assetFacts[ativo];
  const asset = assets[ativo];
  if (!facts || !asset) notFound();

  const [identificacao, negociacao, custos, risco] = facts.secoes;
  const columns = [
    [identificacao, custos],
    [negociacao, risco],
  ];
  return (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={
        <MobileHeader
          title="Detalhes do ativo"
          subtitle={asset.nome}
          back={`/investimentos/${ativo}`}
          balanced
        />
      }
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Investimentos", href: "/investimentos" },
          { label: asset.nome, href: `/investimentos/${ativo}` },
          { label: "Mais detalhes" },
        ]}
      />
      <DetailHeader
        title={`Detalhes do ${asset.nome}`}
        subtitle={facts.subtitulo}
        subtitleClassName="hidden @desk:block"
      />
      <div className="flex flex-col gap-4 @tab:grid @tab:grid-cols-2 @tab:items-stretch @desk:grid-cols-4 @desk:gap-5">
        {columns.map((column, c) => (
          <div
            key={c}
            className="contents @tab:flex @tab:min-w-0 @tab:flex-col @tab:gap-4 @desk:contents"
          >
            {column.map((secao, i) => (
              <Panel
                key={secao?.titulo}
                className={cn(
                  "p-4.5",
                  i === 1 && "grow",
                  mobileOrder[facts.secoes.indexOf(secao!)],
                  "@tab:order-none",
                )}
              >
                <PanelHeader title={secao?.titulo} titleClassName="text-17 tracking-normal" />
                <DetailList items={secao?.linhas ?? []} />
              </Panel>
            ))}
          </div>
        ))}
      </div>
      <p className="m-0 text-13 leading-[1.55] text-caption">{facts.nota}</p>
    </Page>
  );
}
