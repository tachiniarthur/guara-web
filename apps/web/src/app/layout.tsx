import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

// TODO(identidade-visual): fonte neutra provisória.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Guará",
  description: "Finanças pessoais para o Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
