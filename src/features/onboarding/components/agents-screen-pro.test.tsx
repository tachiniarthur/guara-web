import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";

import type * as Hooks from "../hooks";

import { AgentsScreen } from "./agents-screen";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
// Plano que inclui todos os assistentes (Pro): sem limite.
vi.mock("../hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof Hooks>()),
  usePlanAgents: () => ({ nome: "Pro", limite: null }),
}));

describe("Onboarding · Monte sua equipe (plano Pro: todos os assistentes)", () => {
  it("não há o que escolher: segue direto para o painel", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SessionProvider>
          <AgentsScreen blocked={false} />
        </SessionProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText("todos")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Escolher para a minha equipe" })).toBeNull();
    const [button] = screen.getAllByRole("button", { name: "Ir para o painel" });
    expect(button).toBeEnabled();
    fireEvent.click(button!);
    expect(push).toHaveBeenCalledWith("/");
  });
});
