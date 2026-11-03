import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

// Fraunces (serifada calorosa) para números e títulos; Figtree (humanista) para ler e tocar.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guará",
  description: "Finanças pessoais para o Brasil.",
};

/** A barra do navegador no celular acompanha o fundo do app (tema escuro). */
export const viewport: Viewport = {
  themeColor: "#0b110e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`dark ${fraunces.variable} ${figtree.variable} h-full`}>
      {/* Extensões de navegador (ex.: ColorZilla) injetam atributos no body antes da hidratação. */}
      <body className="min-h-full" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
