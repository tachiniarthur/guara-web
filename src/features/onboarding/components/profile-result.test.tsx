import { fireEvent, render, screen } from "@testing-library/react";

import { ProfileResult } from "./profile-result";

vi.mock("next/navigation", () => ({
  usePathname: () => "/onboarding/perfil/resultado",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Onboarding · resultado do perfil", () => {
  it("troca de perfil só com o termo aceito, e volta ao indicado", () => {
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

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Arrojado");
    expect(screen.getByText(/Escolhido por você/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar ao Moderado" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Seu perfil é Moderado");
  });
});
