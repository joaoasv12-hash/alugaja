import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AlugaJá — Aluguel de imóveis direto",
    template: "%s | AlugaJá",
  },
  description:
    "Marketplace de aluguel que conecta locadores e locatários diretamente. Anuncie grátis, negocie com segurança e feche contratos digitais.",
  keywords: ["aluguel", "imóveis", "apartamento", "casa", "locação", "locatário", "locador"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AlugaJá",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
