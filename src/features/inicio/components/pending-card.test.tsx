import { fireEvent, render, screen, within } from "@testing-library/react";

import type { PendingItem } from "../types";
import { PendingCard } from "./pending-card";

const items: PendingItem[] = Array.from({ length: 7 }, (_, i) => ({
  id: `p${i + 1}`,
  titulo: `Pendência ${i + 1}`,
  detalhe: "detalhe",
  origem: "Lobo Guará · Gastos",
  acao: "Ver",
  href: "/gastos",
}));

const titles = () =>
  screen.getAllByRole("listitem").map((li) => within(li).getByText(/^Pendência/).textContent);

describe("Precisa de você", () => {
  it("mostra as 5 primeiras e abre o resto com Ver mais", () => {
    render(<PendingCard pendingItems={items} />);
    expect(titles()).toEqual([
      "Pendência 1",
      "Pendência 2",
      "Pendência 3",
      "Pendência 4",
      "Pendência 5",
    ]);
    expect(screen.getByLabelText("7 pendências")).toBeInTheDocument();

    const more = screen.getByRole("button", { name: "Ver mais 2" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(more);
    expect(titles()).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Ver menos" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("com 5 ou menos, sem Ver mais", () => {
    render(<PendingCard pendingItems={items.slice(0, 5)} />);
    expect(titles()).toHaveLength(5);
    expect(screen.queryByRole("button", { name: /Ver mais/ })).toBeNull();
  });
});
