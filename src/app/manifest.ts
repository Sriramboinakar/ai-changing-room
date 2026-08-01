import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "AI Changing Room",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
