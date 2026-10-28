import type { ReactNode } from "react";

import { BankMark } from "@/components/ui/bank-mark";
import type { IconName } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { bankBrand } from "@/lib/banks";
import { cn } from "@/lib/utils";

import { AccessPanel } from "./access-panel";

const sharedData: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "user",
    title: "Dados cadastrais",
    text: "Nome e CPF, para confirmar que a conta é sua",
  },
  { icon: "wallet", title: "Contas", text: "Saldos e extratos dos últimos 12 meses" },
  { icon: "tag", title: "Cartões de crédito", text: "Faturas, limites e lançamentos" },
  { icon: "trending-up", title: "Investimentos", text: "Posições, aplicações e rendimentos" },
];

export type ConsentPeriod = { label: string; value: string }[];

type MalvoConsentProps = {
  banco: { id: string; nome: string };
  title: string;
  subtitle: string;
  intro: string;
  period: ConsentPeriod;
};

function SectionTitle({ children, large }: { children: ReactNode; large?: boolean }) {
  return (
    <h2 className={cn("m-0 font-display leading-[1.25] font-bold", large ? "text-19" : "text-17")}>
      {children}
    </h2>
  );
}

function PeriodList({ period }: { period: ConsentPeriod }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13">
      {period.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-caption">{item.label}</dt>
          <dd className="m-0 font-semibold text-sand">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function HowItWorks({ banco }: { banco: string }) {
  const steps = [
    { titulo: "Você confirma aqui o que será compartilhado", texto: "Agora" },
    { titulo: `Abrimos o app do ${banco}`, texto: "Login com sua senha, só no app do banco" },
    { titulo: `Você autoriza no ${banco} e volta para o Guará`, texto: "Leva cerca de 1 minuto" },
  ];
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {steps.map((step, i) => (
        <li key={step.titulo} className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-13 font-bold",
              i === 0 ? "bg-tucano text-canvas" : "bg-shade text-mist",
            )}
          >
            {i + 1}
          </span>
          <span className="flex flex-col leading-[1.4]">
            <span className="font-semibold">{step.titulo}</span>
            <span className="text-13 text-caption">{step.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function RevokeNote({ banco }: { banco: string }) {
  return (
    <p className="m-0 text-13 leading-[1.55] text-caption">
      Você pode revogar quando quiser em Meu perfil ou no app do {banco}. A ponte com o banco é
      feita por uma instituição autorizada pelo Banco Central, dentro do Open Finance Brasil.
    </p>
  );
}

/** Banco e o texto de abertura. */
export function MalvoConsentHeader({
  banco,
  title,
  subtitle,
  intro,
}: Omit<MalvoConsentProps, "period">) {
  return (
    <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-3">
      {/* Faixa com a cor do banco: dá para ver de relance com qual banco é a conexão. */}
      <div
        className="flex items-center gap-3.5 rounded-card border-l-4 py-1 pl-3.5"
        style={{ borderColor: bankBrand(banco.id).background }}
      >
        <BankMark bank={banco.id} size={58} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="m-0 font-display text-24 leading-[1.2] font-extrabold">{title}</h1>
          <span className="text-14 text-mist">{subtitle}</span>
        </div>
      </div>
      <p className="m-0 text-15 leading-[1.55] text-mist">{intro}</p>
    </div>
  );
}

/**
 * O que o Guará vai ler, por quanto tempo e como funciona a autorização no banco.
 * Celular e tablet: seções em sequência · desktop (`cards`): três cards em duas colunas.
 */
export function MalvoConsentDetails({
  banco,
  period,
  cards,
}: {
  banco: string;
  period: ConsentPeriod;
  cards?: boolean;
}) {
  if (cards) {
    return (
      <div className="grid grid-cols-2 items-stretch gap-5">
        <AccessPanel bank={banco} sees={sharedData} />
        <div className="flex min-w-0 flex-col gap-5">
          <Panel className="gap-3.5 p-6">
            <SectionTitle large>Por quanto tempo</SectionTitle>
            <PeriodList period={period} />
          </Panel>
          <Panel className="grow gap-3.5 p-6">
            <SectionTitle large>Como funciona</SectionTitle>
            <HowItWorks banco={banco} />
            <RevokeNote banco={banco} />
          </Panel>
        </div>
      </div>
    );
  }
  return (
    <>
      <AccessPanel bank={banco} sees={sharedData} />
      <SectionTitle>Por quanto tempo</SectionTitle>
      <PeriodList period={period} />
      <SectionTitle>Como funciona</SectionTitle>
      <HowItWorks banco={banco} />
      <RevokeNote banco={banco} />
    </>
  );
}
