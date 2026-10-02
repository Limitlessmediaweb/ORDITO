import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Badge from "@/components/Badge";
import Ago from "@/components/Ago";
import Metro from "@/components/Metro";
import Filo from "@/components/Filo";
import Fondo from "@/components/Fondo";
import GLMount from "@/components/gl/GLMount";
import { TendaSignal } from "@/components/TendaLink";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "ORDITO — Ogni capo inizia da un filo", template: "%s — ORDITO" },
  description:
    "ORDITO, brand italiano di abbigliamento tecnico-urbano. Mostriamo come sono fatti i capi: materiali dichiarati, lavorazione esposta. Concept di LIMITLESS.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "ORDITO",
    title: "ORDITO — Ogni capo inizia da un filo",
    description: "Il dietro le quinte diventa lo spettacolo. Concept di LIMITLESS.",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#D9D6D0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${anton.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll>
          <Fondo />
          <Header />
          {children}
          <TendaSignal />
          <GLMount />
          <Filo />
          <Metro />
          <Badge />
          <Ago />
        </SmoothScroll>
      </body>
    </html>
  );
}
