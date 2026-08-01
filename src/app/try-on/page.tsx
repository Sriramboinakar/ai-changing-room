import type { Metadata } from "next";

import { StudioHeader } from "@/components/tryon/studio-header";
import { TryOnStudio } from "@/components/tryon/tryon-studio";

export const metadata: Metadata = {
  title: "AI Try-On Studio",
  description:
    "Upload your photo, pick a garment, and see an AI-generated preview of how it looks on you — in seconds. Free demo.",
};

export default function TryOnPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <StudioHeader />
      <TryOnStudio />
    </main>
  );
}
