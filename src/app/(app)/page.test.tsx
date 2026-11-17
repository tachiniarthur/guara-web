import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as baseRender, screen } from "@testing-library/react";
import type { ReactElement } from "react";

import { InicioScreen } from "@/app/(app)/inicio-screen";
import { SessionProvider } from "@/features/acesso/session";
import { NewUserHome } from "@/features/inicio/components/new-user-home";
import { MONTHS } from "@/lib/live-format";

function render(ui: ReactElement) {
  return baseRender(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>{ui}</SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Início", () => {
  it("mostra as seções do mês atual, sem dados de exemplo", () => {
    render(<InicioScreen />);
    const month = MONTHS[new Date().getMonth()]!.toLowerCase();
    expect(
      screen.getByRole("heading", { level: 2, name: `Resumo de ${month}` }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Visão geral" })).toBeInTheDocument();
    expect(screen.getByText("Próximas cobranças")).toBeInTheDocument();
    // Nada do design antigo (valores e textos de exemplo).
    expect(screen.queryByText("R$ 12.480,32")).not.toBeInTheDocument();
    expect(screen.queryByText(/Ver os 118/)).not.toBeInTheDocument();
    expect(screen.queryByText("Por banco")).not.toBeInTheDocument();
  });

  it("mostra os primeiros passos para quem ainda não conectou banco", () => {
    render(<NewUserHome />);
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Primeiros passos" }).length,
    ).toBeGreaterThan(0);
  });
});
