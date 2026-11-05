import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CpfStep } from "./cpf-step";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace }) }));

vi.mock("@/features/acesso/session", () => ({ useSession: () => ({ live: true }) }));

let me: { cpfMasked: string | null; phone?: string | null } = { cpfMasked: null, phone: null };
let pending = false;
const setCpf = vi.fn();
const setPhone = vi.fn();
vi.mock("@/features/perfil/api", () => ({
  useMe: () => ({ data: pending ? undefined : me, isSuccess: !pending, isPending: pending }),
  useSetCpf: () => ({ mutateAsync: setCpf, isPending: false }),
  useSetPhone: () => ({ mutateAsync: setPhone, isPending: false }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  pending = false;
  setCpf.mockResolvedValue({});
  setPhone.mockResolvedValue({});
});

describe("Etapa do CPF e do celular", () => {
  it("pede os dois quando faltam e salva antes do plano", async () => {
    me = { cpfMasked: null, phone: null };
    render(<CpfStep />);
    expect(screen.getByRole("heading", { name: "Informe seu CPF e celular" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("CPF"), { target: { value: "529.982.247-25" } });
    fireEvent.change(screen.getByLabelText("Celular"), { target: { value: "(11) 98765-4321" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/plano"));
    expect(setPhone).toHaveBeenCalledWith("11987654321");
    expect(setCpf).toHaveBeenCalledWith("52998224725");
  });

  it("com o CPF na conta, pede só o celular", () => {
    me = { cpfMasked: "***.982.247-**", phone: null };
    render(<CpfStep />);
    expect(screen.getByRole("heading", { name: "Informe seu celular" })).toBeInTheDocument();
    expect(screen.queryByLabelText("CPF")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Informe o celular com DDD.")).toBeInTheDocument();
    expect(setPhone).not.toHaveBeenCalled();
  });

  it("com CPF e celular na conta, vai direto para o plano", () => {
    me = { cpfMasked: "***.982.247-**", phone: "+5511987654321" };
    render(<CpfStep />);
    expect(replace).toHaveBeenCalledWith("/onboarding/plano");
  });

  it("enquanto lê a conta, mostra só o anel de carregamento, sem o Voltar", () => {
    pending = true;
    render(<CpfStep />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
    expect(screen.queryByRole("button", { name: /voltar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("com o formulário na tela, mostra o Voltar", () => {
    me = { cpfMasked: null, phone: null };
    render(<CpfStep />);
    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
  });
});
