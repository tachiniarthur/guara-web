/**
 * Gera os pontos de terra do globo interativo (Investimentos › Onde seu dinheiro está no mundo).
 * Cada ponto guarda latitude, longitude e o país (código ISO 3166 numérico), para o globo
 * pintar os países onde o usuário tem investimentos.
 *
 * Uso: node scripts/generate-globe-dots.mjs
 * Saída: src/features/investimentos/globe/dots.ts (não editar à mão)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

import { geoBounds, geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = JSON.parse(
  readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
);
const countries = feature(topology, topology.objects.countries).features.map((f) => ({
  code: Number(f.id) || 0,
  feature: f,
  bounds: geoBounds(f),
}));

/** Espaçamento em graus (≈ área igual: a longitude abre perto dos polos). */
const STEP = 1.8;

function inBounds([[w, s], [e, n]], lng, lat) {
  if (lat < s || lat > n) return false;
  return w <= e ? lng >= w && lng <= e : lng >= w || lng <= e; // atravessa o antimeridiano
}

const dots = [];
for (let lat = -58; lat <= 84; lat += STEP) {
  const step = STEP / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  const offset = (Math.round(lat / STEP) % 2) * (step / 2); // fileiras alternadas, como uma colmeia
  for (let lng = -180 + offset; lng < 180; lng += step) {
    const hit = countries.find(
      (c) => inBounds(c.bounds, lng, lat) && geoContains(c.feature, [lng, lat]),
    );
    if (hit) dots.push(Math.round(lat * 10), Math.round(lng * 10), hit.code);
  }
}

const out = `// Gerado por scripts/generate-globe-dots.mjs a partir do world-atlas (110m). Não editar à mão.
/** Pontos de terra em trincas: latitude×10, longitude×10, país (ISO 3166 numérico). */
export const GLOBE_DOTS = new Int16Array([${dots.join(",")}]);
`;
writeFileSync("src/features/investimentos/globe/dots.ts", out);
console.log(`${dots.length / 3} pontos, ${(out.length / 1024).toFixed(1)} KB`);
