import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { WelcomeOptions } from "@/features/acesso/components/signup-form";
import {
  MataBanner,
  OnboardingIntro,
  OnboardingShell,
} from "@/features/onboarding/components/onboarding-shell";

export default function BoasVindasPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />}>
      <OnboardingIntro title="Bem-vindo ao Guará" titleClassName="text-28 md:text-30 lg:text-34">
        Gastos, investimentos e alertas em um só lugar, com seis assistentes acompanhando tudo para
        você.
      </OnboardingIntro>
      <WelcomeOptions />
      <div className="flex items-start gap-2.5 rounded-tile bg-shade p-3.5 text-14 leading-normal text-mist lg:hidden">
        <span className="text-sand">
          <Icon name="shield" />
        </span>
        Conexão pelo Open Finance Brasil. Nunca pedimos a senha do seu banco.
      </div>
      <p className="m-0 text-center text-15">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-bold text-sand underline">
          Entrar
        </Link>
      </p>
      <p className="m-0 text-center text-13 leading-normal text-caption">
        Ao continuar, você aceita os{" "}
        <Link href="/termos" className="text-mist underline">
          Termos de uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" className="text-mist underline">
          Política de privacidade
        </Link>
        .
      </p>
    </OnboardingShell>
  );
}
