import Link from "next/link";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import type { Risk } from "@/features/investimentos/data";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import { seriesKey, type ComparedAsset } from "../data";
import { ComparedChart, type Variant } from "./charts";
import {
  AssetActions,
  AssetBadge,
  BrazilFlag,
  DataSource,
  EventsCard,
  IndicatorsCard,
  InfoHint,
} from "./parts";

function Origin({ asset }: { asset: ComparedAsset }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-14 text-mist">
      {asset.origem.tipo === "br" ? (
        <BrazilFlag />
      ) : (
        <span className="text-folha">
          <Icon name="globe" size={16} />
        </span>
      )}
      <span>{asset.origem.texto}</span>
      <span aria-hidden="true" className="text-caption">
        ·
      </span>
      <span>{asset.subtitulo}</span>
    </span>
  );
}

function Header({ asset, variant }: { asset: ComparedAsset; variant: Variant }) {
  const mobile = variant === "mobile";
  const title = (
    <div className="flex min-w-0 items-center gap-3.5">
      <AssetBadge asset={asset} size={mobile ? "md" : "lg"} />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1
            className={cn(
              "m-0 font-display leading-[1.1] font-extrabold tracking-[-0.01em]",
              mobile ? "text-26" : "text-34",
            )}
          >
            {asset.nome}
          </h1>
          <span className="rounded-full bg-shade px-2.5 py-[3px] text-12 font-bold text-mist">
            {asset.tag}
          </span>
        </div>
        <Origin asset={asset} />
      </div>
    </div>
  );

  if (mobile) {
    return (
      <>
        <header className="flex flex-col gap-3.5">{title}</header>
        <AssetActions alert={asset.criarAlerta} className="flex-col flex-nowrap" />
      </>
    );
  }
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      {title}
      <AssetActions alert={asset.criarAlerta} />
    </header>
  );
}

