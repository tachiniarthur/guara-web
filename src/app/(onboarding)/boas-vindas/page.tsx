import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FieldLabel, TextInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import {
  MataBanner,
  OnboardingIntro,
  OnboardingShell,
} from "@/features/onboarding/components/onboarding-shell";

export default function BoasVindasPage() {
  return (
    <OnboardingShell mobileTop={<MataBanner variant="mobile" />} centered>
      <OnboardingIntro title="Bem-vindo ao Guará" titleClassName="text-28 md:text-30 lg:text-34">
        Gastos, investimentos e alertas em um só lugar, com seis assistentes acompanhando tudo para
        você.
      </OnboardingIntro>
      <div className="flex flex-col gap-2.5">
        <Button variant="secondary" size="xl" block>
          <span>Continuar com Google</span>
        </Button>
        <Button variant="secondary" size="xl" block>
          <span>Continuar com Apple</span>
        </Button>
      </div>
      <div className="flex items-center gap-3 text-13 text-caption">
        <span className="h-px flex-1 bg-line" />
        ou com e-mail
        <span className="h-px flex-1 bg-line" />
      </div>
      <form className="m-0 flex flex-col gap-3.5">
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <TextInput id="email" type="email" placeholder="voce@exemplo.com" />
        </Field>
        <ButtonLink href="/onboarding/bancos" variant="primary" size="xl" block>
          <span>Criar conta</span>
        </ButtonLink>
      </form>
      <div className="flex items-start gap-2.5 rounded-tile bg-shade p-3.5 text-14 leading-normal text-mist lg:hidden">
        <span className="text-sand">
          <Icon name="shield" />
        </span>
        Conexão pelo Open Finance Brasil. Nunca pedimos a senha do seu banco.
      </div>
      <p className="m-0 text-center text-15">
        Já tem conta?{" "}
        <Link href="/" className="font-bold text-sand underline">
          Entrar
        </Link>
      </p>
      <p className="m-0 text-center text-13 leading-normal text-caption">
        Ao continuar, você aceita os{" "}
        <a href="#" className="text-mist underline">
          Termos de uso
        </a>{" "}
        e a{" "}
        <a href="#" className="text-mist underline">
          Política de privacidade
        </a>
        .
      </p>
    </OnboardingShell>
  );
}
