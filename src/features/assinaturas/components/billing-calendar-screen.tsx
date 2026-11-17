"use client";

import { useState, type ReactNode } from "react";

import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { LoadingStatus } from "@/components/states/skeleton";
import { ErrorBlock } from "@/components/states/state-block";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useSession } from "@/features/acesso/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { capitalize, MONTHS } from "@/lib/live-format";
import { cn } from "@/lib/utils";

import {
  calendarMonth,
  calendarNote,
  monthFrom,
  useAssinaturasView,
  type CalendarMonth,
} from "../live";

const PALETTE = ["#6DB3EC", "#F2C230", "#FF6A50", "#6CC08E", "#B79CED", "#E0935A", "#BDC6BE"];
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
/** Quantos meses dá para avançar (as cobranças futuras são estimadas pela última). */
const MAX_AHEAD = 11;

function MonthGrid({
  month,
  colors,
  previous,
  next,
  onPrevious,
  onNext,
  note,
}: {
  month: CalendarMonth;
  colors: Map<string, string>;
  previous: string | null;
  next: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
  note: string;
}) {
  const title = capitalize(month.titulo);
  const byDay = new Map<number, CalendarMonth["cobrancas"]>();
  for (const charge of month.cobrancas) {
    byDay.set(charge.dia, [...(byDay.get(charge.dia) ?? []), charge]);
  }
  return (
    <Panel className="gap-3.5 p-5 @tab:p-6">
      <div className="flex items-center gap-1">
        <IconButton
          icon="chevron-left"
          label={previous ?? "Mês anterior"}
          variant="ghost"
          disabled={!previous}
          onClick={onPrevious}
        />
        <strong className="grow text-center font-display text-20">{title}</strong>
        <IconButton
          icon="chevron-right"
          label={next ?? "Próximo mês"}
          variant="ghost"
          disabled={!next}
          onClick={onNext}
        />
      </div>
      <div role="grid" aria-label={title} className="grid grid-cols-7 gap-1 @tab:gap-2">
        {weekdays.map((day) => (
          <span key={day} className="text-center text-12 font-bold text-caption">
            {day}
          </span>
        ))}
        {Array.from({ length: month.primeiroDiaSemana }, (_, i) => (
          <span key={`vazio-${i}`} />
        ))}
        {Array.from({ length: month.dias }, (_, i) => {
          const day = i + 1;
          const charges = byDay.get(day) ?? [];
          const first = charges[0];
          return (
            <div
              key={day}
              aria-label={
                first
                  ? `${day} de ${month.nome}: ${charges.map((c) => `${c.item.nome}, ${c.item.valor}`).join("; ")}`
                  : undefined
              }
              className={cn(
                "flex min-h-12 flex-col gap-1.5 rounded-[0.875rem] border border-line p-2 @tab:min-h-23 @desk:min-h-30",
                first ? "bg-shade" : "bg-transparent",
              )}
            >
              <span
                className={cn(
                  "text-13",
                  first ? "font-extrabold text-sand" : "font-medium text-caption",
                )}
              >
                {day}
              </span>
              {charges.map((charge) => (
                <span key={charge.item.id} className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-12 font-bold">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: colors.get(charge.item.id) }}
                    />
                    <span className="hidden truncate @tab:inline">{charge.item.nome}</span>
                  </span>
                  <span className="hidden text-12 text-mist tabular-nums @tab:block">
                    {charge.item.valor}
                  </span>
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <p className="m-0 text-12 leading-[1.55] text-caption">{note}</p>
    </Panel>
  );
}

function ChargesPanel({
  month,
  subtitle,
  note,
  today = 0,
}: {
  month: CalendarMonth;
  subtitle: string;
  note: string;
  /** No mês atual, o dia de hoje: as cobranças antes dele já passaram. */
  today?: number;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthNumber = MONTHS.indexOf(month.nome) + 1;
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title={`Cobranças de ${month.nome}`}
        subtitle={subtitle}
        titleClassName="text-18 tracking-normal"
      />
      {month.cobrancas.length > 0 ? (
        <RowList>
          {month.cobrancas.map((c, i) => (
            <ListRow
              key={c.item.id}
              href={`/assinaturas/${c.item.id}`}
              leading={
                <span
                  aria-hidden="true"
                  className="flex size-[2.375rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas font-display text-15 font-bold"
                >
                  {c.item.nome.charAt(0)}
                </span>
              }
              title={c.item.nome}
              meta={`${pad(c.dia)}/${pad(monthNumber)} · ${c.dia < today ? "já cobrada" : c.item.periodo === "por ano" ? "cobrança anual" : "próxima cobrança"}`}
              value={c.item.valor}
              divider={i < month.cobrancas.length - 1}
            />
          ))}
        </RowList>
      ) : (
        <p className="m-0 text-14 text-mist">Nenhuma cobrança prevista neste mês.</p>
      )}
      <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-shade px-3.5 py-3 text-13 leading-normal text-sand">
        <span className="mt-px text-mist">
          <Icon name="calendar" size={16} />
        </span>
        <span>{note}</span>
      </div>
    </Panel>
  );
}

/** Calendário de cobranças: o mês atual e os próximos (com login, das assinaturas da API). */
export function BillingCalendarScreen() {
  const { live } = useSession();
  const view = useAssinaturasView({ enabled: live });
  const [offset, setOffset] = useState(0);

  const shell = (subtitle: string, content: ReactNode) => (
    <Page
      padding="detail"
      zoom={1.4}
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Calendário de cobranças" back="/assinaturas" balanced />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[{ label: "Assinaturas", href: "/assinaturas" }, { label: "Calendário" }]}
      />
      <DetailHeader title="Calendário de cobranças" subtitle={subtitle} />
      {content}
    </Page>
  );

  if (view.error || !live) return shell("Assinaturas", <ErrorBlock />);
  if (!view.data) {
    return shell(
      "Assinaturas",
      <>
        <LoadingStatus />
        <p className="m-0 text-14 text-mist">Carregando as cobranças…</p>
      </>,
    );
  }

  const now = new Date();
  const { subs, items } = view.data;
  const { year, month: monthNumber } = monthFrom(now, offset);
  const month = calendarMonth(subs, items, year, monthNumber);
  const colors = new Map(items.map((s, i) => [s.id, PALETTE[i % PALETTE.length]!]));
  const label = (delta: number) => {
    const target = monthFrom(now, offset + delta);
    return capitalize(MONTHS[target.month - 1]!);
  };
  const count = month.cobrancas.length;
  return shell(
    capitalize(month.titulo),
    <div className="flex flex-col gap-4 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @desk:items-stretch">
      <MonthGrid
        month={month}
        colors={colors}
        previous={offset > 0 ? label(-1) : null}
        next={offset < MAX_AHEAD ? label(1) : null}
        onPrevious={() => setOffset((value) => Math.max(0, value - 1))}
        onNext={() => setOffset((value) => Math.min(MAX_AHEAD, value + 1))}
        note={`Hoje é ${formatDate(now, "dd/MM")}. As próximas cobranças são estimadas pela última de cada assinatura.`}
      />
      <ChargesPanel
        month={month}
        subtitle={`${count === 1 ? "1 assinatura" : `${count} assinaturas`} · ${formatCurrency(month.totalCents)}`}
        note={calendarNote(month)}
        today={offset === 0 ? Number(formatDate(now, "d")) : 0}
      />
    </div>,
  );
}
