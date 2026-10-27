import { fireEvent, render, screen } from "@testing-library/react";

import { SessionProvider } from "../session";
import { SignUpForm, WelcomeOptions } from "./signup-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

describe("Criar conta", () => {
  it("boas-vindas: Google, Apple e criar com e-mail, sem pedir o e-mail ali", () => {
    render(
      <SessionProvider>
        <WelcomeOptions />
      </SessionProvider>,
    );
    expect(screen.getByRole("link", { name: "Criar conta com e-mail" })).toHaveAttribute(
      "href",
      "/boas-vindas/criar",
    );
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
  });

  it("a tela de criar pede nome e e-mail e segue para o código (protótipo)", () => {
    render(
      <SessionProvider>
        <SignUpForm />
      </SessionProvider>,
    );
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Receber código" }));
    expect(push).toHaveBeenCalledWith("/boas-vindas/codigo");
  });
});
