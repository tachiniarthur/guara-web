"use client";

import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";

import { signInWithProvider } from "../auth";
import { useSession } from "../session";
import { WarningBlock } from "./auth-parts";

const PROVIDERS = [
  { id: "google", label: "Continuar com Google" },
  { id: "apple", label: "Continuar com Apple" },
] as const;

/**
 * "Continuar com Google/Apple". Com login de verdade, vai para o provedor e volta para o site;
 * no protótipo, entra direto.
 */
export function SocialButtons({ prototypeHref = "/" }: { prototypeHref?: string }) {
  const { live } = useSession();
  const [failed, setFailed] = useState<string | null>(null);

  if (!live) {
    return PROVIDERS.map((provider) => (
      <ButtonLink key={provider.id} href={prototypeHref} variant="secondary" size="xl" block>
        <span>{provider.label}</span>
      </ButtonLink>
    ));
  }
  return (
    <>
      {failed && (
        <WarningBlock icon="alert-triangle">
          Não deu para entrar com {failed}. Tente de novo ou use o e-mail.
        </WarningBlock>
      )}
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="secondary"
          size="xl"
          block
          onClick={() => {
            setFailed(null);
            signInWithProvider(provider.id).catch(() =>
              setFailed(provider.id === "google" ? "o Google" : "a Apple"),
            );
          }}
        >
          <span>{provider.label}</span>
        </Button>
      ))}
    </>
  );
}
