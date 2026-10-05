import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { chipClass } from "@/components/ui/chip";
import {
  AmountInput,
  CheckboxRow,
  Field,
  FieldHint,
  FieldLabel,
  Legend,
  MobileActionBar,
  StatTile,
  TextInput,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { PriceHistoryChart } from "@/features/alertas/components/price-history-chart";
import { cn } from "@/lib/utils";

const prices = [
  560000, 576900, 575500, 577800, 595600, 602800, 593900, 595800, 607000, 600900, 586200, 587800,
  591400, 576600, 564000, 569700, 569900, 555700, 553600, 566600, 567400, 560500, 571600, 589400,
  590400, 591000, 609800, 624200, 620800, 615200,
];

const ticks = [
  { index: 0, label: "24 ago" },
  { index: 8, label: "1 set" },
  { index: 15, label: "8 set" },
  { index: 22, label: "15 set" },
  { index: 29, label: "hoje" },
];

const chartLabel =
  "Bitcoin nos últimos 30 dias: mínima de R$ 553,6 mil, máxima de R$ 624,2 mil, agora R$ 615,2 mil. Alerta de venda em R$ 650 mil, 5,4% acima.";

const stats = [
  { label: "Preço agora", value: "R$ 615.200", tone: "sand" as const },
  { label: "Máxima em 30 dias", value: "R$ 624.200", tone: "sand" as const },
  { label: "Mínima em 30 dias", value: "R$ 553.600", tone: "sand" as const },
  { label: "Falta para o alerta", value: "+5,4%", tone: "urucum" as const },
];

function AlertTypeOption({
  id,
  direction,
  checked,
}: {
  id: string;
  direction: "compra" | "venda";
  checked?: boolean;
}) {
  const venda = direction === "venda";
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-16 items-center gap-3 rounded-bubble px-3.5 py-2.5 @desk:min-h-20",
        checked ? "border-2 border-urucum bg-urucum-bg" : "border border-line-strong bg-field",
      )}
    >
      <input
        id={id}
        type="radio"
        name="tipo-alerta"
        defaultChecked={checked}
        className={cn(
          "m-0 size-5.5 shrink-0 @desk:size-6",
          venda ? "accent-tucano" : "accent-folha",
        )}
      />
      <span className="flex grow flex-col leading-[1.35]">
        <span
          className={cn(
            "flex items-center gap-1.5 font-bold",
            venda ? "text-urucum" : "text-folha",
          )}
        >
          <Icon name={venda ? "arrow-up" : "arrow-down"} size={16} strokeWidth={2.2} />
          {venda ? "VENDA" : "COMPRA"}
        </span>
        <span className="text-13 text-mist @desk:text-15">
          Avise quando o preço {venda ? "subir" : "cair"} até
        </span>
      </span>
    </label>
  );
}

function MarketCard({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const desktop = variant === "desktop";
  const mobile = variant === "mobile";
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4.5 rounded-card border border-line bg-card",
        desktop ? "p-7" : mobile ? "p-4" : "p-5",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          className={cn(
            "m-0 font-display leading-[1.25] font-bold",
            desktop ? "text-22" : mobile ? "text-17" : "text-18",
          )}
        >
          Bitcoin nos últimos 30 dias
        </h2>
        <span className={cn("text-mist", desktop ? "text-16" : "text-14")}>Cotação às 14:30</span>
      </div>
      <PriceHistoryChart
        variant={variant}
        prices={prices}
        low={550000}
        alert={650000}
        ticks={ticks}
        label={chartLabel}
      />
      <dl className={cn("m-0 grid gap-3", variant === "tablet" ? "grid-cols-4" : "grid-cols-2")}>
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            labelClassName={desktop ? "text-15" : "text-12"}
            valueClassName={desktop ? "text-24" : mobile ? "text-17" : "text-18"}
          />
        ))}
      </dl>
      <AgentTip agent="caramelo" className={desktop ? "[&_p]:text-16" : undefined}>
        Acompanhamos o preço a cada atualização e avisamos uma única vez quando o valor for
        atingido. Depois você decide se renova o alerta.
      </AgentTip>
    </section>
  );
}

