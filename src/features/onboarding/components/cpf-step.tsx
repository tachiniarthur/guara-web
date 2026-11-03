"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CpfField } from "@/features/acesso/components/fields";
import { useSession } from "@/features/acesso/session";
import { useMe, useSetCpf } from "@/features/perfil/api";
import { ApiError } from "@/lib/api";
import { cpfProblem } from "@/lib/cpf";

/**
 * Primeira etapa do onboarding para quem ainda não informou o CPF (entrada com Google ou Apple;
 * o cadastro com e-mail já pede). Com o CPF na conta, ou no protótipo, vai direto para o plano.
 */
export function CpfStep() {
  const router = useRouter();
  const { live } = useSession();
  const me = useMe({ enabled: live });
  const setCpf = useSetCpf();
  const [cpf, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const skip = !live || Boolean(me.data?.cpfMasked);
  useEffect(() => {
    if (skip) router.replace("/onboarding/plano");
  }, [skip, router]);

  if (skip || me.isPending) {
    return (
      <p role="status" className="m-0 text-14 text-mist">
        Carregando…
      </p>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = cpfProblem(cpf);
    if (problem) return setError(problem);
    setError(null);
    setCpf.mutate(cpf, {
      onSuccess: () => router.replace("/onboarding/plano"),
      onError: (failure) =>
        setError(
          failure instanceof ApiError && failure.code === "cpf_already_registered"
            ? "Esse CPF já tem uma conta no Guará. Entre nela com o e-mail ou o CPF e a senha."
            : "Não deu para salvar o CPF agora. Tente de novo em instantes.",
        ),
    });
  }

  return (
    <form className="m-0 flex flex-col gap-3.5" onSubmit={submit} noValidate>
      <CpfField
        id="cpf-etapa"
        label="CPF"
        value={cpf}
        onValueChange={(value) => {
          setValue(value);
          setError(null);
        }}
        error={error}
      />
      <Button type="submit" variant="primary" size="xl" block disabled={setCpf.isPending}>
        <span>{setCpf.isPending ? "Salvando…" : "Continuar"}</span>
      </Button>
      <p className="m-0 flex items-start gap-2 text-13 leading-[1.55] text-caption">
        <Icon name="shield" size={16} />
        <span>
          Guardamos o CPF criptografado e nunca o mostramos por inteiro. Não dá para trocar depois.
          Para entrar também com e-mail e senha, crie uma senha em Meu perfil quando quiser.
        </span>
      </p>
    </form>
  );
}
