import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AccountPopover } from "./account-actions";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace }) }));

const signOut = vi.fn(async () => {});
vi.mock("@/features/acesso/session", () => ({
  useSession: () => ({ live: false, status: "signedIn", refresh: vi.fn(), signOut }),
}));

describe("Menu da conta", () => {
  it("abre com Meu perfil, Configurações e Sair; Sair pede confirmação", async () => {
    render(
      <AccountPopover placement="above" label="Menu da conta">
        AR
      </AccountPopover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Menu da conta" }));
    expect(screen.getByRole("menuitem", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("menuitem", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes",
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Sair" }));
    expect(screen.getByRole("dialog", { name: "Sair da conta?" })).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/boas-vindas"));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
