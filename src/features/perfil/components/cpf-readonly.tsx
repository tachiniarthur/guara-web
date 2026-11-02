"use client";

import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/form";
import { LabeledField } from "@/components/ui/form-sections";
import { useSession } from "@/features/acesso/session";

import { useMe } from "../api";

/** CPF da conta, só com o miolo e sem edição (não muda depois de informado). Some se não há CPF. */
export function CpfReadOnly() {
  const { live } = useSession();
  const { data } = useMe({ enabled: live });
  if (!data?.cpfMasked) return null;
  return (
    <LabeledField id="perfil-cpf" label="CPF" hint="Não dá para trocar o CPF depois de informado.">
      <div className="relative">
        <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
          <Icon name="lock" />
        </span>
        <TextInput id="perfil-cpf" value={data.cpfMasked} readOnly disabled className="pl-11" />
      </div>
    </LabeledField>
  );
}
