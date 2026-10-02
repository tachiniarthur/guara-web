/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4: o plugin lê o tema a partir do CSS de entrada.
  tailwindStylesheet: "./apps/web/src/app/globals.css",
  tailwindFunctions: ["cn", "cva"],
};
