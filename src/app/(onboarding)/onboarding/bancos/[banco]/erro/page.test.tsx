import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { SessionProvider } from "@/features/acesso/session";

import ErroBancoPage from "./page";

async function renderPage(motivo?: string) {
  const page = await ErroBancoPage({
    params: Promise.resolve({ banco: "itau" }),
    searchParams: Promise.resolve(motivo ? { motivo } : {}),
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionProvider>{page}</SessionProvider>
    </QueryClientProvider>,
  );
}

describe("Conexão que não deu certo", () => {
  it("erro comum: o que pode ter acontecido e tentar de novo", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Não deu para conectar o Itaú" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Tentar de novo/ }).length).toBeGreaterThan(0);
  });

  it("banco em outro CPF: explica e só oferece outro banco", async () => {
    await renderPage("cpf");
    expect(
      screen.getByRole("heading", { level: 1, name: "O Itaú está em outro CPF" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Desfizemos a autorização e nada foi guardado/)).toBeInTheDocument();
    expect(screen.getByText("Conecte um banco em que você é o titular")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Tentar de novo/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Escolher outro banco" }).length).toBeGreaterThan(0);
  });
});
