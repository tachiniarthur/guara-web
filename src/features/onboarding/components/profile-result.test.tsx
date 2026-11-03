import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProfileResult } from "./profile-result";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/onboarding/perfil/resultado",
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Onboarding · resultado do perfil", () => {
  it("troca de perfil só com o termo aceito, e volta ao indicado", async () => {
    render(<ProfileResult />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Moderado");

    // Tocar no perfil abre a comparação; o termo só vem ao escolher.
    fireEvent.click(screen.getByRole("radio", { name: /Arrojado/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Comparação: Moderado e Arrojado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Escolher o perfil Arrojado" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Termo de alteração do perfil de investidor",
    );
    const confirm = screen.getByRole("button", { name: "Confirmar troca" });
    expect(confirm).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(confirm);

    // O termo sai animado e depois some.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Arrojado");
    expect(screen.getByText(/Escolhido por você/)).toBeInTheDocument();

    // Depois da troca, a comparação parte do perfil escolhido (inclusive para voltar ao indicado).
    fireEvent.click(screen.getByRole("radio", { name: /Conservador/ }));
    expect(screen.getByLabelText("Comparação: Arrojado e Conservador")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Comparar com o Moderado" }));
    expect(screen.getByLabelText("Comparação: Arrojado e Moderado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao Moderado" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Moderado");
  });

  it("fecha a comparação recolhendo (sem foco lá dentro) e tira da tela no fim", () => {
    render(<ProfileResult />);
    fireEvent.click(screen.getByRole("radio", { name: /Arrojado/ }));
    const panel = screen.getByLabelText("Comparação: Moderado e Arrojado");
    fireEvent.click(screen.getByRole("button", { name: "Fechar a comparação" }));
    const wrapper = panel.closest("[inert]");
    expect(wrapper).not.toBeNull();
    fireEvent.transitionEnd(wrapper!);
    expect(screen.queryByLabelText("Comparação: Moderado e Arrojado")).not.toBeInTheDocument();
  });

  it("Continuar leva às assistentes", () => {
    render(<ProfileResult />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(push).toHaveBeenCalledWith("/onboarding/assistentes");
  });
});
