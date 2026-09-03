"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Images,
  Maximize2,
  RefreshCw,
  Share2,
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
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { downloadImageAsPng } from "@/lib/image/export";
import { loadImageElement } from "@/lib/image/file";
import { cn } from "@/lib/utils";

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

type ViewMode = "result" | "compare" | "side";

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: typeof Sparkles }[] = [
  { value: "result", label: "Result", icon: Sparkles },
  { value: "compare", label: "Before & After", icon: Images },
  { value: "side", label: "Side by side", icon: Wand2 },
];

async function imageToPngBlob(src: string): Promise<Blob> {
  const image = await loadImageElement(src);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");
  context.drawImage(image, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG encoding failed.");
  return blob;
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
  const [sharing, setSharing] = useState(false);
  const [view, setView] = useState<ViewMode>("result");
  const reduceMotion = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;

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

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await imageToPngBlob(result.imageUrl);
      const file = new File([blob], "my-ai-look.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My AI look",
          text: `See me in ${garmentName} — generated with AI Changing Room.`,
        });
      } else if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Copied", { description: "Your look is copied to the clipboard." });
      } else {
        toast.info("Sharing isn't supported here", {
          description: "Use Download PNG instead.",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      toast.error("Share failed", { description: "Use Download PNG instead." });
    } finally {
      setSharing(false);
    }
  };

  const heroCard =
    "border-border/70 bg-card relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl shadow-black/10 dark:shadow-black/40";

  return (
    <div className="flex flex-col items-center gap-8">
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

      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <div className="bg-muted/70 grid w-full grid-cols-3 gap-1 rounded-2xl p-1">
          {VIEW_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = view === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                aria-pressed={active}
                className={cn(
                  "flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-medium transition-all duration-200 sm:text-sm",
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">
                  {option.value === "compare" ? "Compare" : option.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className={heroCard}>
          <AnimatePresence mode="wait">
            {view === "result" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985 }}
                transition={{ duration: 0.45, ease }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={result.imageUrl}
                    alt="AI try-on result"
                    fill
                    sizes="(max-width: 640px) 100vw, 448px"
                    className="object-cover object-top"
                    priority
                  />
                  <span className="bg-accent text-accent-foreground absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
                    AI Try-On
                  </span>
                  <div
                    className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/15 to-transparent p-5"
                    aria-hidden="true"
                  >
                    <span className="font-heading text-lg font-semibold text-white">
                      {garmentName}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                      On you
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {view === "compare" ? (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease }}
                className="relative aspect-[3/4] w-full"
              >
                <BeforeAfterSlider
                  beforeUrl={customerImage}
                  afterUrl={result.imageUrl}
                  beforeAlt="Your original photo"
                  afterAlt="AI try-on result"
                  beforeLabel="Your photo"
                  afterLabel="AI try-on"
                  className="absolute inset-0 h-full w-full"
                />
              </motion.div>
            ) : null}

            {view === "side" ? (
              <motion.div
                key="side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 grid grid-cols-2"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={customerImage}
                    alt="Your original photo"
                    fill
                    sizes="50vw"
                    className="object-cover object-top"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    Your photo
                  </span>
                </div>
                <div className="relative h-full w-full">
                  <Image
                    src={result.imageUrl}
                    alt="AI try-on result"
                    fill
                    sizes="50vw"
                    className="object-cover object-top"
                  />
                  <span className="bg-accent text-accent-foreground absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
                    AI Try-On
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          className="h-12 rounded-xl bg-foreground px-6 text-background shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download />
          {downloading ? "Preparing…" : "Download PNG"}
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-xl px-6"
          onClick={() => void handleShare()}
          disabled={sharing}
        >
          <Share2 />
          {sharing ? "Preparing…" : "Share"}
        </Button>
        <Button variant="outline" className="h-12 rounded-xl px-6" onClick={() => setFullscreenOpen(true)}>
          <Maximize2 />
          Fullscreen
        </Button>
        <Button variant="outline" className="h-12 rounded-xl px-6" onClick={onGenerateAgain}>
          <RefreshCw />
          Generate again
        </Button>
        <Button variant="ghost" className="h-12 rounded-xl px-6" onClick={onReplaceGarment}>
          <Shirt />
          Replace garment
        </Button>
        <Button variant="ghost" className="h-12 rounded-xl px-6" onClick={onReplacePhoto}>
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
          <Button
            className="w-full rounded-xl bg-foreground text-background shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download />
            {downloading ? "Preparing…" : "Download PNG"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}