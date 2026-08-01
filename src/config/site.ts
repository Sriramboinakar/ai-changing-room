export const siteConfig = {
  name: "AI Changing Room",
  shortName: "AI CR",
  description:
    "Try on outfits virtually before you buy. Upload your photo, pick a garment, and let AI show you how it looks — instantly.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    tryOn: "/try-on",
  },
} as const;

export type SiteConfig = typeof siteConfig;
