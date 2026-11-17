/** Um evento de Server-Sent Events: o nome (`event:`) e o JSON de `data:`. */
export type SseEvent = { event: string; data: unknown };

/**
 * Lê um corpo `text/event-stream` e devolve os eventos na ordem em que chegam. Cada evento termina
 * numa linha em branco; `data:` em várias linhas se junta com quebra de linha. Evento sem `data:`
 * ou com JSON inválido é ignorado (comentários `:` também).
 */
export async function* readSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end: number;
      while ((end = blockEnd(buffer)) !== -1) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end).replace(/^(\r?\n){1,2}/, "");
        const parsed = parseBlock(block);
        if (parsed) yield parsed;
      }
    }
    const last = parseBlock(buffer + decoder.decode());
    if (last) yield last;
  } finally {
    reader.releaseLock();
  }
}

/** Onde termina o primeiro evento completo (antes da linha em branco), ou -1. */
function blockEnd(buffer: string) {
  const match = /\r?\n\r?\n/.exec(buffer);
  return match ? match.index : -1;
}

function parseBlock(block: string): SseEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (data.length === 0) return null;
  try {
    return { event, data: JSON.parse(data.join("\n")) as unknown };
  } catch {
    return null;
  }
}
