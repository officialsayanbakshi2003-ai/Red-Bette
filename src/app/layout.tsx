import type { Metadata, Viewport } from "next";
import { Inter, Saira } from "next/font/google";
import { CartHydrator } from "@/components/cart/CartHydrator";
import { RevealObserver } from "@/components/Reveal";
import { Toaster } from "@/components/Toaster";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const saira = Saira({
  subsets: ["latin"],
  variable: "--font-saira",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${saira.variable} ${inter.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <RevealObserver />
        <CartHydrator />
      </body>
    </html>
  );
}
