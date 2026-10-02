import { mkdirSync, writeFileSync } from "node:fs";

import { toCss } from "../src/css.ts";

const outDir = new URL("../dist/", import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL("tokens.css", outDir), toCss());
console.log("ui-tokens: dist/tokens.css gerado");
