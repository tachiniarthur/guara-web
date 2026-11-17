import { describe, expect, it } from "vitest";

import { readSse, type SseEvent } from "./sse";

/** Um corpo que chega nestes pedaços (cortados em qualquer lugar). */
function body(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function all(chunks: string[]) {
  const events: SseEvent[] = [];
  for await (const event of readSse(body(chunks))) events.push(event);
  return events;
}

describe("readSse", () => {
  it("lê os eventos na ordem, mesmo com o evento cortado entre pedaços", async () => {
    const events = await all([
      'event: delta\ndata: {"text":"Oi"}\n\nevent: del',
      'ta\ndata: {"text":", tudo',
      ' bem?"}\n\nevent: done\ndata: {}\n\n',
    ]);
    expect(events).toEqual([
      { event: "delta", data: { text: "Oi" } },
      { event: "delta", data: { text: ", tudo bem?" } },
      { event: "done", data: {} },
    ]);
  });

  it("ignora comentários, eventos sem dados e JSON inválido; lê o último sem linha em branco", async () => {
    const events = await all([
      ": ping\n\nevent: x\n\nevent: y\ndata: {quebrado\n\n",
      'event: reply\r\ndata: {"ok":true}',
    ]);
    expect(events).toEqual([{ event: "reply", data: { ok: true } }]);
  });
});
