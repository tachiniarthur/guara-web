import Link from "next/link";

import { MobileHeader } from "@/components/layout/mobile-header";
import { ButtonLink } from "@/components/ui/button";
import { MobileActionBar } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";

import type { LegalDoc } from "../data";

const otherLink =
  "inline-flex min-h-6 items-center gap-1 text-14 font-bold whitespace-nowrap text-sand underline hover:text-tucano";

/** Termos de uso e Política de privacidade (abertos a partir da boas-vindas). */
export function LegalPage({ doc, back = "/boas-vindas" }: { doc: LegalDoc; back?: string }) {
  const other = (
    <Link href={doc.outro.href} className={otherLink}>
      {doc.outro.label}
      <Icon name="chevron-right" size={16} />
    </Link>
  );
  return (
    <OnboardingShell
      zoom={1.6}
      desktopWidth="lg:max-w-[72.5rem]"
      tabletWidth="md:w-[40rem]"
      className="gap-3.5 pb-30 md:gap-6.5 lg:gap-5.5"
      mobileTop={<MobileHeader title={doc.titulo} back={back} balanced />}
      mobileActions={
        <MobileActionBar>
          <ButtonLink href={back} variant="secondary" size="xl" block>
            <span>Entendi</span>
          </ButtonLink>
        </MobileActionBar>
      }
    >
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-26 leading-[1.2] font-extrabold md:text-30 lg:text-32">
          {doc.titulo}
        </h1>
        <span className="text-13 text-caption">{doc.versao}</span>
      </div>
      <div className="flex items-start gap-2.5 rounded-[0.875rem] bg-folha-bg px-3.5 py-3 text-13 leading-normal text-sand">
        <span className="mt-px text-folha">
          <Icon name="shield-check" size={16} />
        </span>
        <span>{doc.resumo}</span>
      </div>
      <div className="flex flex-col gap-3.5 md:gap-6.5 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0">
        {doc.secoes.map((secao) => (
          <section
            key={secao.titulo}
            className="flex flex-col gap-1.5 border-t border-line py-3.5 lg:py-4"
          >
            <h2 className="m-0 font-display text-18 font-bold">{secao.titulo}</h2>
            <p className="m-0 text-15 leading-[1.55] text-mist">{secao.texto}</p>
          </section>
        ))}
      </div>
      <div className="flex items-center gap-2.5 lg:hidden">{other}</div>
      <div className="hidden items-center gap-2.5 md:flex">
        <ButtonLink href={back} variant="secondary" size="xl">
          <span>Voltar</span>
        </ButtonLink>
        <div className="hidden grow lg:block" />
        <span className="hidden lg:contents">{other}</span>
      </div>
    </OnboardingShell>
  );
}
