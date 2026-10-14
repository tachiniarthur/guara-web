import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const sharedData: { icon: IconName; titulo: string; texto: string }[] = [
  {
    icon: "user",
    titulo: "Dados cadastrais",
    texto: "Nome e CPF, para confirmar que a conta é sua",
  },
  { icon: "wallet", titulo: "Contas", texto: "Saldos e extratos dos últimos 12 meses" },
  { icon: "tag", titulo: "Cartões de crédito", texto: "Faturas, limites e lançamentos" },
  { icon: "trending-up", titulo: "Investimentos", texto: "Posições, aplicações e rendimentos" },
];

export type ConsentPeriod = { label: string; value: string }[];

type MalvoConsentProps = {
  banco: { nome: string; sigla: string };
  title: string;
  subtitle: string;
  intro: string;
  period: ConsentPeriod;
};

function BankBadge({ sigla }: { sigla: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-[3.625rem] shrink-0 items-center justify-center rounded-tile border border-line bg-canvas font-display text-22 font-bold"
    >
      {sigla}
    </span>
  );
}

function SectionTitle({ children, large }: { children: ReactNode; large?: boolean }) {
  return (
    <h2 className={cn("m-0 font-display leading-[1.25] font-bold", large ? "text-19" : "text-17")}>
      {children}
    </h2>
  );
}

function SharedList() {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {sharedData.map((item) => (
        <li key={item.titulo} className="flex items-start gap-3 border-b border-line py-2.5">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-folha-bg text-folha"
          >
            <Icon name={item.icon} />
          </span>
          <span className="flex flex-col leading-[1.4]">
            <strong className="text-15">{item.titulo}</strong>
            <span className="text-13 text-mist">{item.texto}</span>
          </span>
        </li>
      ))}
    </ul>
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

function NeverNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-urucum-bg px-3.5 py-3 text-13 leading-normal text-sand">
      <span className="mt-px text-urucum">
        <Icon name="lock" size={16} />
      </span>
      <span>
        <strong>Nunca:</strong> senha do banco, pagamentos, Pix ou transferências. O Guará só lê
        dados.
      </span>
    </div>
  );
}

function HowItWorks({ banco }: { banco: string }) {
  const steps = [
    { titulo: "Você confirma aqui o que será compartilhado", texto: "Agora" },
    { titulo: `O Malvo abre o app do ${banco}`, texto: "Login com sua senha, só no app do banco" },
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
      Você pode revogar quando quiser em Meu perfil ou no app do {banco}. O Malvo é a empresa
      autorizada pelo Banco Central que faz a ponte com o banco.
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
      <div className="flex items-center gap-3.5">
        <BankBadge sigla={banco.sigla} />
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
        <Panel className="gap-3.5 p-6">
          <SectionTitle large>O que será compartilhado</SectionTitle>
          <SharedList />
          <NeverNote />
        </Panel>
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
      <SectionTitle>O que será compartilhado</SectionTitle>
      <SharedList />
      <SectionTitle>Por quanto tempo</SectionTitle>
      <PeriodList period={period} />
      <NeverNote />
      <SectionTitle>Como funciona</SectionTitle>
      <HowItWorks banco={banco} />
      <RevokeNote banco={banco} />
    </>
  );
}
