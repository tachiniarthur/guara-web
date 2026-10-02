/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4: o plugin lê o tema a partir do CSS de entrada.
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "cva"],
};

export default config;
