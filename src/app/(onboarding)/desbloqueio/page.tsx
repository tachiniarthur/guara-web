import Link from "next/link";
import type { CSSProperties } from "react";

import { BrandLogo } from "@/components/layout/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OnboardingAside } from "@/features/onboarding/components/onboarding-shell";
import { user } from "@/features/usuario/data";

/** Tela de desbloqueio com biometria (Face ID no celular e tablet, Touch ID no computador). */
function Unlock({ desktop }: { desktop?: boolean }) {
  const method = desktop ? "Touch ID" : "Face ID";
  return (
    <>
      <div className="flex flex-col items-center gap-4.5 text-center">
        <BrandLogo size={88} className="shadow-[0_0_0_1px_rgba(242,239,230,.25)]" />
        <h1 className="m-0 font-display text-30 font-extrabold">Olá, {user.nome}</h1>
        <p className="m-0 text-15 leading-[1.55] text-mist">
          O Guará está bloqueado para proteger seus dados.
        </p>
        <Link
          href="/"
          aria-label={`Desbloquear com ${method}`}
          className="flex size-28 items-center justify-center rounded-[2rem] border border-line-strong bg-card text-tucano"
        >
          <Icon name={desktop ? "fingerprint" : "face-id"} size={56} strokeWidth={1.4} />
        </Link>
        <strong className="text-16">Toque para usar o {method}</strong>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Button variant="secondary" size="xl" block>
          <span>Usar a senha do {desktop ? "computador" : "aparelho"}</span>
        </Button>
        <ButtonLink href="/boas-vindas" variant="ghost" size="lg" block>
          <span>Sair da conta</span>
        </ButtonLink>
      </div>
      <p className="m-0 text-center text-13 leading-[1.55] text-caption">
        O bloqueio volta sempre que o app fica mais de 1 minuto em segundo plano. Você muda isso em
        Meu perfil › Segurança.
      </p>
    </>
  );
}

export default function DesbloqueioPage() {
  return (
    <>
      <div className="relative flex min-h-dvh flex-col lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- textura decorativa */}
        <img
          src="/images/marca/faixa-tucano.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-x-0 top-0 block h-[46%] w-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[46%] bg-[linear-gradient(180deg,rgba(11,17,14,.25)_0%,#0B110E_100%)]"
        />
        <main className="relative flex grow flex-col justify-center gap-7 px-6 pt-24 pb-10 md:items-center md:px-0 md:py-30">
          <div className="flex flex-col gap-7 md:w-[27.5rem]">
            <Unlock />
          </div>
        </main>
      </div>
      <div className="hidden h-dvh lg:flex">
        <OnboardingAside />
        <main className="flex grow flex-col items-center overflow-y-auto px-20 py-16">
          <div
            className="my-auto flex w-full max-w-[32.5rem] zoom-area flex-col gap-7"
            style={{ "--zoom": 1.6 } as CSSProperties}
          >
            <Unlock desktop />
          </div>
        </main>
      </div>
    </>
  );
}
