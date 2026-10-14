import { MobileHeader } from "@/components/layout/mobile-header";
import { DetailHeader, Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListRow, RowList } from "@/components/ui/list-row";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { subscriptions, subscriptionTotals } from "@/features/assinaturas/data";
import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  spotify: "#6DB3EC",
  netflix: "#F2C230",
  amazon: "#FF6A50",
  icloud: "#6CC08E",
};

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
/** Outubro de 2026 começa numa quinta-feira. */
const firstWeekday = 4;
const daysInMonth = 31;

function MonthGrid() {
  return (
    <Panel className="gap-3.5 p-5 @tab:p-6">
      <div className="flex items-center gap-1">
        <IconButton icon="chevron-left" label="Setembro" variant="ghost" />
        <strong className="grow text-center font-display text-20">Outubro de 2026</strong>
        <IconButton icon="chevron-right" label="Novembro" variant="ghost" />
      </div>
      <div role="grid" aria-label="Outubro de 2026" className="grid grid-cols-7 gap-1 @tab:gap-2">
        {weekdays.map((day) => (
          <span key={day} className="text-center text-12 font-bold text-caption">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`vazio-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const charge = subscriptions.find((s) => s.dia === day);
          return (
            <div
              key={day}
              aria-label={charge ? `${day} de outubro: ${charge.nome}, ${charge.valor}` : undefined}
              className={cn(
                "flex min-h-12 flex-col gap-1.5 rounded-[0.875rem] border border-line p-2 @tab:min-h-23 @desk:min-h-30",
                charge ? "bg-shade" : "bg-transparent",
              )}
            >
              <span
                className={cn(
                  "text-13",
                  charge ? "font-extrabold text-sand" : "font-medium text-caption",
                )}
              >
                {day}
              </span>
              {charge && (
                <span className="flex items-center gap-1.5 text-12 font-bold">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: colors[charge.id] }}
                  />
                  <span className="hidden @tab:inline">{charge.nome}</span>
                </span>
              )}
              {charge && (
                <span className="hidden text-12 text-mist tabular-nums @tab:block">
                  {charge.valor}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="m-0 text-12 leading-[1.55] text-caption">
        Hoje é 23/09. O calendário mostra o mês das próximas cobranças.
      </p>
    </Panel>
  );
}

function ChargesPanel() {
  return (
    <Panel className="gap-3.5 p-5.5">
      <PanelHeader
        title="Cobranças de outubro"
        subtitle={`${subscriptions.length} assinaturas · ${subscriptionTotals.mensal}`}
        titleClassName="text-18 tracking-normal"
      />
      <RowList>
        {subscriptions.map((s, i) => (
          <ListRow
            key={s.id}
            href={`/assinaturas/${s.id}`}
            leading={
              <span
                aria-hidden="true"
                className="flex size-[2.375rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-line bg-canvas font-display text-15 font-bold"
              >
                {s.nome.charAt(0)}
              </span>
            }
            title={s.nome}
            meta={`${String(s.dia).padStart(2, "0")}/10 · próxima cobrança`}
            value={s.valor}
            divider={i < subscriptions.length - 1}
          />
        ))}
      </RowList>
      <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-shade px-3.5 py-3 text-13 leading-normal text-sand">
        <span className="mt-px text-mist">
          <Icon name="calendar" size={16} />
        </span>
        <span>
          Todas vencem até o dia 15: R$ 66,80 até o dia 8 (Spotify e Netflix) e R$ 34,80 entre os
          dias 12 e 15 (Amazon Prime e iCloud+). Nenhuma na segunda quinzena.
        </span>
      </div>
    </Panel>
  );
}

export default function CalendarioPage() {
  return (
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
      <DetailHeader title="Calendário de cobranças" subtitle="Outubro de 2026" />
      <div className="flex flex-col gap-4 @tab:gap-5 @desk:grid @desk:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @desk:items-stretch">
        <MonthGrid />
        <ChargesPanel />
      </div>
    </Page>
  );
}
