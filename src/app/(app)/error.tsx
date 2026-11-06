"use client";

import { useEffect } from "react";

import { Page } from "@/components/layout/page";
import { StateBlock } from "@/components/states/state-block";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Erro inesperado numa tela da área logada: o menu continua e o conteúdo dá lugar ao aviso, em
 * vez da página de erro do navegador. "Tentar de novo" desenha a tela de novo.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Page padding="list">
      <StateBlock
        icon="alert-triangle"
        tone="error"
        title="Não deu para abrir esta tela"
        action={
          <Button variant="secondary" size="md" className="text-15" onClick={retry}>
            <Icon name="retry" size={18} />
            <span>Tentar de novo</span>
          </Button>
        }
      >
        Seus dados continuam salvos. Algo deu errado ao montar a tela; tente de novo em instantes.
      </StateBlock>
    </Page>
  );
}
