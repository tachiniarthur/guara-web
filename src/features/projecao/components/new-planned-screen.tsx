"use client";

import { useRouter } from "next/navigation";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Page } from "@/components/layout/page";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";

import { usePlannedMutations } from "../api";
import { PlannedExpenseForm } from "./planned-expense-form";

const FORM_ID = "novo-gasto-futuro";

/**
 * Cadastrar um gasto futuro: nome, valor por mês e até quando vai (ex.: parcela do carro até
 * 2031). Ele passa a contar na previsão dos próximos meses de Gastos. Sem login (protótipo), nada
 * é salvo.
 */
export function NewPlannedScreen() {
  const router = useRouter();
  const { create } = usePlannedMutations();
  const problem = create.error
    ? create.error instanceof ApiError
      ? create.error.message
      : "Não deu para salvar o gasto futuro."
    : null;

  const submitLabel = create.isPending ? "Salvando…" : "Salvar gasto futuro";
  return (
    <Page
      padding="form"
      paddingClassName="pt-2 pb-27.5"
      className="gap-5 @desk:gap-6"
      header={<MobileHeader title="Novo gasto futuro" close="/gastos/futuros" />}
    >
      <Breadcrumb
        className="hidden flex-wrap @tab:flex"
        items={[
          { label: "Gastos", href: "/gastos" },
          { label: "Gastos futuros", href: "/gastos/futuros" },
          { label: "Novo gasto futuro" },
        ]}
      />
      <header className="hidden flex-col gap-1.5 @tab:flex">
        <h1 className="m-0 font-display text-28 leading-[1.15] font-extrabold tracking-[-0.01em]">
          Que gasto vem por aí?
        </h1>
        <p className="m-0 text-15 text-mist">
          Parcelas, aluguel, mensalidades: o que você já sabe que vai pagar nos próximos meses.
        </p>
      </header>

      <section className="flex w-full min-w-0 flex-col gap-5 @tab:rounded-card @tab:border @tab:border-line @tab:bg-card @tab:p-6">
        <h1 className="m-0 font-display text-24 leading-[1.25] font-bold @tab:hidden">
          Que gasto vem por aí?
        </h1>
        <PlannedExpenseForm
          formId={FORM_ID}
          problem={problem}
          onSubmit={(input) => {
            create.mutate(input, { onSuccess: () => router.push("/gastos/futuros") });
          }}
          actions={
            <div className="hidden justify-end gap-2.5 @tab:flex">
              <ButtonLink href="/gastos/futuros" variant="ghost" size="lg">
                <span>Cancelar</span>
              </ButtonLink>
              <Button type="submit" variant="primary" size="lg" disabled={create.isPending}>
                <Icon name="check" size={18} />
                <span>{submitLabel}</span>
              </Button>
            </div>
          }
        />
      </section>

      <MobileActionBar>
        <Button
          type="submit"
          form={FORM_ID}
          variant="primary"
          size="xl"
          block
          className="text-16"
          disabled={create.isPending}
        >
          <Icon name="check" size={18} />
          <span>{submitLabel}</span>
        </Button>
      </MobileActionBar>
    </Page>
  );
}
