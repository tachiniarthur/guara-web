import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { AgentTip } from "@/components/ui/agent-tip";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, Legend, MobileActionBar, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Note } from "@/components/ui/note";
import { InvestmentTypePicker } from "@/features/investimentos/components/investment-type-picker";
import { PositionPreview } from "@/features/investimentos/components/position-preview";
import { cn } from "@/lib/utils";

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn("justify-end gap-2.5", className)}>
      <ButtonLink
        href="/investimentos"
        variant="ghost"
        size="md"
        className="text-15 hover:bg-transparent"
      >
        <span>Cancelar</span>
      </ButtonLink>
      <ButtonLink href="/investimentos" variant="primary" size="md" className="text-15">
        <Icon name="check" size={18} />
        <span>Salvar investimento</span>
      </ButtonLink>
    </div>
  );
}

export default function AdicionarInvestimentoPage() {
  return (
    <Page
      padding="form"
      className="gap-4 @tab:gap-5 @desk:gap-6"
      header={<MobileHeader title="Adicionar investimento" close="/investimentos" />}
    >
      <Breadcrumb
        className="hidden @tab:flex"
        items={[{ label: "Investimentos", href: "/investimentos" }, { label: "Adicionar" }]}
      />
      <header className="hidden items-end justify-between gap-4 @tab:flex">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em] @desk:text-32">
            Adicionar investimento
          </h1>
          <p className="m-0 hidden text-15 text-mist @desk:block">
            Para o que não vem automaticamente pelo Open Finance
          </p>
        </div>
        <div className="flex items-center gap-2" />
      </header>

      <div className="grid grid-cols-1 gap-4 @tab:gap-5 @desk:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @desk:gap-6">
        <section className="flex min-w-0 flex-col @tab:gap-4 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6 @desk:gap-6 @desk:p-7">
          <form className="m-0 flex flex-col gap-5">
            <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
              <Legend className="mb-2">Tipo</Legend>
              <InvestmentTypePicker />
              <Note icon="home" className="mt-1">
                Imóveis e veículos entram no seu patrimônio total. Para veículos, buscamos o valor
                na Tabela FIPE; para imóveis, você informa o valor estimado e, se houver, o saldo do
                financiamento.
              </Note>
            </fieldset>

            <Field>
              <FieldLabel htmlFor="investimento-ativo">Ativo</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
                  <Icon name="search" />
                </span>
                <TextInput
                  id="investimento-ativo"
                  defaultValue="PETR4"
                  aria-describedby="investimento-ativo-dica"
                  className="pl-11 font-bold"
                />
              </div>
              <span
                id="investimento-ativo-dica"
                className="flex items-center gap-1.5 text-13 text-mist"
              >
                <Icon name="check" size={14} strokeWidth={2.4} className="text-folha" />
                Petrobras PN · cotação às 14:30: R$ 37,82
              </span>
            </Field>

            <div className="grid grid-cols-1 items-start gap-3.5 @tab:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="investimento-quantidade">Quantidade</FieldLabel>
                <TextInput id="investimento-quantidade" defaultValue="200" inputMode="decimal" />
              </Field>
              <Field>
                <FieldLabel htmlFor="investimento-preco">Preço médio de compra</FieldLabel>
                <TextInput id="investimento-preco" defaultValue="R$ 35,10" inputMode="decimal" />
              </Field>
            </div>
            <div className="grid grid-cols-1 items-start gap-3.5 @tab:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="investimento-data">Data da compra</FieldLabel>
                <TextInput id="investimento-data" defaultValue="12/03/2026" />
              </Field>
              <Field>
                <FieldLabel htmlFor="investimento-instituicao">Instituição (opcional)</FieldLabel>
                <TextInput id="investimento-instituicao" placeholder="Ex.: sua corretora" />
              </Field>
            </div>
          </form>
          <Actions className="hidden @desk:flex" />
        </section>

        <div className="flex min-w-0 flex-col gap-4 @tab:gap-5 @desk:gap-4">
          <PositionPreview className="@desk:grow" />
          <AgentTip agent="pacu" className="@desk:order-last">
            Também dá para cadastrar pelo chat. Por exemplo:{" "}
            <em>“comprei 42 cotas de HGLG11 a R$ 158”</em>.
          </AgentTip>
          <Note icon="copy" iconStrokeWidth={1.8}>
            Se este ativo também chegar pelo Open Finance, vamos perguntar se você prefere somar,
            manter separado ou excluir um deles.
          </Note>
          <Actions className="hidden @tab:flex @desk:hidden" />
        </div>
      </div>

      <MobileActionBar>
        <ButtonLink href="/investimentos" variant="primary" size="xl" block>
          <Icon name="check" size={18} />
          <span>Salvar investimento</span>
        </ButtonLink>
      </MobileActionBar>
    </Page>
  );
}
