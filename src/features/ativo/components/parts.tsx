import Link from "next/link";
import type { ReactNode } from "react";

import { OFFLINE_NOTE } from "@/components/states/screen-state";
import { StateSwap } from "@/components/states/state-block";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { OpenChat } from "@/features/conversas/components/open-chat";
import { cn } from "@/lib/utils";

import type { Asset, DetailRow, EventsInfo, IndicatorRow, RangeInfo } from "../data";
import { indicatorHints, indicatorPeriods } from "../data";

/** Selo quadrado do ativo (BR, ETF, FII...). */
export function AssetBadge({ asset, size }: { asset: Asset; size: "lg" | "md" }) {
  const font = size === "md" ? (asset.badge.fonteMobile ?? asset.badge.fonte) : asset.badge.fonte;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-tile font-display font-extrabold text-sand shadow-[inset_0_0_0_1px_rgba(242,239,230,.2)]",
        size === "lg" ? "size-14" : "size-12",
      )}
      style={{ background: asset.badge.cor, fontSize: `${font / 16}rem` }}
    >
      {asset.badge.texto}
    </span>
  );
}

/** Bandeira do Brasil em miniatura (origem do ativo). */
export function BrazilFlag() {
  return (
    <svg
      width="1rem"
      height="1rem"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="block shrink-0"
    >
      <circle cx="10" cy="10" r="10" fill="#1F8A4C" />
      <path d="M10 3.5 17.5 10 10 16.5 2.5 10z" fill="#F2C230" />
      <circle cx="10" cy="10" r="3.6" fill="#2A5CA8" />
    </svg>
  );
}

