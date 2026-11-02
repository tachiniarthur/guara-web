import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type * as OriginalAuth from "../auth";
import type * as OriginalSession from "../session";
import { useAuthFlow } from "@/stores/auth-flow";

import { SessionProvider } from "../session";
import { SignUpForm, WelcomeOptions } from "./signup-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

let live = false;
vi.mock("../session", async (importOriginal) => ({
  ...(await importOriginal<typeof OriginalSession>()),
  useSession: () => ({ live, status: "signedOut", refresh: vi.fn(), signOut: vi.fn() }),
}));

const checkEmail = vi.fn();
const signUpWithPassword = vi.fn();
vi.mock("../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof OriginalAuth>()),
  checkEmail: (...args: unknown[]) => checkEmail(...args),
  signUpWithPassword: (...args: unknown[]) => signUpWithPassword(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  live = false;
  checkEmail.mockResolvedValue({ exists: false, providers: [], cpfRegistered: false });
  signUpWithPassword.mockResolvedValue(undefined);
  useAuthFlow.getState().clear();
});

function fill(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    Nome: " Arthur ",
    "E-mail": "Arthur@Exemplo.com ",
    CPF: "52998224725",
    Senha: "Senha2026",
    "Confirmar senha": "Senha2026",
    ...overrides,
  };
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

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

  it("pede nome, e-mail, CPF e senha e segue para o código (protótipo)", () => {
    render(<SignUpForm />);
    for (const label of ["Nome", "E-mail", "CPF", "Senha", "Confirmar senha"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    submit();
    expect(push).toHaveBeenCalledWith("/boas-vindas/codigo");
  });

  it("põe a máscara no CPF ao digitar", () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "52998224725999" } });
    expect(screen.getByLabelText("CPF")).toHaveValue("529.982.247-25");
  });

  it("mostra e esconde a senha", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    fireEvent.click(screen.getAllByRole("button", { name: "Mostrar a senha" })[0]!);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
  });

  describe("com login de verdade", () => {
    beforeEach(() => {
      live = true;
    });

    it("recusa dados inválidos sem chamar a API", () => {
      render(<SignUpForm />);
      fill({ Nome: " ", CPF: "11111111111", Senha: "curta", "Confirmar senha": "outra" });
      submit();
      expect(screen.getByText("Conte como quer ser chamado.")).toBeInTheDocument();
      expect(screen.getByText("Confira o CPF: são 11 números.")).toBeInTheDocument();
      expect(screen.getByText("Use pelo menos 8 caracteres.")).toBeInTheDocument();
      expect(screen.getByText("As senhas não são iguais.")).toBeInTheDocument();
      expect(checkEmail).not.toHaveBeenCalled();
      expect(signUpWithPassword).not.toHaveBeenCalled();
    });

    it("cria a conta com a senha e guarda o CPF só na memória para depois do código", async () => {
      render(<SignUpForm />);
      fill();
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/boas-vindas/codigo"));
      expect(checkEmail).toHaveBeenCalledWith("arthur@exemplo.com", "52998224725");
      expect(signUpWithPassword).toHaveBeenCalledWith("arthur@exemplo.com", "Senha2026", "Arthur");
      expect(useAuthFlow.getState()).toMatchObject({
        email: "arthur@exemplo.com",
        name: "Arthur",
        cpf: "52998224725",
      });
      expect(sessionStorage.getItem("guara-auth-flow")).not.toContain("52998224725");
    });

    it("avisa quando o e-mail já tem conta, sem criar outra", async () => {
      checkEmail.mockResolvedValue({ exists: true, providers: ["google"], cpfRegistered: false });
      render(<SignUpForm />);
      fill();
      submit();
      expect(await screen.findByText("Esse e-mail já tem uma conta no Guará")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
      expect(signUpWithPassword).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Entrar com e-mail e senha" }));
      expect(push).toHaveBeenCalledWith("/entrar");
    });

    it("avisa quando o CPF já tem conta", async () => {
      checkEmail.mockResolvedValue({ exists: false, providers: [], cpfRegistered: true });
      render(<SignUpForm />);
      fill();
      submit();
      expect(
        await screen.findByText("Esse CPF já tem uma conta no Guará. Entre com o CPF e a senha."),
      ).toBeInTheDocument();
      expect(signUpWithPassword).not.toHaveBeenCalled();
    });
  });
});