export default function NovoAlertaPrecoPage() {
  return (
    <Page
      padding="form"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Novo alerta de preço" close="/alertas" />}
    >
      <Breadcrumb
        className="hidden @tab:flex"
        items={[{ label: "Alertas", href: "/alertas" }, { label: "Novo alerta de preço" }]}
      />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Novo alerta de preço
          </h1>
        </div>
        <div className="flex items-center gap-2" />
      </header>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-2 @desk:gap-6">
        <section className="flex min-w-0 flex-col gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-6 @desk:p-8">
          <form className="m-0 flex flex-col gap-5.5 @desk:gap-7.5">
            <Field>
              <FieldLabel htmlFor="alerta-ativo" className="@desk:text-17">
                Ativo
              </FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption @desk:top-[1.1875rem] @desk:left-4">
                  <Icon name="search" />
                </span>
                <TextInput
                  id="alerta-ativo"
                  defaultValue="Bitcoin (BTC)"
                  className="pl-11 font-bold @desk:h-15 @desk:text-18"
                />
              </div>
              <span className="text-13 text-mist @desk:text-15">Cotação às 14:30: R$ 615.200</span>
            </Field>

            <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
              <Legend className="@desk:text-17">Tipo de alerta</Legend>
              <div className="grid grid-cols-1 items-start gap-2.5 @tab:grid-cols-2">
                <AlertTypeOption id="tipo-compra" direction="compra" />
                <AlertTypeOption id="tipo-venda" direction="venda" checked />
              </div>
            </fieldset>

            <Field>
              <FieldLabel htmlFor="alerta-gatilho" className="@desk:text-17">
                Valor-gatilho
              </FieldLabel>
              <AmountInput
                id="alerta-gatilho"
                defaultValue="R$ 650.000,00"
                aria-describedby="alerta-gatilho-dica"
                className="h-16 rounded-tile text-28 @desk:h-20 @desk:text-40"
              />
              <FieldHint id="alerta-gatilho-dica" className="@desk:text-15">
                5,4% acima do preço atual
              </FieldHint>
            </Field>

            <div role="group" aria-label="Atalhos de valor" className="flex gap-2">
              {["+5%", "+10%", "+20%"].map((atalho) => (
                <button
                  key={atalho}
                  type="button"
                  aria-pressed="false"
                  className={cn(chipClass(false), "@desk:h-11 @desk:text-17")}
                >
                  {atalho}
                </button>
              ))}
            </div>

            <fieldset className="m-0 flex flex-col border-none p-0">
              <Legend className="@desk:text-17">Onde avisar</Legend>
              <CheckboxRow
                id="alerta-push"
                label="Notificação no celular"
                defaultChecked
                className="@desk:min-h-15"
                labelClassName="@desk:text-17"
              />
              <CheckboxRow
                id="alerta-mail"
                label="E-mail"
                defaultChecked
                className="@desk:min-h-15"
                labelClassName="@desk:text-17"
              />
            </fieldset>
          </form>

          <div className="hidden justify-end gap-2.5 @desk:flex">
            <ButtonLink
              href="/alertas"
              variant="ghost"
              size="xl"
              className="text-17 hover:bg-transparent"
            >
              <span>Cancelar</span>
            </ButtonLink>
            <ButtonLink href="/alertas" variant="primary" size="xl" className="text-17">
              <Icon name="check" size={18} />
              <span>Criar alerta</span>
            </ButtonLink>
          </div>
        </section>

        <div className="@tab:hidden">
          <MarketCard variant="mobile" />
        </div>
        <div className="hidden flex-col gap-5 @tab:flex @desk:hidden">
          <MarketCard variant="tablet" />
          <div className="flex justify-end gap-2.5">
            <ButtonLink
              href="/alertas"
              variant="ghost"
              size="md"
              className="text-15 hover:bg-transparent"
            >
              <span>Cancelar</span>
            </ButtonLink>
            <ButtonLink href="/alertas" variant="primary" size="md" className="text-15">
              <Icon name="check" size={18} />
              <span>Criar alerta</span>
            </ButtonLink>
          </div>
        </div>
        <div className="hidden @desk:block">
          <MarketCard variant="desktop" />
        </div>
      </div>

      <MobileActionBar>
        <ButtonLink href="/alertas" variant="primary" size="xl" block>
          <Icon name="check" size={18} />
          <span>Criar alerta</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
