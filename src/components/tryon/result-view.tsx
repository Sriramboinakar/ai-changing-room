"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Images,
  Maximize2,
  RefreshCw,
  Shirt,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { downloadImageAsPng } from "@/lib/image/export";

export interface TryOnResultDto {
  imageUrl: string;
  provider: string;
  durationMs: number;
}

interface ResultViewProps {
  customerImage: string;
  garmentName: string;
  result: TryOnResultDto;
  onGenerateAgain: () => void;
  onReplaceGarment: () => void;
  onReplacePhoto: () => void;
}

export function ResultView({
  customerImage,
  garmentName,
  result,
  onGenerateAgain,
  onReplaceGarment,
  onReplacePhoto,
}: ResultViewProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImageAsPng(result.imageUrl, `ai-changing-room-${Date.now()}.png`);
      toast.success("Downloaded", { description: "Your try-on image is saved as a PNG." });
    } catch {
      toast.error("Download failed", { description: "Please try again in a moment." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <span className="bg-accent/15 text-accent-strong mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <Sparkles className="size-3.5" aria-hidden="true" />
          AI Result Ready
        </span>
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          You in {garmentName}
        </h2>
        <p className="text-muted-foreground text-sm">
          Generated with the {result.provider} provider in {(result.durationMs / 1000).toFixed(1)}{" "}
          seconds
        </p>
      </div>

      <Tabs defaultValue="compare" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-xs grid-cols-2 rounded-xl">
          <TabsTrigger value="compare" className="rounded-lg">
            <Images className="size-4" aria-hidden="true" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="side" className="rounded-lg">
            <Wand2 className="size-4" aria-hidden="true" />
            Side by side
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compare" className="mt-6 focus-visible:outline-none">
          <BeforeAfterSlider
            beforeUrl={customerImage}
            afterUrl={result.imageUrl}
            beforeAlt="Your original photo"
            afterAlt="AI try-on result"
            className="border-border bg-card relative mx-auto aspect-[3/4] w-full max-w-lg rounded-[2rem] border shadow-xl shadow-black/10 dark:shadow-black/30"
          />
        </TabsContent>

        <TabsContent value="side" className="mt-6 focus-visible:outline-none">
          <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
            <figure className="border-border bg-card overflow-hidden rounded-3xl border shadow-sm">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={customerImage}
                  alt="Your original photo"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">Original</span>
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                  Your photo
                </span>
              </figcaption>
            </figure>
            <figure className="border-accent/50 bg-card shadow-accent/10 overflow-hidden rounded-3xl border shadow-lg">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={result.imageUrl}
                  alt="AI try-on result"
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className="object-cover object-top"
                />
                <span className="bg-accent text-accent-foreground absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow">
                  AI Result
                </span>
              </div>
              <figcaption className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{garmentName}</span>
                <span className="bg-accent/15 text-accent-strong rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Mock AI
                </span>
              </figcaption>
            </figure>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button className="h-11 rounded-xl px-6" onClick={handleDownload} disabled={downloading}>
          <Download />
          {downloading ? "Preparing…" : "Download PNG"}
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-xl px-6"
          onClick={() => setFullscreenOpen(true)}
        >
          <Maximize2 />
          Fullscreen
        </Button>
        <Button variant="outline" className="h-11 rounded-xl px-6" onClick={onGenerateAgain}>
          <RefreshCw />
          Generate again
        </Button>
        <Button variant="ghost" className="h-11 rounded-xl px-6" onClick={onReplaceGarment}>
          <Shirt />
          Replace garment
        </Button>
        <Button variant="ghost" className="h-11 rounded-xl px-6" onClick={onReplacePhoto}>
          <ArrowLeft />
          Replace photo
        </Button>
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-4xl gap-4">
          <DialogHeader>
            <DialogTitle>AI try-on result</DialogTitle>
            <DialogDescription>{garmentName} — full resolution preview.</DialogDescription>
          </DialogHeader>
          <div className="border-border relative mx-auto aspect-[3/4] w-full max-w-xl overflow-hidden rounded-2xl border">
            <Image
              src={result.imageUrl}
              alt="AI try-on result — fullscreen preview"
              fill
              sizes="(max-width: 768px) 100vw, 576px"
              className="object-cover object-top"
            />
          </div>
          <Button className="w-full rounded-xl" onClick={handleDownload} disabled={downloading}>
            <Download />
            {downloading ? "Preparing…" : "Download PNG"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
