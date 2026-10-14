import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { banks } from "@/features/onboarding/data";
import {
  bankFromSlug,
  MalvoShell,
  ResultIcon,
  StatusNote,
} from "@/features/onboarding/components/malvo-screens";

export function generateStaticParams() {
  return banks.map((bank) => ({ banco: bank.id }));
}

const found = [
  { label: "Contas", value: "2 · corrente e poupança" },
  { label: "Cartão", value: "1 · Itaú Click" },
  { label: "Investimentos", value: "1 · Tesouro Selic 2029" },
  { label: "Lançamentos de setembro", value: "64 organizados" },
];

export default async function SucessoBancoPage({ params }: { params: Promise<{ banco: string }> }) {
  const { banco } = await params;
  const bank = bankFromSlug(banco);
  const connected = [
    { sigla: "N", nome: "Nubank", quando: "Hoje, 14:30" },
    { sigla: bank.sigla, nome: bank.nome, quando: "Agora" },
  ];
  return (
    <MalvoShell
      desktopWidth="lg:max-w-[67.5rem]"
      className="gap-4 md:gap-6.5 lg:gap-6"
      mobileActions={
        <>
          <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
            <span>Conectar outro</span>
          </ButtonLink>
          <ButtonLink href="/onboarding/perfil/1" variant="primary" size="xl" className="grow">
            <span>Continuar</span>
          </ButtonLink>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-2 text-center lg:pt-0">
        <ResultIcon tone="folha" icon="check" />
        <h1 className="m-0 font-display text-26 font-extrabold lg:text-30">
          {bank.nome} conectado
        </h1>
        <p className="m-0 text-15 leading-[1.55] text-mist">
          Seus dados do {bank.nome} já estão no Guará e vão atualizar sozinhos várias vezes ao dia.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:gap-6.5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-5">
        <Panel className="gap-3.5 p-4.5 lg:p-5.5">
          <PanelHeader
            title="O que encontramos"
            titleClassName="text-17 tracking-normal lg:text-18"
          />
          <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-3 text-13 lg:text-14">
            {found.map((item) => (
              <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption">{item.label}</dt>
                <dd className="m-0 font-semibold text-sand">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel className="gap-3.5 p-4.5 lg:p-5.5">
          <PanelHeader
            title="Bancos conectados"
            subtitle="2 de 3 conexões do plano Completo"
            titleClassName="text-17 tracking-normal lg:text-18"
          />
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {connected.map((item) => (
              <li
                key={item.nome}
                className="flex items-center gap-3 rounded-[1.125rem] border border-line bg-field p-3.5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-[2.875rem] shrink-0 items-center justify-center rounded-xl border border-line bg-canvas font-display text-17 font-bold"
                >
                  {item.sigla}
                </span>
                <span className="flex min-w-0 grow flex-col leading-[1.3]">
                  <strong className="text-16">{item.nome}</strong>
                  <span className="inline-flex items-center gap-1.5 text-13 font-bold text-folha">
                    <span aria-hidden="true" className="size-2 rounded-full bg-folha" />
                    Funcionando
                  </span>
                </span>
                <span className="flex flex-col items-end text-12 leading-[1.4] text-caption">
                  <span>{item.quando}</span>
                  <span>até 23/09/2027</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <StatusNote tone="tucano" icon="copy">
        O Tesouro Selic 2029 do {bank.nome} também está no seu cadastro manual. Vamos perguntar em
        Investimentos se você quer somar ou manter separado.{" "}
        <Link href="/investimentos/duplicidade" className="font-bold text-sand">
          Resolver agora
        </Link>
      </StatusNote>
      <div className="hidden items-center gap-2.5 md:flex">
        <ButtonLink href="/onboarding/bancos" variant="secondary" size="xl">
          <span>Conectar outro banco</span>
        </ButtonLink>
        <div className="grow" />
        <ButtonLink href="/onboarding/perfil/1" variant="primary" size="xl">
          <span>Continuar</span>
        </ButtonLink>
      </div>
    </MalvoShell>
  );
}
