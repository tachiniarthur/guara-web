import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";

import { NoticesScreen } from "./notices-screen";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

function renderScreen(blocked: boolean) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>
        <NoticesScreen blocked={blocked} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Onboarding · Avisos", () => {
  it("não pede para escolher assistentes: o Guará avisa e o botão leva ao painel", () => {
    renderScreen(false);
    expect(screen.getByText("Etapa 4 de 4")).toBeInTheDocument();
    expect(screen.getByText("Lobo Guará")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Escolher para a minha equipe" })).toBeNull();
    expect(screen.getByLabelText(/Notificação no celular/)).toBeChecked();

    const [button] = screen.getAllByRole("button", { name: "Ir para o painel" });
    expect(button).toBeEnabled();
    fireEvent.click(button!);
    expect(push).toHaveBeenCalledWith("/");
  });

  it("com as notificações bloqueadas no aparelho, o celular fica desligado", () => {
    renderScreen(true);
    expect(screen.getByLabelText(/Notificação no celular/)).toBeDisabled();
  });
});
