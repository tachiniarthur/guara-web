import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";

import { AgentsScreen } from "./agents-screen";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

function renderScreen() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <AgentsScreen blocked={false} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Onboarding · Monte sua equipe (protótipo, plano Plus: 5 assistentes)", () => {
  it("mostra um assistente por vez, escolhe até o limite do plano e termina no painel", () => {
    renderScreen();
    expect(screen.getByText("Etapa 4 de 4")).toBeInTheDocument();
    // Nada vem escolhido: sem ninguém na equipe, não dá para seguir.
    expect(screen.getByText("0 de 5")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ir para o painel" })[0]).toBeDisabled();
    expect(screen.getByRole("heading", { level: 3, name: "Capivara" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Escolher para a minha equipe" }));
    expect(screen.getByText("1 de 5")).toBeInTheDocument();
    for (const name of ["Tamanduá", "Pacu", "Caramelo", "Quero-quero"]) {
      fireEvent.click(screen.getByRole("button", { name: `Ver ${name}` }));
      fireEvent.click(screen.getByRole("button", { name: "Escolher para a minha equipe" }));
    }
    expect(screen.getByText("5 de 5")).toBeInTheDocument();
    // No limite do plano, o 6º (Onça) fica bloqueado.
    fireEvent.click(screen.getByRole("button", { name: "Ver Onça" }));
    expect(screen.getAllByRole("button", { name: "Limite do plano", hidden: true }).length).toBe(1);

    fireEvent.click(screen.getAllByRole("button", { name: "Ir para o painel" })[0]!);
    expect(push).toHaveBeenCalledWith("/");
  });
});
