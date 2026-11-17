import { describe, expect, it } from "vitest";

import type { Conversation } from "./api";
import { groupConversations, startedLabel, toolLabel, whenLabel } from "./format";

const now = new Date("2026-11-17T15:00:00-03:00");
const conversation = (id: string, lastMessageAt: string): Conversation => ({
  id,
  title: id,
  lastMessageAt,
  createdAt: lastMessageAt,
});

describe("histórico de conversas", () => {
  it("agrupa por hoje, ontem, esta semana e mês (com o ano quando é outro)", () => {
    const groups = groupConversations(
      [
        conversation("a", "2026-11-17T10:00:00-03:00"),
        conversation("b", "2026-11-16T23:30:00-03:00"),
        conversation("c", "2026-11-12T08:00:00-03:00"),
        conversation("d", "2026-10-03T08:00:00-03:00"),
        conversation("e", "2025-10-03T08:00:00-03:00"),
      ],
      now,
    );
    expect(groups.map((g) => [g.titulo, g.itens.map((i) => i.id)])).toEqual([
      ["Hoje", ["a"]],
      ["Ontem", ["b"]],
      ["Esta semana", ["c"]],
      ["Outubro", ["d"]],
      ["Outubro de 2025", ["e"]],
    ]);
  });

  it("usa o dia de São Paulo (23h de ontem no Brasil é ontem, mesmo já sendo hoje em UTC)", () => {
    expect(whenLabel("2026-11-17T01:30:00Z", now)).toBe("ontem");
    expect(whenLabel("2026-11-17T13:05:00-03:00", now)).toBe("13:05");
    expect(startedLabel("2026-11-17T13:05:00-03:00", now)).toBe("Hoje, 13:05");
    expect(startedLabel("2026-10-03T08:00:00-03:00", now)).toBe("3 de out, 08:00");
  });

  it("traduz as consultas do Guará e não mostra o nome técnico de uma nova", () => {
    expect(toolLabel("list_goals")).toBe("suas metas");
    expect(toolLabel("tool_nova")).toBe("seus dados");
  });
});
