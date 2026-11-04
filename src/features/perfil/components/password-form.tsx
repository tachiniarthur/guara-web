"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { passwordAuthCode, updatePassword } from "@/features/acesso/auth";
import { PasswordField } from "@/features/acesso/components/fields";
import { useSession } from "@/features/acesso/session";
import { PASSWORD_MAX_LENGTH, passwordProblem } from "@/lib/password";

/**
 * "Senha de acesso": cria a senha de quem entrou com Google ou Apple, ou troca a atual. Com ela, a
 * pessoa também entra com o e-mail ou o CPF.
 */
export function PasswordForm() {
  const router = useRouter();
  const { live } = useSession();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<{ senha?: string; confirmacao?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = {
      senha: passwordProblem(password) ?? undefined,
      confirmacao: password === confirmation ? undefined : "As senhas não são iguais.",
    };
    setErrors(found);
    if (found.senha || found.confirmacao) return;
    if (!live) return router.push("/configuracoes");
    setSaving(true);
    setFailure(null);
    try {
      await updatePassword(password);
      router.push("/configuracoes");
    } catch (error) {
      const code = passwordAuthCode(error);
      if (code === "senha-fraca") setErrors({ senha: "Essa senha é fraca. Escolha outra." });
      else if (code === "sem-internet")
        setFailure("Sem conexão. Confira sua internet e tente de novo.");
      else setFailure("Não deu para salvar a senha agora. Tente de novo em instantes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="m-0 flex flex-col gap-5" onSubmit={submit} noValidate>
      {failure && (
        <Note icon="alert-triangle" tone="warning">
          {failure}
        </Note>
      )}
      <PasswordField
        id="senha-nova"
        label="Senha nova"
        mode="new"
        value={password}
        maxLength={PASSWORD_MAX_LENGTH}
        placeholder="Pelo menos 8 caracteres"
        onChange={(event) => {
          setPassword(event.target.value);
          setErrors({});
        }}
        error={errors.senha}
        rules
      />
      <PasswordField
        id="senha-confirmacao"
        label="Confirmar senha"
        mode="new"
        value={confirmation}
        matches={password}
        maxLength={PASSWORD_MAX_LENGTH}
        onChange={(event) => {
          setConfirmation(event.target.value);
          setErrors({});
        }}
        error={errors.confirmacao}
      />
      <Note icon="info" tone="info">
        Quem entrou com Google ou Apple pode criar uma senha aqui e passar a entrar também com
        e-mail ou CPF. Quem já tem senha troca por esta.
      </Note>
      <div className="flex flex-wrap justify-end gap-2.5">
        <ButtonLink href="/configuracoes" variant="secondary" size="md">
          <span>Cancelar</span>
        </ButtonLink>
        <Button type="submit" variant="primary" size="md" disabled={saving}>
          <span>{saving ? "Salvando…" : "Salvar senha"}</span>
        </Button>
      </div>
    </form>
  );
}
