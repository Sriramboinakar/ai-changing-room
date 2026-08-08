import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { siteConfig } from "@/config/site";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI virtual try-on",
    "virtual fitting room",
    "AI fashion",
    "try on clothes online",
    "clothing store demo",
    "AI changing room",
  ],
  authors: [{ name: "AI Changing Room" }],
  creator: "AI Changing Room",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#7A1226",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <a
          href="#main-content"
          className="bg-accent text-accent-foreground focus-visible:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
