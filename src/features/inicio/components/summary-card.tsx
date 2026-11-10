import { Card, CardHeader } from "@/components/ui/card";
import { ChartFit } from "@/components/charts/chart-fit";
import { Icon } from "@/components/ui/icon";
import { PrivacyToggle } from "@/components/layout/privacy-toggle";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CardBody, WhenNoData } from "@/components/states/screen-state-context";
import { StateBlock } from "@/components/states/state-block";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  cashFlow as prototypeCashFlow,
  summary as prototypeSummary,
  type CashFlowData,
} from "../data";
import { CashFlowChart, CashFlowLegend } from "./cash-flow-chart";

function RowMarker({ id }: { id: SummaryData["linhas"][number]["id"] }) {
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
    Conecte um banco pelo Open Finance para ver saldo, entradas e saídas do mês. O Guará só lê os
    dados.
  </StateBlock>
);

/**
 * Saldo consolidado, entradas/saídas/sobra e o gráfico do mês, com curvas de nível ao fundo.
 * Sem dados (erro, vazio), fica só o título do gráfico e o aviso.
 */
export type SummaryData = {
  saldo: string;
  saldoRotulo: string;
  linhas: readonly {
    id: "entradas" | "saidas" | "sobrou";
    rotulo: string;
    valor: string;
    variacao: string;
  }[];
};

export function SummaryCard({
  className,
  summary = prototypeSummary,
  cashFlow = prototypeCashFlow,
}: {
  className?: string;
  summary?: SummaryData;
  cashFlow?: CashFlowData;
}) {
  return (
    // O card é o container: lado a lado só quando ELE é largo (o bloco pode estar em metade da
    // largura num desktop); estreito, o gráfico vai para baixo do saldo.
    <Card className={cn("@container", className)}>
      <WhenNoData>
        <CardHeader title="Entradas e saídas" />
      </WhenNoData>
      <CardBody main={noBank} className="relative z-1 grow">
        <div className="relative z-1 flex min-h-0 grow flex-col gap-5 @min-[48rem]:flex-row @min-[48rem]:gap-6">
          {/*
            Coluna do saldo: acompanha o card (largura proporcional, conteúdo no meio da altura) e
            leva junto as curvas de nível, inteiras e esmaecidas em círculo, sem borda reta.
          */}
          <div className="relative isolate flex w-full shrink-0 flex-col justify-center gap-3.5 @min-[48rem]:w-[clamp(20.625rem,32%,27rem)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -inset-y-8 -z-10 flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- desenho decorativo */}
              <img
                src="/images/marca/curvas-de-nivel.svg"
                alt=""
                className="block w-full max-w-[28.75rem] [mask-image:radial-gradient(closest-side,#000_55%,transparent)]"
              />
            </div>
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
          <div className="flex min-w-0 grow flex-col gap-2 border-t border-line pt-4.5 @min-[48rem]:border-t-0 @min-[48rem]:border-l @min-[48rem]:pt-0 @min-[48rem]:pl-6">
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
            <ChartFit
              className="grow"
              narrow={
                <div className="flex grow flex-col gap-3">
                  <CashFlowChart variant="compact" data={cashFlow} />
                  <CashFlowLegend data={cashFlow} />
                </div>
              }
              wide={<CashFlowChart variant="wide" data={cashFlow} />}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
