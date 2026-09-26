import type { Metadata, Viewport } from "next";
import { Archivo, Manrope } from "next/font/google";
import { CartHydrator } from "@/components/cart/CartHydrator";
import { RevealObserver } from "@/components/Reveal";
import { Toaster } from "@/components/Toaster";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Streetwear | ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["Red Betta", "streetwear", "hoodies", "oversized t-shirts", "Indian streetwear", "premium hoodies India"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <RevealObserver />
        <CartHydrator />
      </body>
    </html>
  );
}
