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
  checkEmail.mockResolvedValue({
    exists: false,
    providers: [],
    hasPassword: false,
    cpfRegistered: false,
  });
  signUpWithPassword.mockResolvedValue(undefined);
  useAuthFlow.getState().clear();
});

function fill(values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

/** Etapa 1 (e-mail e CPF) e "Continuar". */
function identify(overrides: Record<string, string> = {}) {
  fill({ "E-mail": "Arthur@Exemplo.com ", CPF: "52998224725", ...overrides });
  fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
}

/** Etapa 2: nome e senha. */
function fillDetails(overrides: Record<string, string> = {}) {
  fill({ Nome: " Arthur ", Senha: "Senha2026", "Confirmar senha": "Senha2026", ...overrides });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

describe("Criar conta", () => {
  it("boas-vindas: Criar conta e Entrar em destaque, e Google e Apple, sem pedir dados ali", () => {
    render(
      <SessionProvider>
        <WelcomeOptions />
      </SessionProvider>,
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/boas-vindas/criar",
    );
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
    expect(screen.getByRole("link", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar com Apple" })).toBeInTheDocument();
    expect(screen.queryByLabelText("E-mail")).not.toBeInTheDocument();
  });

  it("pede primeiro o e-mail e o CPF, depois o nome e a senha (protótipo)", async () => {
    render(<SignUpForm />);
    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Senha")).not.toBeInTheDocument();
    identify();
    expect(await screen.findByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("arthur@exemplo.com");
    expect(screen.getByLabelText("CPF")).toHaveValue("529.982.247-25");
    fillDetails();
    submit();
    expect(push).toHaveBeenCalledWith("/boas-vindas/codigo");
  });

  it("volta da segunda etapa para o e-mail e o CPF, com eles preenchidos", async () => {
    render(<SignUpForm />);
    identify();
    await screen.findByLabelText("Nome");
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
    expect(screen.getByLabelText("CPF")).toHaveValue("529.982.247-25");
  });

  it("põe a máscara no CPF ao digitar", () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "52998224725999" } });
    expect(screen.getByLabelText("CPF")).toHaveValue("529.982.247-25");
  });

  it("mostra e esconde a senha", async () => {
    render(<SignUpForm />);
    identify();
    expect(await screen.findByLabelText("Senha")).toHaveAttribute("type", "password");
    fireEvent.click(screen.getAllByRole("button", { name: "Mostrar a senha" })[0]!);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
  });

  describe("com login de verdade", () => {
    beforeEach(() => {
      live = true;
    });

    it("recusa e-mail e CPF inválidos sem chamar a API", () => {
      render(<SignUpForm />);
      identify({ "E-mail": "arthur@", CPF: "11111111111" });
      expect(screen.getByText("Confira o e-mail: falta algo no endereço.")).toBeInTheDocument();
      expect(screen.getByText("Confira o CPF: são 11 números.")).toBeInTheDocument();
      expect(checkEmail).not.toHaveBeenCalled();
    });

    it("recusa nome vazio, senha fraca e confirmação diferente", async () => {
      render(<SignUpForm />);
      identify();
      await screen.findByLabelText("Nome");
      fillDetails({ Nome: " ", Senha: "curta", "Confirmar senha": "outra" });
      submit();
      expect(screen.getByText("Conte como quer ser chamado.")).toBeInTheDocument();
      expect(screen.getByText("Use pelo menos 8 caracteres.")).toBeInTheDocument();
      expect(screen.getByText("As senhas não são iguais.")).toBeInTheDocument();
      expect(signUpWithPassword).not.toHaveBeenCalled();
    });

    it("cria a conta com a senha e guarda o CPF só na memória para depois do código", async () => {
      render(<SignUpForm />);
      identify();
      await screen.findByLabelText("Nome");
      expect(checkEmail).toHaveBeenCalledWith("arthur@exemplo.com", "52998224725");
      fillDetails();
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/boas-vindas/codigo"));
      expect(signUpWithPassword).toHaveBeenCalledWith("arthur@exemplo.com", "Senha2026", "Arthur");
      expect(useAuthFlow.getState()).toMatchObject({
        email: "arthur@exemplo.com",
        name: "Arthur",
        cpf: "52998224725",
      });
      expect(sessionStorage.getItem("guara-auth-flow")).not.toContain("52998224725");
    });

    it("leva para o Entrar com o e-mail preenchido quando o e-mail já tem conta", async () => {
      checkEmail.mockResolvedValue({
        exists: true,
        providers: ["email"],
        hasPassword: true,
        cpfRegistered: true,
      });
      render(<SignUpForm />);
      identify();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/email"));
      expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
      expect(useAuthFlow.getState().signInHint).toEqual({
        identifier: "arthur@exemplo.com",
        social: false,
        notice: "Esse e-mail já tem uma conta no Guará. Entre com a senha.",
      });
      expect(sessionStorage.getItem("guara-auth-flow")).not.toContain("52998224725");
    });

    it("leva para o Entrar com o CPF preenchido quando só o CPF tem conta", async () => {
      checkEmail.mockResolvedValue({
        exists: false,
        providers: [],
        hasPassword: false,
        cpfRegistered: true,
      });
      render(<SignUpForm />);
      identify();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/email"));
      expect(useAuthFlow.getState().signInHint?.identifier).toBe("529.982.247-25");
    });

    it('conta sem senha (criada só com o código): aponta para o "Esqueci minha senha"', async () => {
      checkEmail.mockResolvedValue({
        exists: true,
        providers: ["email"],
        hasPassword: false,
        cpfRegistered: false,
      });
      render(<SignUpForm />);
      identify();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/email"));
      expect(useAuthFlow.getState().signInHint).toMatchObject({
        identifier: "arthur@exemplo.com",
        notice: expect.stringMatching(/ainda sem senha. Clique em "Esqueci minha senha"/),
      });
    });

    it("conta feita com o Google: aponta para o botão ou para criar uma senha", async () => {
      checkEmail.mockResolvedValue({
        exists: true,
        providers: ["google"],
        hasPassword: false,
        cpfRegistered: false,
      });
      render(<SignUpForm />);
      identify();
      // Conta só do Google: abre na escolha do "Entrar", onde está o botão dele.
      await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar"));
      expect(useAuthFlow.getState().signInHint?.social).toBe(true);
      expect(useAuthFlow.getState().signInHint?.notice).toMatch(
        /criada com o Google. Continue com o Google ou clique em "Esqueci minha senha"/,
      );
    });

    it("confere de novo ao criar, caso o e-mail tenha mudado na segunda etapa", async () => {
      checkEmail
        .mockResolvedValueOnce({
          exists: false,
          providers: [],
          hasPassword: false,
          cpfRegistered: false,
        })
        .mockResolvedValueOnce({
          exists: true,
          providers: ["email"],
          hasPassword: true,
          cpfRegistered: false,
        });
      render(<SignUpForm />);
      identify();
      await screen.findByLabelText("Nome");
      fill({ "E-mail": "outra@exemplo.com" });
      fillDetails();
      submit();
      await waitFor(() => expect(push).toHaveBeenCalledWith("/entrar/email"));
      expect(signUpWithPassword).not.toHaveBeenCalled();
      expect(useAuthFlow.getState().signInHint?.identifier).toBe("outra@exemplo.com");
    });
  });
});
