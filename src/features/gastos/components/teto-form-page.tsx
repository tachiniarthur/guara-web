import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import {
  AmountInput,
  CheckboxRow,
  Field,
  FieldHint,
  FieldLabel,
  Legend,
  MobileActionBar,
  SelectInput,
  StatTile,
  TextInput,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { TetoBar } from "@/features/gastos/components/teto-meter";
import type { TetoMilestone } from "@/features/gastos/data";
import {
  CategoryHistoryChart,
  type MonthValue,
} from "@/features/alertas/components/category-history-chart";

const marcos: TetoMilestone[] = [
  { percentual: 50, rotulo: "500", atingido: true },
  { percentual: 70, rotulo: "700", atingido: true },
  { percentual: 100, rotulo: "teto 1.000", atingido: false },
];

const history: MonthValue[] = [
  { rotulo: "abr", valor: 790 },
  { rotulo: "mai", valor: 860 },
  { rotulo: "jun", valor: 880 },
  { rotulo: "jul", valor: 1020 },
  { rotulo: "ago", valor: 830 },
  { rotulo: "set*", valor: 742, atual: true },
];

const chartLabel =
  "Gastos com alimentação por mês: abril 790, maio 860, junho 880, julho 1.020, agosto 830, setembro até agora 742. Teto novo: 1.000. Média de 3 meses: 910.";

const legend = [
  { label: "Teto novo: R$ 1.000", color: "#F2C230", dashed: true },
  { label: "Média de 3 meses: R$ 910", color: "#93A198", dotted: true },
];

function Legend3({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-2 text-mist ${className ?? ""}`}>
      {legend.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`w-5.5 border-t-2 ${item.dotted ? "border-dotted" : "border-dashed"}`}
            style={{ borderColor: item.color }}
          />
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="size-3 rounded-[3px] bg-urucum" />
        Passou do teto
      </span>
    </div>
  );
}

/** Prévia do teto com os gastos de hoje. */
function PreviewCard({ variant }: { variant: "compact" | "large" }) {
  if (variant === "large") {
    return (
      <section className="flex min-w-0 flex-col gap-4.5 rounded-card border border-line bg-card p-7">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="m-0 font-display text-22 leading-[1.25] font-bold">
            Prévia com seus gastos de hoje
          </h2>
          <span className="text-15 text-mist">
            <strong className="font-display text-26 text-sand tabular-nums">R$ 742,18</strong> de R$
            1.000 · 74%
          </span>
        </div>
        <TetoBar percentual={74.2} estado="atenção" marcos={marcos} size="lg" />
        <p className="m-0 text-16 leading-[1.55] text-mist">
          Você recebe 3 avisos: em R$ 500, em R$ 700 e ao bater o teto de R$ 1.000. Cada um chega
          uma única vez por mês.
        </p>
      </section>
    );
  }
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-card border border-line bg-card p-4 @tab:p-5">
      <span className="text-13 font-bold text-mist">Prévia com seus gastos de hoje</span>
      <TetoBar percentual={74.2} estado="atenção" marcos={marcos} />
      <p className="m-0 text-14 leading-[1.55] text-mist">
        Você recebe 3 avisos: em R$ 500, em R$ 700 e ao bater o teto de R$ 1.000. Cada um chega uma
        única vez por mês
        <span className="@tab:hidden"> e tudo recomeça no dia 1</span>.
      </p>
    </section>
  );
}

/** Histórico da categoria nos últimos 6 meses, com o teto novo. */
function HistoryCard({ variant }: { variant: "desktop" | "tablet" | "mobile" }) {
  const desktop = variant === "desktop";
  const mobile = variant === "mobile";
  return (
    <section
      className={
        desktop
          ? "flex min-w-0 grow flex-col gap-5 rounded-card border border-line bg-card p-7"
          : `flex min-w-0 flex-col gap-4 rounded-card border border-line bg-card ${mobile ? "p-4" : "p-5"}`
      }
    >
      <div className="flex flex-col gap-1">
        <h2
          className={`m-0 font-display leading-[1.25] font-bold ${desktop ? "text-22" : mobile ? "text-17" : "text-18"}`}
        >
          Alimentação nos últimos 6 meses
        </h2>
        <p className={`m-0 text-mist ${desktop ? "text-15" : mobile ? "text-13" : "text-14"}`}>
          Com o teto de R$ 1.000, só julho teria passado do limite.
        </p>
      </div>
      <CategoryHistoryChart
        variant={variant}
        months={history}
        teto={1000}
        media={910}
        label={chartLabel}
      />
      <Legend3 className={desktop ? "text-15" : mobile ? "text-12" : "text-13"} />
      <dl className={`m-0 grid ${mobile ? "grid-cols-2 gap-2" : "grid-cols-3 gap-3"}`}>
        {[
          { label: "Média dos últimos 3 meses", value: "R$ 910", tone: "sand" as const },
          { label: "Maior mês", value: "R$ 1.020 em julho", tone: "urucum" as const },
          { label: "Meses acima do teto", value: "1 de 6", tone: "sand" as const },
        ]
          .sort((a, b) =>
            mobile ? (a.label === "Maior mês" ? 1 : b.label === "Maior mês" ? -1 : 0) : 0,
          )
          .map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
              className={
                mobile
                  ? `px-3.5 py-3 ${stat.label === "Maior mês" ? "col-span-full" : ""}`
                  : undefined
              }
              labelClassName={desktop ? "text-15" : mobile ? "text-12" : "text-13"}
              valueClassName={desktop ? "text-24" : mobile ? "text-17" : "text-19"}
            />
          ))}
      </dl>
      <span className={`text-caption ${desktop ? "text-14" : "text-12"}`}>
        *setembro até o dia 23
      </span>
    </section>
  );
}

function AlertInputs() {
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
      <Legend className="@desk:text-17">
        Avisos antes do teto <span className="font-normal text-caption">(opcional)</span>
      </Legend>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {["R$ 500,00", "R$ 700,00"].map((valor, i) => (
          <li key={valor} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-7.5 shrink-0 items-center justify-center rounded-full border border-line-strong text-13 font-bold text-mist @desk:size-9 @desk:text-15"
            >
              {i + 1}
            </span>
            <label htmlFor={`aviso-${i + 1}`} className="sr-only">
              Aviso {i + 1}, valor
            </label>
            <TextInput
              id={`aviso-${i + 1}`}
              inputMode="decimal"
              defaultValue={valor}
              className="h-12 tabular-nums @desk:h-14 @desk:text-18"
            />
            <IconButton icon="trash" label={`Remover aviso ${i + 1}`} variant="ghost" />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="flex h-12 items-center justify-center gap-2 rounded-full border border-dashed border-line-strong bg-transparent text-15 font-bold"
      >
        <Icon name="plus" size={18} />
        Adicionar aviso
      </button>
    </fieldset>
  );
}

const copy = {
  novo: {
    header: "Novo teto de gasto",
    crumbs: [{ label: "Alertas", href: "/alertas" }, { label: "Novo teto" }],
    title: "Quanto você quer gastar, no máximo?",
    submit: "Salvar teto",
    close: "/alertas",
  },
  editar: {
    header: "Editar teto",
    crumbs: [{ label: "Tetos de gasto", href: "/alertas/tetos" }, { label: "Editar teto" }],
    title: "Editar teto de Alimentação",
    submit: "Salvar alterações",
    close: "/alertas/tetos/alimentacao",
  },
};

/** Formulário de teto (novo ou edição): categoria, valor, avisos no caminho e a prévia. */
export function TetoFormPage({ mode = "novo" }: { mode?: keyof typeof copy }) {
  const text = copy[mode];
  return (
    <Page
      padding="form"
      zoom={1.4}
      paddingClassName="pt-2 pb-27.5"
      className="gap-5 @desk:gap-6"
      header={<MobileHeader title={text.header} close={text.close} />}
    >
      <Breadcrumb className="hidden @tab:flex" items={text.crumbs} />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            {text.title}
          </h1>
        </div>
        <div className="flex items-center gap-2" />
      </header>

      <div className="grid grid-cols-1 gap-5 @desk:grid-cols-2 @desk:gap-6">
        <section className="flex min-w-0 flex-col gap-5.5 @tab:gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-6 @desk:p-8">
          <form className="m-0 flex flex-col gap-5.5 @desk:gap-7.5">
            <div className="flex flex-col gap-1 @tab:hidden">
              <h1 className="m-0 font-display text-24 leading-[1.25] font-bold tracking-[-0.01em]">
                {text.title}
              </h1>
              <p className="m-0 text-14 text-mist">
                Vale para crédito e débito de todos os bancos conectados.
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-5.5 @tab:grid-cols-2 @tab:gap-3.5 @desk:gap-5">
              <Field>
                <FieldLabel htmlFor="teto-categoria" className="@desk:text-17">
                  Categoria
                </FieldLabel>
                <SelectInput
                  id="teto-categoria"
                  className="text-17 @max-tab:pr-3.5 @tab:text-16 @desk:h-15 @desk:text-18"
                  chevronClassName="hidden @tab:block @desk:top-5 @desk:right-4"
                >
                  <option>Alimentação</option>
                </SelectInput>
              </Field>
              <Field>
                <FieldLabel htmlFor="teto-periodo" className="@desk:text-17">
                  Período
                </FieldLabel>
                <SelectInput
                  id="teto-periodo"
                  className="text-17 @max-tab:pr-3.5 @tab:text-16 @desk:h-15 @desk:text-18"
                  chevronClassName="hidden @tab:block @desk:top-5 @desk:right-4"
                >
                  <option>Mensal, recomeça todo dia 1</option>
                </SelectInput>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="teto-valor" className="@desk:text-17">
                <span className="@tab:hidden">Teto mensal</span>
                <span className="hidden @tab:inline">Teto</span>
              </FieldLabel>
              <AmountInput
                id="teto-valor"
                defaultValue="R$ 1.000,00"
                aria-describedby="teto-valor-dica"
                className="h-16 text-30 @tab:rounded-tile @tab:text-28 @desk:h-21 @desk:text-44"
              />
              <FieldHint id="teto-valor-dica" className="@desk:text-15">
                Sua média nos últimos 3 meses: R$ 910
                <span className="hidden @tab:inline">. Vale para crédito e débito.</span>
              </FieldHint>
            </Field>

            <AlertInputs />

            <div className="flex flex-col gap-5.5 @tab:hidden">
              <PreviewCard variant="compact" />
              <HistoryCard variant="mobile" />
            </div>

            <fieldset className="m-0 flex flex-col gap-1 border-none p-0 @tab:gap-0">
              <Legend className="@desk:text-17">Onde avisar</Legend>
              <div className="@tab:hidden">
                <CheckboxRow
                  id="teto-push-m"
                  label="Notificação no celular"
                  description="Chega na hora"
                  defaultChecked
                  accent="tucano"
                  labelClassName="font-bold"
                />
                <CheckboxRow
                  id="teto-mail-m"
                  label="E-mail"
                  description="arthur@exemplo.com"
                  defaultChecked
                  accent="tucano"
                  labelClassName="font-bold"
                  className="mt-1"
                />
              </div>
              <div className="hidden @tab:block">
                <CheckboxRow
                  id="teto-push"
                  label="Notificação no celular"
                  defaultChecked
                  labelClassName="@desk:text-17"
                />
                <CheckboxRow
                  id="teto-mail"
                  label="E-mail"
                  defaultChecked
                  labelClassName="@desk:text-17"
                />
              </div>
            </fieldset>
          </form>

          <div className="hidden justify-end gap-2.5 @desk:flex">
            <ButtonLink href="/alertas" variant="ghost" size="2xl" className="hover:bg-transparent">
              <span>Cancelar</span>
            </ButtonLink>
            <ButtonLink href="/alertas" variant="primary" size="2xl">
              <Icon name="check" size={18} />
              <span>{text.submit}</span>
            </ButtonLink>
          </div>
        </section>

        <div className="hidden min-w-0 flex-col gap-5 @tab:flex @desk:gap-4">
          <div className="@desk:hidden">
            <PreviewCard variant="compact" />
          </div>
          <div className="hidden @desk:block">
            <PreviewCard variant="large" />
          </div>
          <div className="@desk:hidden">
            <HistoryCard variant="tablet" />
          </div>
          <div className="hidden grow flex-col @desk:flex">
            <HistoryCard variant="desktop" />
          </div>
          <div className="flex justify-end gap-2.5 @desk:hidden">
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
              <span>{text.submit}</span>
            </ButtonLink>
          </div>
        </div>
      </div>

      <MobileActionBar>
        <ButtonLink href="/alertas" variant="primary" size="xl" block className="text-16">
          <Icon name="check" size={18} />
          <span>{text.submit}</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