function ChartCard({ asset, variant }: { asset: ComparedAsset; variant: Variant }) {
  const mobile = variant === "mobile";
  const rent = asset.destaque.tipo === "rentabilidade";
  const selectClass =
    "inline-flex h-9 items-center gap-2 border-none border-b border-line-strong bg-transparent px-1 text-14 font-semibold whitespace-nowrap text-sand";
  return (
    <Panel className={cn("gap-4", mobile ? "p-4.5" : "p-6")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Período" className="flex gap-1 border-b border-line">
          {["1M", "YTD", "1A", "5A"].map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === "1A"}
              className={cn(
                "h-9 border-x-0 border-t-0 border-b-2 border-solid bg-transparent text-14",
                mobile ? "px-2.5" : "px-3",
                p === "1A"
                  ? "border-sand font-bold text-sand"
                  : "border-transparent font-medium text-mist",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className={cn(selectClass, "border-b border-solid")}>
            Comparar com: CDI
            <span className="text-mist">
              <Icon name="chevron-down" size={14} />
            </span>
          </button>
          {asset.precoAjustado && (
            <>
              <button type="button" className={cn(selectClass, "border-b border-solid")}>
                Preço ajustado
                <span className="text-mist">
                  <Icon name="chevron-down" size={14} />
                </span>
              </button>
              <InfoHint
                text="Inclui os rendimentos pagos no período."
                size={15}
                className="align-[-3px]"
              />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-14 text-mist">{asset.destaque.rotulo}</span>
        <span
          className={cn(
            "font-display leading-[1.05] font-extrabold tracking-[-0.01em] tabular-nums",
            mobile ? "text-34" : "text-42",
            rent ? "text-folha" : "text-sand",
          )}
        >
          {asset.destaque.valor}
        </span>
        <span className="text-15 font-bold tabular-nums">
          <span className={rent ? "text-mist" : "text-folha"}>{asset.destaque.variacao[0]}</span>{" "}
          <span className={rent ? "text-folha" : "text-mist"}>{asset.destaque.variacao[1]}</span>
        </span>
        <span className="text-12 font-bold tracking-[.06em] text-caption">
          23 SET 2025 – 23 SET 2026
        </span>
      </div>
      <ComparedChart variant={variant} seriesKey={seriesKey[asset.slug] ?? ""} name={asset.nome} />
      <div className="flex gap-4.5 text-13 text-mist">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-[3px] w-4.5 rounded-xs bg-folha" />
          {asset.nome}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-4.5 border-t-2 border-dashed border-caption" />
          CDI
        </span>
      </div>
    </Panel>
  );
}

function FeesCard({
  asset,
  single,
  className,
}: {
  asset: ComparedAsset;
  single?: boolean;
  className?: string;
}) {
  return (
    <Panel className={cn("gap-4", className)}>
      <h2 className="m-0 font-display text-20 font-bold">Taxas e condições</h2>
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center text-14 text-mist">
          Custo total
          <InfoHint
            text="Soma das taxas cobradas ao ano sobre o valor investido."
            size={15}
            className="align-[-3px]"
          />
        </span>
        <span
          className={cn(
            "font-display text-34 leading-[1.1] font-extrabold",
            asset.taxas.custo === "—" ? "text-caption" : "text-sand",
          )}
        >
          {asset.taxas.custo}
        </span>
        <span className="text-13 text-caption">{asset.taxas.legenda}</span>
      </div>
      <div className="flex items-center gap-1.5 border-t border-line pt-3.5 text-16 font-bold">
        Taxas detalhadas
        <span className="rotate-180 text-mist">
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      <dl className={cn("m-0 grid gap-2.5", single ? "grid-cols-1" : "grid-cols-2")}>
        {asset.taxas.itens.map((item) => (
          <div
            key={item.rotulo}
            className="flex min-w-0 flex-col gap-1 rounded-tile bg-field px-4 py-3.5"
          >
            <dt className="text-14 text-mist">{item.rotulo}</dt>
            <dd
              className={cn(
                "m-0 text-15 leading-[1.45] font-semibold",
                item.valor.startsWith("—") ? "text-caption" : "text-sand",
              )}
            >
              {item.valor}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

const riskTone: Record<Risk, string> = {
  Baixo: "bg-folha-bg text-folha [&>span]:bg-folha",
  Médio: "bg-tucano-bg text-tucano [&>span]:bg-tucano",
  Alto: "bg-urucum-bg text-urucum [&>span]:bg-urucum",
};

function DetailsCard({ asset }: { asset: ComparedAsset }) {
  const [nome, ...rest] = asset.detalhes.linhas;
  return (
    <Panel className="gap-4">
      <div className="-mx-5 flex items-center gap-2.5 border-b border-line px-5 pb-3.5">
        <span className="text-mist">
          <Icon name="file-text" size={18} />
        </span>
        <h2 className="m-0 text-16 font-bold">Detalhes do ativo</h2>
      </div>
      <dl className="m-0 -mt-2">
        {nome && (
          <div className="flex flex-col gap-0.5 border-b border-line py-3">
            <dt className="text-14 text-mist">{nome.rotulo}</dt>
            <dd className="m-0 text-15 font-bold">{nome.valor}</dd>
          </div>
        )}
        {rest.map((row) => (
          <div
            key={row.rotulo}
            className="flex items-center justify-between gap-3 border-b border-line py-3"
          >
            <dt className="text-14 text-mist">{row.rotulo}</dt>
            <dd className="m-0 flex items-center text-15">
              <span className="text-right font-bold">{row.valor}</span>
              {row.dica && <InfoHint text={row.dica} size={15} className="align-[-3px]" />}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-b border-line py-3">
          <dt className="text-14 text-mist">Risco</dt>
          <dd className="m-0 flex items-center text-15">
            <span
              className={cn(
                "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-13 font-bold whitespace-nowrap",
                riskTone[asset.detalhes.risco],
              )}
            >
              <span aria-hidden="true" className="size-[0.4375rem] rounded-full" />
              {asset.detalhes.risco}
            </span>
            <InfoHint
              text="Calculado pelo cadastro do ativo: volatilidade, risco de crédito e liquidez. Você pode ajustar."
              size={15}
              className="align-[-3px]"
            />
          </dd>
        </div>
      </dl>
      <button
        type="button"
        className="flex items-center gap-2 border-none bg-transparent px-0 pt-3 pb-0 text-left text-14 font-semibold text-mist"
      >
        <Icon name="more" size={18} />
        Mais detalhes
      </button>
      <p className="m-0 text-13 text-caption">{asset.detalhes.nota}</p>
    </Panel>
  );
}

function PositionCard({ asset }: { asset: ComparedAsset }) {
  return (
    <Panel className="gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-display text-18 font-bold">Sua posição</h2>
        <Link
          href="/investimentos/novo"
          className="flex items-center gap-1.5 text-14 font-bold text-sand underline-offset-3"
        >
          <Icon name="pencil" size={16} />
          Editar
        </Link>
      </div>
      <dl className="m-0 -mt-1.5">
        {asset.posicao.linhas.map((row) => (
          <div key={row.rotulo} className="flex justify-between gap-3 border-b border-line py-2.5">
            <dt className="text-14 text-mist">{row.rotulo}</dt>
            <dd
              className={cn(
                "m-0 text-right text-15 font-bold tabular-nums",
                row.vazio ? "text-caption" : "text-sand",
              )}
            >
              {row.valor}
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-13 leading-normal text-mist">{asset.posicao.nota}</p>
    </Panel>
  );
}

function AskPacuCard({ asset }: { asset: ComparedAsset }) {
  return (
    <Panel className="gap-4">
      <div className="-mx-5 flex items-center gap-2.5 border-b border-line px-5 pb-3.5">
        <AgentAvatar agent="pacu" size={28} variant="ring" />
        <h2 className="m-0 text-16 font-bold">Pergunte ao Pacu</h2>
        <span className="text-13 text-caption">sobre este ativo</span>
      </div>
      <div className="-mt-2">
        {asset.perguntas.map((q) => (
          <OpenChat
            key={q}
            agent="pacu"
            question={q}
            className="flex w-full items-center justify-between gap-3 border-0 border-b border-line bg-transparent px-0 py-3 text-left text-15 font-semibold text-sand hover:text-tucano"
          >
            {q}
            <span className="text-caption">
              <Icon name="arrow-up-right" size={16} />
            </span>
          </OpenChat>
        ))}
      </div>
      <div className="mt-1 flex min-h-[3.625rem] items-center gap-2 rounded-full border border-line-strong bg-field py-1 pr-1 pl-4">
        <span className="grow text-15 text-caption">Pergunte o que quiser…</span>
        <OpenChat
          agent="pacu"
          aria-label="Enviar pergunta"
          className="flex size-10 items-center justify-center rounded-full border-none bg-tucano text-canvas"
        >
          <Icon name="arrow-up" size={18} />
        </OpenChat>
      </div>
    </Panel>
  );
}

const footer =
  "Cotações e dados via Brapi e Open Finance, com atraso de até 15 minutos. Informação para acompanhamento, não é recomendação de investimento.";

/** Detalhe de ativos comparados ao CDI (renda fixa, ETF, FII, cripto). */
export function ComparedDetail({ asset, variant }: { asset: ComparedAsset; variant: Variant }) {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-4">
        <Header asset={asset} variant="mobile" />
        <ChartCard asset={asset} variant="mobile" />
        <PositionCard asset={asset} />
        <DetailsCard asset={asset} />
        <FeesCard asset={asset} single />
        <IndicatorsCard asset={asset} variant="mobile" />
        <EventsCard events={asset.eventos} variant="mobile" />
        <AskPacuCard asset={asset} />
        <DataSource>{footer}</DataSource>
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div className="flex flex-col gap-5">
        <Breadcrumb
          items={[{ label: "Investimentos", href: "/investimentos" }, { label: asset.nome }]}
        />
        <Header asset={asset} variant="tablet" />
        <ChartCard asset={asset} variant="tablet" />
        <div className="grid grid-cols-2 items-stretch gap-4">
          <DetailsCard asset={asset} />
          <PositionCard asset={asset} />
        </div>
        <FeesCard asset={asset} />
        <IndicatorsCard asset={asset} variant="tablet" className="p-5" />
        <EventsCard events={asset.eventos} variant="tablet" className="p-5" />
        <AskPacuCard asset={asset} />
        <DataSource>{footer}</DataSource>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: asset.nome }]}
      />
      <Header asset={asset} variant="desktop" />
      <div className="grid grid-cols-[minmax(0,8fr)_minmax(0,4fr)] items-stretch gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <ChartCard asset={asset} variant="desktop" />
          <FeesCard asset={asset} className="grow" />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <DetailsCard asset={asset} />
          <PositionCard asset={asset} />
          <AskPacuCard asset={asset} />
        </div>
      </div>
      <IndicatorsCard asset={asset} variant="desktop" />
      <EventsCard events={asset.eventos} variant="desktop" />
      <DataSource>{footer}</DataSource>
    </div>
  );
}
