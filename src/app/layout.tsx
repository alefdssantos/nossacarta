import type { Metadata } from "next";
import { Allura, Cormorant_Garamond, Lora, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CookieBanner } from "@/components/CookieBanner";
import { MetaPixel } from "@/components/MetaPixel";

const allura = Allura({
  variable: "--font-allura",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NossaCarta — Uma carta eterna pra vocês",
  description:
    "Crie um site único com a história de vocês. Contador, fotos, música, declaração e cápsulas do tempo. O presente que ela vai guardar pra sempre.",
  metadataBase: new URL("https://nossacarta.love"),
  openGraph: {
    title: "NossaCarta — Uma carta eterna pra vocês",
    description: "O presente que ela vai guardar pra sempre.",
    url: "https://nossacarta.love",
    siteName: "NossaCarta",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${allura.variable} ${cormorant.variable} ${lora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
        <CookieBanner />
        <MetaPixel />
        <SpeedInsights />
      </body>
    </html>
  );
}
