import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { PrivacyToggle } from "@/components/layout/privacy-toggle";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CardBody, WhenHasData, WhenNoData } from "@/components/states/screen-state-context";
import { StateBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";

import { summary } from "../data";
import { CashFlowChart, CashFlowLegend } from "./cash-flow-chart";

function RowMarker({ id }: { id: (typeof summary.linhas)[number]["id"] }) {
  if (id === "entradas")
    return (
      <Icon name="arrow-down-left" size={22} strokeWidth={2.2} className="ml-[3px] text-arara" />
    );
  if (id === "saidas")
    return (
      <Icon name="arrow-up-right" size={22} strokeWidth={2.2} className="ml-[3px] text-[#E0935A]" />
    );
  return <span aria-hidden="true" className="ml-1.75 size-3.5 rounded-full border-3 border-sand" />;
}

const noBank = (
  <StateBlock
    icon="bank"
    title="Nenhum banco conectado"
    action={
      <ButtonLink href="/onboarding/bancos" variant="forest" size="md" className="text-15">
        <span>Conectar banco</span>
      </ButtonLink>
    }
  >
    Conecte um banco pela Malvo para ver saldo, entradas e saídas do mês. O Guará só lê os dados.
  </StateBlock>
);

/**
 * Saldo consolidado, entradas/saídas/sobra e o gráfico do mês, com curvas de nível ao fundo.
 * Sem dados (erro, vazio), fica só o título do gráfico e o aviso.
 */
export function SummaryCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <WhenNoData>
        <CardHeader title="Entradas e saídas" />
      </WhenNoData>
      <WhenHasData>
        {/* eslint-disable-next-line @next/next/no-img-element -- curvas de nível decorativas */}
        <img
          src="/images/marca/curvas-de-nivel.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -left-6 z-0 block h-[21.25rem] w-[28.75rem] max-w-none"
        />
      </WhenHasData>
      <CardBody main={noBank} className="relative z-1 grow">
        <div className="relative z-1 flex min-h-0 grow flex-col gap-5 @desk:flex-row @desk:gap-6">
          <div className="flex w-full shrink-0 flex-col gap-3.5 @desk:w-[20.625rem]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-14 text-mist">{summary.saldoRotulo}</span>
                <span className="font-display text-38 leading-none font-extrabold tracking-[-0.02em] whitespace-nowrap tabular-nums">
                  {summary.saldo}
                </span>
              </div>
              <PrivacyToggle />
            </div>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {summary.linhas.map((linha) => (
                <li
                  key={linha.id}
                  className="grid min-h-10 grid-cols-[1.75rem_1fr_auto] items-center gap-2.5"
                >
                  <RowMarker id={linha.id} />
                  <span className="flex flex-col leading-[1.25]">
                    <span className="text-15 font-semibold">{linha.rotulo}</span>
                  </span>
                  <span className="flex flex-col items-end leading-[1.25]">
                    <strong className="text-17 tabular-nums">{linha.valor}</strong>
                    <span className="text-12 font-bold text-folha">{linha.variacao}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 grow flex-col gap-2 border-t border-line pt-4.5 @desk:border-t-0 @desk:border-l @desk:pt-0 @desk:pl-6">
            <CardHeader
              title="Entradas e saídas"
              action={
                <SegmentedControl
                  label="Período do gráfico"
                  size="sm"
                  options={[
                    { value: "mes", label: "Mês" },
                    { value: "ano", label: "Ano" },
                  ]}
                />
              }
            />
            <div className="shrink-0">
              <div className="@tab:hidden">
                <CashFlowChart variant="compact" />
              </div>
              <div className="hidden @tab:block">
                <CashFlowChart variant="wide" />
              </div>
            </div>
            <div className="@tab:hidden">
              <CashFlowLegend />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
