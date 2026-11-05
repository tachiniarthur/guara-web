"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { AuthIntro } from "@/features/acesso/components/auth-parts";
import { CpfField, PhoneField } from "@/features/acesso/components/fields";
import { useSession } from "@/features/acesso/session";
import { useMe, useSetCpf, useSetPhone } from "@/features/perfil/api";
import { ApiError } from "@/lib/api";
import { cpfProblem } from "@/lib/cpf";
import { phoneProblem } from "@/lib/phone";

import { LeaveOnboardingLink } from "./leave-onboarding";

/**
 * Primeira etapa do onboarding para quem ainda não informou o CPF ou o celular (entrada com Google
 * ou Apple; o cadastro com e-mail já pede os dois). Pede só o que falta; com tudo na conta, ou no
 * protótipo, vai direto para o plano.
 */
export function CpfStep() {
  const router = useRouter();
  const { live } = useSession();
  const me = useMe({ enabled: live });
  const setCpf = useSetCpf();
  const setPhone = useSetPhone();
  const [cpf, setCpfValue] = useState("");
  const [phone, setPhoneValue] = useState("");
  const [errors, setErrors] = useState<{ cpf?: string | null; phone?: string | null }>({});

  const missingCpf = !me.data?.cpfMasked;
  // `undefined` é a API antiga, que ainda não guarda o celular: aí não pede.
  const missingPhone = me.data?.phone === null;
  const skip = !live || (me.isSuccess && !missingCpf && !missingPhone);
  useEffect(() => {
    if (skip) router.replace("/onboarding/plano");
  }, [skip, router]);

  // Enquanto descobre o que falta: só o anel, no meio do espaço da etapa (sem o "Voltar").
  if (skip || me.isPending) {
    return (
      <div className="flex min-h-48 grow items-center justify-center">
        <Spinner size={44} />
      </div>
    );
  }

  const pending = setCpf.isPending || setPhone.isPending;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = {
      cpf: missingCpf ? cpfProblem(cpf) : null,
      phone: missingPhone ? phoneProblem(phone) : null,
    };
    setErrors(found);
    if (found.cpf || found.phone) return;
    try {
      if (missingPhone) await setPhone.mutateAsync(phone);
    } catch {
      return setErrors({
        phone: "Não deu para salvar o celular agora. Tente de novo em instantes.",
      });
    }
    try {
      if (missingCpf) await setCpf.mutateAsync(cpf);
    } catch (failure) {
      return setErrors({
        cpf:
          failure instanceof ApiError && failure.code === "cpf_already_registered"
            ? "Esse CPF já tem uma conta no Guará. Entre nela com o e-mail ou o CPF e a senha."
            : "Não deu para salvar o CPF agora. Tente de novo em instantes.",
      });
    }
    router.replace("/onboarding/plano");
  }

  return (
    <>
      <LeaveOnboardingLink />
      <AuthIntro
        title={
          missingCpf && missingPhone
            ? "Informe seu CPF e celular"
            : missingCpf
              ? "Informe seu CPF"
              : "Informe seu celular"
        }
      >
        {missingCpf
          ? "O CPF identifica você no Guará e vale para entrar na conta depois, junto com a senha."
          : "Usamos o celular para avisos importantes da sua conta."}
      </AuthIntro>
      <form className="m-0 flex flex-col gap-3.5" onSubmit={submit} noValidate>
        {missingCpf && (
          <CpfField
            id="cpf-etapa"
            label="CPF"
            value={cpf}
            onValueChange={(value) => {
              setCpfValue(value);
              setErrors((all) => ({ ...all, cpf: null }));
            }}
            error={errors.cpf}
          />
        )}
        {missingPhone && (
          <PhoneField
            id="celular-etapa"
            label="Celular"
            value={phone}
            onValueChange={(value) => {
              setPhoneValue(value);
              setErrors((all) => ({ ...all, phone: null }));
            }}
            error={errors.phone}
            hint="Com DDD. Usado para avisos importantes da sua conta."
          />
        )}
        <Button type="submit" variant="primary" size="xl" block disabled={pending}>
          <span>{pending ? "Salvando…" : "Continuar"}</span>
        </Button>
        {missingCpf && (
          <p className="m-0 flex items-start gap-2 text-13 leading-[1.55] text-caption">
            <Icon name="shield" size={16} />
            <span>
              Guardamos o CPF criptografado e nunca o mostramos por inteiro. Não dá para trocar
              depois. Para entrar também com e-mail e senha, crie uma senha em Meu perfil quando
              quiser.
            </span>
          </p>
        )}
      </form>
    </>
  );
}