/** Lista "rótulo · valor" com linhas divisórias. */
export function KeyValueList({
  rows,
  rowClassName,
  className,
}: {
  rows: (DetailRow & { vazio?: boolean })[];
  rowClassName?: string;
  className?: string;
}) {
  return (
    <dl className={cn("m-0 flex flex-col", className)}>
      {rows.map((row) => (
        <div
          key={row.rotulo}
          className={cn(
            "flex items-baseline justify-between gap-3 border-b border-line",
            rowClassName,
          )}
        >
          <dt className="text-14 text-mist">{row.rotulo}</dt>
          <dd
            className={cn(
              "m-0 text-right text-15 font-bold tabular-nums",
              row.vazio && "text-caption",
            )}
          >
            {row.valor}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Dica com ícone de informação (o texto vai no title e no nome acessível). */
export function InfoHint({
  text,
  size = 14,
  className,
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      title={text}
      aria-label={text}
      className={cn("ml-1.5 inline-flex align-[-2px] text-caption", className)}
    >
      <Icon name="info" size={size} />
    </span>
  );
}

/** Faixa de mínima/máxima com o preço atual marcado. */
export function RangeCard({
  range,
  short,
  className,
  replacement,
  offline,
}: {
  range: RangeInfo;
  short?: boolean;
  className?: string;
  /** Bloco de estado (erro, vazio) no lugar do conteúdo. */
  replacement?: ReactNode;
  /** Sem internet: o subtítulo dá a hora dos dados guardados. */
  offline?: boolean;
}) {
  return (
    <Panel className={cn("gap-4 p-[1.375rem]", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 font-display text-20 leading-[1.25] font-bold tracking-[-0.01em]">
          {range.titulo}
        </h2>
        <p className="m-0 text-13 text-caption">
          {offline ? (
            <span className="text-tucano">{OFFLINE_NOTE}</span>
          ) : short ? (
            range.subtituloCurto
          ) : (
            range.subtitulo
          )}
        </p>
      </div>
      <StateSwap replacement={replacement} className="grow gap-4">
        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={range.label}
            className="relative h-2.5 rounded-[0.3125rem] bg-[linear-gradient(90deg,rgba(255,106,80,0.55),rgba(242,194,48,0.55),rgba(108,192,142,0.55))]"
          >
            <div
              aria-hidden="true"
              className="absolute -top-[0.3125rem] size-5 rounded-full bg-sand shadow-[0_0_0_3px_var(--guara-card)]"
              style={{ left: `calc(${range.posicao}% - 0.625rem)` }}
            />
          </div>
          <div className="flex justify-between text-13 text-mist tabular-nums">
            <span>{range.min}</span>
            <span>{range.max}</span>
          </div>
        </div>
        <KeyValueList rows={range.linhas} rowClassName="min-h-[2.5625rem]" />
      </StateSwap>
    </Panel>
  );
}

const indicatorColor = (row: IndicatorRow["nome"], value: string) => {
  if (value === "—") return "text-caption";
  if (row === "Rentabilidade" || row === "Excesso (p.p.)") {
    if (value.startsWith("+")) return "text-folha";
    if (value.startsWith("−")) return "text-urucum";
  }
  return "text-sand";
};

/** Indicadores por período em tabela (desktop e tablet). */
export function IndicatorsTable({ rows, compact }: { rows: IndicatorRow[]; compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-tile border border-line">
      <table className="w-full border-collapse bg-card">
        <caption className="sr-only">Indicadores principais por período</caption>
        <thead className="bg-field">
          <tr>
            <th
              scope="col"
              className="border-b border-line-strong px-2.5 py-3 text-left text-12 font-bold tracking-[.04em] whitespace-nowrap text-mist uppercase"
            >
              <span className="sr-only">Indicador</span>
            </th>
            {indicatorPeriods.map((p) => (
              <th
                key={p}
                scope="col"
                className="border-b border-line-strong px-2.5 py-3 text-right text-12 font-bold tracking-[.04em] whitespace-nowrap text-mist uppercase"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const last = ri === rows.length - 1;
            return (
              <tr key={row.nome}>
                <th
                  scope="row"
                  className={cn(
                    "px-2.5 py-3 text-left font-medium whitespace-nowrap text-soft",
                    compact ? "text-13" : "text-14",
                    !last && "border-b border-line",
                  )}
                >
                  {row.nome}
                  <InfoHint text={indicatorHints[row.nome]} />
                </th>
                {row.valores.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-2.5 py-3 text-right font-bold whitespace-nowrap tabular-nums",
                      compact ? "text-13" : "text-14",
                      indicatorColor(row.nome, v),
                      !last && "border-b border-line",
                    )}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Indicadores de um período (12M por padrão) em lista; os períodos ficam em pílulas (mobile). */
export function IndicatorsList({ rows, period = 4 }: { rows: IndicatorRow[]; period?: number }) {
  return (
    <>
      <div role="group" aria-label="Período" className="-mr-4 flex gap-1.5 overflow-hidden">
        {indicatorPeriods.map((p, i) => (
          <button
            key={p}
            type="button"
            aria-pressed={i === period}
            className={cn(
              "h-[2.125rem] shrink-0 rounded-full border px-3 text-13 font-bold whitespace-nowrap",
              i === period
                ? "border-sand bg-sand text-canvas"
                : "border-line-strong bg-transparent text-mist",
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <dl className="m-0 -mt-1">
        {rows.map((row, ri) => (
          <div
            key={row.nome}
            className={cn(
              "flex items-center justify-between gap-3 py-3",
              ri < rows.length - 1 && "border-b border-line",
            )}
          >
            <dt className="text-14 text-soft">
              {row.nome}
              <InfoHint text={indicatorHints[row.nome]} />
            </dt>
            <dd
              className={cn(
                "m-0 text-16 font-bold tabular-nums",
                indicatorColor(row.nome, row.valores[period] ?? "—"),
              )}
            >
              {row.valores[period]}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

/** Seção "Indicadores principais". */
export function IndicatorsCard({
  asset,
  variant,
  className,
  replacement,
  offline,
}: {
  asset: Asset;
  variant: "desktop" | "tablet" | "mobile";
  className?: string;
  replacement?: ReactNode;
  offline?: boolean;
}) {
  const mobile = variant === "mobile";
  return (
    <Panel className={cn("gap-3.5", mobile ? "p-4" : "p-6", className)}>
      <div className="flex flex-col gap-0.5">
        <h2
          className={cn(
            "m-0 font-display leading-[1.25] font-bold",
            mobile ? "text-18" : "text-20",
          )}
        >
          Indicadores principais
        </h2>
        <p className="m-0 text-13 text-mist">
          {offline ? (
            <span className="text-tucano">{OFFLINE_NOTE}</span>
          ) : (
            "Atualizado em 23 de set. de 2026"
          )}
        </p>
      </div>
      <StateSwap replacement={replacement} className="grow gap-3.5">
        {mobile ? (
          <IndicatorsList rows={asset.indicadores} />
        ) : (
          <IndicatorsTable rows={asset.indicadores} compact={variant === "tablet"} />
        )}
        <p className="m-0 text-13 text-caption">{asset.notaIndicadores}</p>
      </StateSwap>
    </Panel>
  );
}

/** "Ver todos": link para a lista completa quando ela existe; senão, só expande. */
function ViewAll({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: ReactNode;
}) {
  return href ? (
    <Link href={href} className={cn(className, "no-underline hover:text-sand")}>
      {children}
      <Icon name="chevron-down" size={14} />
    </Link>
  ) : (
    <button type="button" className={className}>
      {children}
      <Icon name="chevron-down" size={14} />
    </button>
  );
}

/** Seção "Eventos corporativos": tabela de proventos ou aviso de que o ativo não paga. */
export function EventsCard({
  events,
  variant,
  className,
  allHref,
  replacement,
  offline,
}: {
  events: EventsInfo;
  variant: "desktop" | "tablet" | "mobile";
  className?: string;
  /** Tela com todos os eventos ("Ver todos"), quando existe. */
  allHref?: string;
  replacement?: ReactNode;
  offline?: boolean;
}) {
  const mobile = variant === "mobile";
  const th =
    "border-b border-line-strong px-4 py-3 text-12 font-bold tracking-[.04em] whitespace-nowrap text-mist uppercase";
  const td = "border-b border-line px-4 py-3 text-14";

  return (
    <Panel className={cn("gap-3.5", mobile ? "p-4" : "p-6", className)}>
      <div className="flex flex-col gap-0.5">
        <h2
          className={cn(
            "m-0 font-display leading-[1.25] font-bold",
            mobile ? "text-18" : "text-20",
          )}
        >
          Eventos corporativos
        </h2>
        <p className="m-0 text-13 text-mist">
          {offline ? <span className="text-tucano">{OFFLINE_NOTE}</span> : events.subtitulo}
        </p>
      </div>
      <StateSwap replacement={replacement} className="grow gap-3.5">
        {events.tipo === "mensagem" ? (
          <div className="flex gap-3 rounded-tile bg-field p-4 text-14 leading-[1.55] text-soft">
            <span className="mt-0.5 text-caption">
              <Icon name="info" size={18} />
            </span>
            <span>{events.texto}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 rounded-[0.875rem] bg-folha-bg px-3.5 py-3 text-14 text-sand">
              <span className="text-folha">
                <Icon name="dollar" size={18} />
              </span>
              <span>{events.resumo}</span>
            </div>
            {mobile ? (
              <ul className="m-0 -mt-1 list-none p-0">
                {events.eventos.slice(0, 6).map((e) => (
                  <li
                    key={e.data}
                    className="flex items-center justify-between gap-3 border-b border-line py-3"
                  >
                    <span className="flex flex-col leading-[1.35]">
                      <strong className="text-15 tabular-nums">{e.data}</strong>
                      <span className="text-13 text-mist">{e.evento}</span>
                    </span>
                    <span className="flex flex-col items-end leading-[1.35]">
                      <strong className="text-15 tabular-nums">{e.valor}</strong>
                      <span
                        className={cn(
                          "text-13 tabular-nums",
                          e.recebido ? "text-folha" : "text-caption",
                        )}
                      >
                        {e.recebido
                          ? `você: ${e.recebido.replace("+", "")}`
                          : (events.semRecebimento ?? "—")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="overflow-hidden rounded-tile border border-line">
                <table className="w-full border-collapse">
                  <caption className="sr-only">Eventos corporativos</caption>
                  <thead className="bg-field">
                    <tr>
                      <th scope="col" className={cn(th, "text-left")}>
                        Data
                      </th>
                      <th scope="col" className={cn(th, "text-left")}>
                        Evento
                      </th>
                      <th scope="col" className={cn(th, "text-right")}>
                        Valor
                      </th>
                      <th scope="col" className={cn(th, "text-right")}>
                        Você recebeu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.eventos.map((e) => (
                      <tr key={e.data}>
                        <td className={cn(td, "font-bold tabular-nums")}>{e.data}</td>
                        <td className={cn(td, "text-mist")}>{e.evento}</td>
                        <td className={cn(td, "text-right font-bold tabular-nums")}>{e.valor}</td>
                        <td
                          className={cn(
                            td,
                            "text-right font-bold tabular-nums",
                            e.recebido ? "text-folha" : "text-caption",
                          )}
                        >
                          {e.recebido ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ViewAll
                  href={allHref}
                  className="flex w-full items-center gap-1.5 border-none bg-transparent px-4 py-3 text-14 font-semibold text-mist"
                >
                  Ver todos ({events.total})
                </ViewAll>
              </div>
            )}
            {mobile && (
              <ViewAll
                href={allHref}
                className="flex items-center gap-1.5 border-none bg-transparent p-0 text-14 font-semibold text-mist"
              >
                Ver todos ({events.total})
              </ViewAll>
            )}
            <p className="m-0 text-13 text-caption">{events.nota}</p>
          </>
        )}
      </StateSwap>
    </Panel>
  );
}

/** Rodapé de fonte dos dados. */
export function DataSource({ children }: { children: ReactNode }) {
  return <p className="m-0 text-12 text-caption">{children}</p>;
}

/** Botões de ação do topo (criar alerta, editar posição, perguntar ao Pacu). */
export function AssetActions({
  alert,
  alertIcon = "bell-plus",
  className,
  itemClassName,
}: {
  alert: boolean;
  alertIcon?: "bell" | "bell-plus";
  className?: string;
  itemClassName?: string;
}) {
  const base =
    "flex h-11 items-center justify-center gap-2 rounded-full border px-4.5 text-14 font-bold whitespace-nowrap no-underline";
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {alert && (
        <Link
          href="/alertas/novo-preco"
          className={cn(base, "border-tucano bg-tucano text-canvas", itemClassName)}
        >
          <Icon name={alertIcon} size={18} />
          <span>Criar alerta de preço</span>
        </Link>
      )}
      <Link
        href="/investimentos/novo"
        className={cn(
          base,
          alert ? "border-line-strong bg-card text-sand" : "border-tucano bg-tucano text-canvas",
          itemClassName,
        )}
      >
        <Icon name="pencil" size={18} />
        <span>Editar posição</span>
      </Link>
      <OpenChat
        agent="pacu"
        className={cn(base, "border-line-strong bg-card text-sand", itemClassName)}
      >
        <Icon name="chat" size={18} />
        <span>Perguntar ao Pacu</span>
      </OpenChat>
    </div>
  );
}
