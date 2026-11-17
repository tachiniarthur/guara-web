import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "h"; text: string };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^\s*#{1,6}\s+/;

/** Parágrafos, listas e títulos do texto do Guará (o pouco de Markdown que o modelo usa). */
export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    const last = blocks.at(-1);
    if (!line.trim()) {
      if (last) blocks.push({ kind: "p", lines: [] });
      continue;
    }
    if (HEADING.test(line)) {
      blocks.push({ kind: "h", text: line.replace(HEADING, "") });
    } else if (BULLET.test(line) || NUMBERED.test(line)) {
      const kind = BULLET.test(line) ? "ul" : "ol";
      const item = line.replace(kind === "ul" ? BULLET : NUMBERED, "");
      if (last?.kind === kind) last.items.push(item);
      else blocks.push({ kind, items: [item] });
    } else if (last?.kind === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  return blocks.filter((b) => b.kind !== "p" || b.lines.length > 0);
}

/** `**negrito**` vira <strong>; o resto é texto (nada de HTML vindo da resposta). */
export function inline(text: string): ReactNode {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

/** Texto do Guará com parágrafos, listas e negrito. `trailing` vai no fim (ex.: cursor). */
export function RichText({
  text,
  className,
  trailing,
}: {
  text: string;
  className?: string;
  trailing?: ReactNode;
}) {
  const blocks = parseBlocks(text);
  const lastIndex = blocks.length - 1;
  return (
    <div className={cn("flex flex-col gap-2.5 break-words", className)}>
      {blocks.map((block, i) => {
        const end = i === lastIndex ? trailing : null;
        if (block.kind === "h") {
          return (
            <p key={i} className="m-0 font-bold">
              {inline(block.text)}
              {end}
            </p>
          );
        }
        if (block.kind === "p") {
          return (
            <p key={i} className="m-0">
              {block.lines.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(line)}
                </Fragment>
              ))}
              {end}
            </p>
          );
        }
        const List = block.kind;
        return (
          <List
            key={i}
            className={cn(
              "m-0 flex flex-col gap-1 pl-5",
              List === "ul" ? "list-disc" : "list-decimal",
            )}
          >
            {block.items.map((item, j) => (
              <li key={j}>
                {inline(item)}
                {j === block.items.length - 1 && end}
              </li>
            ))}
          </List>
        );
      })}
      {blocks.length === 0 && trailing}
    </div>
  );
}
