"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { StatusToast } from "@/components/states/status-toast";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { LabeledField } from "@/components/ui/form-sections";
import { Icon } from "@/components/ui/icon";
import { PhoneField } from "@/features/acesso/components/fields";
import { useSession } from "@/features/acesso/session";
import { user } from "@/features/usuario/data";
import { useUser } from "@/features/usuario/live";
import { phoneProblem } from "@/lib/phone";

import { meKeys, saveDisplayName, savePhone, useMe } from "../api";
import { CpfReadOnly } from "./cpf-readonly";
import { AvatarFields } from "./edit-profile";

const subscribeNothing = () => () => {};
const digitsOf = (e164?: string | null) => e164?.replace(/^\+55/, "") ?? "";

/**
 * "Seus dados" em Meu perfil: foto/iniciais, nome, celular, e-mail e CPF, já editáveis (sem
 * passar por outra tela). Salvar grava nome e celular; trocar o e-mail segue para a confirmação
 * por link. Com login de verdade, os dados vêm da API (`me`).
 */
export function ProfileDataForm() {
  const { live } = useSession();
  const me = useMe({ enabled: live });
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (live && me.isPending) {
    return (
      <p role="status" className="m-0 text-14 text-mist">
        Carregando seus dados…
      </p>
    );
  }
  const name = live ? (me.data?.displayName ?? "") : user.nome;
  const phone = live ? digitsOf(me.data?.phone) : digitsOf(user.telefone);
  // A chave refaz o formulário quando os dados salvos chegam (ou mudam depois de salvar).
  return (
    <DataForm
      key={`${hydrated}-${name}-${phone}`}
      initialName={name}
      initialPhone={phone}
      live={live}
    />
  );
}

function DataForm({
  initialName,
  initialPhone,
  live,
}: {
  initialName: string;
  initialPhone: string;
  live: boolean;
}) {
  const account = useUser();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const dirty = name.trim() !== initialName || phone !== initialPhone;
  const nameProblem = name.trim() ? null : "Informe como quer ser chamado.";
  const phoneError = phone && phone.length === 11 ? phoneProblem(phone) : null;
  const phoneIncomplete = phone !== initialPhone && phoneProblem(phone);
  const blocked = Boolean(nameProblem || phoneIncomplete);

  async function save() {
    if (blocked) return;
    setSaving(true);
    setFailed(false);
    try {
      if (live) {
        if (name.trim() !== initialName) await saveDisplayName(name.trim());
        if (phone !== initialPhone) await savePhone(phone);
        await queryClient.invalidateQueries({ queryKey: meKeys.me });
      }
      setSaved(Date.now());
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 @tab:flex-row @tab:items-start @tab:gap-10">
        <AvatarFields />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 @tab:grid-cols-2 @tab:gap-x-5">
        <LabeledField
          id="perfil-nome"
          label="Nome"
          hint={nameProblem ?? "Como os assistentes vão chamar você"}
        >
          <TextInput
            id="perfil-nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameProblem ? true : undefined}
          />
        </LabeledField>
        <PhoneField
          id="perfil-celular"
          label="Celular"
          value={phone}
          onValueChange={setPhone}
          error={phoneError}
          hint="Com DDD. Usado para avisos importantes da sua conta."
        />
        <LabeledField id="perfil-email" label="E-mail">
          <div className="relative">
            <span className="pointer-events-none absolute top-[0.9375rem] left-3.5 text-caption">
              <Icon name="mail" />
            </span>
            <TextInput id="perfil-email" value={account.email} readOnly className="pl-11" />
          </div>
          <Link
            href="/perfil/editar/email"
            className="flex min-h-6 items-center gap-1 self-start text-14 font-bold text-sand underline underline-offset-3"
          >
            Trocar e-mail
            <Icon name="chevron-right" size={16} />
          </Link>
        </LabeledField>
        <CpfReadOnly />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        {failed && (
          <p role="alert" className="m-0 mr-auto text-14 text-urucum">
            Não deu para salvar agora. Tente de novo em instantes.
          </p>
        )}
        <Button
          variant="ghost"
          className="text-15"
          disabled={!dirty || saving}
          onClick={() => {
            setName(initialName);
            setPhone(initialPhone);
          }}
        >
          <span>Descartar</span>
        </Button>
        <Button
          variant="primary"
          className="text-15"
          disabled={!dirty || saving || blocked}
          onClick={() => void save()}
        >
          <Icon name="check" size={18} />
          <span>{saving ? "Salvando…" : "Salvar alterações"}</span>
        </Button>
      </div>
      {saved !== null && (
        <StatusToast key={saved} tone="neutral" icon="check" title="Dados salvos" position="bottom">
          Seu nome e celular foram atualizados.
        </StatusToast>
      )}
    </div>
  );
}
