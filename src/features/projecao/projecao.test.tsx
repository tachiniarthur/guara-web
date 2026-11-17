import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { formatDate } from "@/lib/format";
import { futureMonthOrNull, shiftMonth } from "@/lib/live-format";

import { PlannedExpenseForm } from "./components/planned-expense-form";
import { monthsSentence, untilLabel } from "./format";

describe("projeção dos próximos meses", () => {
  const now = new Date("2026-11-17T12:00:00-03:00");

  it("mês futuro escolhido: só de 1 a 12 meses depois do atual", () => {
    expect(futureMonthOrNull("2026-12", now)).toBe("2026-12");
    expect(futureMonthOrNull("2027-11", now)).toBe("2027-11");
    expect(futureMonthOrNull("2026-11", now)).toBeNull();
    expect(futureMonthOrNull("2027-12", now)).toBeNull();
    expect(futureMonthOrNull("2026-10", now)).toBeNull();
    expect(futureMonthOrNull("lixo", now)).toBeNull();
  });

  it("frases da sugestão e do período", () => {
    expect(monthsSentence(["2026-08", "2026-09", "2026-10", "2026-11"])).toBe(
      "setembro, outubro e novembro",
    );
    expect(monthsSentence(["2026-11"])).toBe("novembro");
    expect(untilLabel("2031-06")).toBe("até junho de 2031");
    expect(untilLabel(null)).toBe("sem data de fim");
  });
});

describe("formulário de gasto futuro", () => {
  const current = formatDate(new Date(), "yyyy-MM");

  function setup() {
    const onSubmit = vi.fn();
    render(
      <PlannedExpenseForm onSubmit={onSubmit} actions={<button type="submit">Salvar</button>} />,
    );
    const fill = (label: string, value: string) =>
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    return {
      onSubmit,
      fill,
      save: () => fireEvent.click(screen.getByRole("button", { name: "Salvar" })),
    };
  }

  it("pede nome e valor", () => {
    const { onSubmit, fill, save } = setup();
    save();
    expect(screen.getByRole("alert")).toHaveTextContent("Dê um nome ao gasto.");
    fill("Nome", "Parcela do carro");
    save();
    expect(screen.getByRole("alert")).toHaveTextContent("Informe o valor por mês.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sem fim por padrão; com fim, precisa ser depois do mês atual e do início", () => {
    const { onSubmit, fill, save } = setup();
    fill("Nome", "Parcela do carro");
    fill("Valor por mês", "1.520,00");
    save();
    expect(onSubmit).toHaveBeenLastCalledWith({
      name: "Parcela do carro",
      amountCents: 152_000,
      startMonth: shiftMonth(current, 1),
      endMonth: null,
    });

    fireEvent.click(screen.getByLabelText(/Sem data para acabar/));
    fill("Último mês", current);
    save();
    expect(screen.getByRole("alert")).toHaveTextContent("O fim não pode ser antes do início.");

    fill("Começa em", shiftMonth(current, -3));
    save();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "O último mês precisa ser depois do mês atual.",
    );

    fill("Último mês", "2031-06");
    save();
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ startMonth: shiftMonth(current, -3), endMonth: "2031-06" }),
    );
  });
});
