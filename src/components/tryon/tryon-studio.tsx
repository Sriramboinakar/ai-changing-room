"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ImagePlus, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadDropzone } from "@/components/tryon/upload-dropzone";
import { ImageCropDialog } from "@/components/tryon/image-crop-dialog";
import { GarmentPicker } from "@/components/tryon/garment-picker";
import { GenerationOverlay } from "@/components/tryon/generation-overlay";
import { ResultView, type TryOnResultDto } from "@/components/tryon/result-view";
import { useTryOn } from "@/hooks/use-tryon";
import type { SelectedGarment } from "@/lib/tryon/garments";
import { clearSession, loadSession, saveSession } from "@/lib/tryon/session";
import { cn } from "@/lib/utils";

type Stage = "setup" | "generating" | "result";

export function TryOnStudio() {
  const [customerImage, setCustomerImage] = useState<string | null>(null);
  const [customerRawImage, setCustomerRawImage] = useState<string | null>(null);
  const [garment, setGarment] = useState<SelectedGarment | null>(null);
  const [result, setResult] = useState<TryOnResultDto | null>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [error, setError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);

  const tryOn = useTryOn();
  const { stage: tryOnStage, result: tryOnResult, error: tryOnError, notice: tryOnNotice, reset: resetTryOn } = tryOn;

  useEffect(() => {
    const session = loadSession();
    setCustomerImage(session.customerImage);
    setCustomerRawImage(session.customerRawImage);
    if (session.garmentImage && session.garmentName) {
      setGarment({
        id: session.garmentId ?? "restored",
        name: session.garmentName,
        imageUrl: session.garmentImage,
        isCustom: !session.garmentId,
      });
    }
    if (session.resultImage) {
      setResult({
        imageUrl: session.resultImage,
        provider: session.resultProvider ?? "mock",
        durationMs: session.resultDurationMs ?? 0,
      });
      setStage("result");
    }
  }, []);

  useEffect(() => {
    saveSession({
      customerImage,
      customerRawImage,
      garmentId: garment?.id ?? null,
      garmentName: garment?.name ?? null,
      garmentImage: garment?.imageUrl ?? null,
      resultImage: result?.imageUrl ?? null,
      resultProvider: result?.provider ?? null,
      resultDurationMs: result?.durationMs ?? null,
    });
  }, [customerImage, customerRawImage, garment, result]);

  useEffect(() => {
    if (tryOnStage === "done") {
      if (tryOnResult) {
        setResult(tryOnResult);
        if (tryOnNotice) {
          toast.info("Demo Mode", { description: tryOnNotice });
        }
      }
      setStage("result");
      setGenerating(false);
      generatingRef.current = false;
      resetTryOn();
    } else if (tryOnStage === "failed") {
      setError(tryOnError ?? "Generation failed.");
      setStage("setup");
      setGenerating(false);
      generatingRef.current = false;
      resetTryOn();
    }
  }, [tryOnStage, tryOnResult, tryOnError, tryOnNotice, resetTryOn]);

  const handleCustomerSelected = (dataUrl: string) => {
    setCustomerRawImage(dataUrl);
    setCropOpen(true);
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setCustomerImage(croppedDataUrl);
    setResult(null);
    setStage("setup");
  };

  const handleRemoveCustomer = () => {
    setCustomerImage(null);
    setCustomerRawImage(null);
    setResult(null);
    setStage("setup");
  };

  const handleGarmentSelected = (selected: SelectedGarment | null) => {
    setGarment(selected);
    if (selected) {
      setResult(null);
      setError(null);
      if (customerImage) {
        tryOn.cancel();
        setStage("generating");
        setTimeout(() => void generate(selected), 0);
      } else {
        setStage("setup");
      }
    } else {
      setStage("setup");
    }
  };

  const generate = async (garmentToTryOn: SelectedGarment | null = garment) => {
    if (!customerImage || !garmentToTryOn || generatingRef.current) return;

    generatingRef.current = true;
    setError(null);
    setGenerating(true);
    setStage("generating");

    await tryOn.start({
      customerImageUrl: customerImage,
      garmentImageUrl: garmentToTryOn.imageUrl,
      garmentName: garmentToTryOn.name,
    });
  };

  const handleCancel = () => {
    tryOn.cancel();
    setStage("setup");
    setGenerating(false);
    generatingRef.current = false;
    toast.info("Generation cancelled", {
      description: "Your uploads are still here when you're ready.",
    });
  };

  const handleStartOver = () => {
    tryOn.reset();
    setCustomerImage(null);
    setCustomerRawImage(null);
    setGarment(null);
    setResult(null);
    setError(null);
    setStage("setup");
    clearSession();
    toast.info("Started fresh", { description: "The studio is ready for a new look." });
  };

  const canGenerate = Boolean(customerImage && garment && !generating);

  return (
    <div className="container-page py-10 pb-28">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col items-start gap-3">
          <span className="bg-accent/15 text-accent-strong inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Wand2 className="size-3.5" aria-hidden="true" />
            AI Try-On Studio
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {result && stage === "result" ? "Your look, ready." : "Dress yourself in seconds."}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload your photo, browse the store catalog, and let AI show you how each garment
            looks on you — switch garments freely without re-uploading.
          </p>
        </div>

        {stage === "setup" ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/70 bg-card flex flex-col gap-4 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="bg-primary text-accent flex size-8 items-center justify-center rounded-full text-sm font-bold"
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <h2 className="font-heading text-lg font-semibold">Your photo</h2>
                </div>

                {customerImage ? (
                  <div className="flex flex-col gap-3">
                    <div className="border-border relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-2xl border">
                      <Image
                        src={customerImage}
                        alt="Your cropped photo"
                        fill
                        sizes="260px"
                        className="object-cover object-top"
                      />
                    </div>
                    <UploadDropzone
                      value={customerImage}
                      previewAlt="Your cropped photo"
                      label="Your photo"
                      hint=""
                      onFileSelected={handleCustomerSelected}
                      onRemove={handleRemoveCustomer}
                      onEdit={() => setCropOpen(true)}
                      editLabel="Recrop"
                    />
                  </div>
                ) : (
                  <UploadDropzone
                    value={null}
                    previewAlt=""
                    label="Upload your photo"
                    hint="Standing, front-facing photos work best."
                    onFileSelected={handleCustomerSelected}
                    onRemove={handleRemoveCustomer}
                  />
                )}
              </Card>

              <Card className="border-border/70 bg-card flex flex-col gap-4 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span
                    className="bg-primary text-accent flex size-8 items-center justify-center rounded-full text-sm font-bold"
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <h2 className="font-heading text-lg font-semibold">Pick the garment</h2>
                </div>
                <GarmentPicker value={garment} onSelect={handleGarmentSelected} />
              </Card>
            </div>

            {error ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3 rounded-2xl border p-4 text-sm"
              >
                <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => void generate()}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <div className="sticky bottom-4 z-30">
              <div className="border-border/70 bg-card/90 flex flex-col gap-4 rounded-3xl border p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  {customerImage ? (
                    <span className="border-border relative size-12 shrink-0 overflow-hidden rounded-xl border">
                      <Image
                        src={customerImage}
                        alt=""
                        fill
                        sizes="3rem"
                        className="object-cover object-top"
                      />
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                      <ImagePlus className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  {garment ? (
                    <span className="border-border relative size-12 shrink-0 overflow-hidden rounded-xl border">
                      <Image
                        src={garment.imageUrl}
                        alt=""
                        fill
                        sizes="3rem"
                        className="object-cover object-top"
                      />
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
                      <Sparkles className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {customerImage && garment
                        ? `${garment.name} on your photo`
                        : customerImage
                          ? "Now pick a garment"
                          : garment
                            ? "Now add your photo"
                            : "Add a photo and a garment to begin"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Free demo · AI-generated · usually under a minute
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className={cn(
                      "h-12 flex-1 rounded-2xl px-6 text-base sm:flex-none",
                      !canGenerate && "pointer-events-none opacity-40"
                    )}
                    onClick={() => void generate()}
                    disabled={!canGenerate}
                  >
                    <Sparkles />
                    Generate my look
                  </Button>
                  {result ? (
                    <Button
                      variant="ghost"
                      className="h-12 rounded-2xl px-4"
                      onClick={handleStartOver}
                      title="Clear everything"
                    >
                      Start over
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {stage === "result" && result ? (
          <>
            <ResultView
              customerImage={customerImage ?? ""}
              garmentName={garment?.name ?? "your outfit"}
              result={result}
              onGenerateAgain={() => void generate()}
              onReplaceGarment={() => {
                setGarment(null);
                setStage("setup");
              }}
              onReplacePhoto={() => {
                setCustomerImage(null);
                setCustomerRawImage(null);
                setStage("setup");
              }}
            />
            <div className="flex justify-center">
              <Button
                variant="ghost"
                className="text-muted-foreground rounded-xl"
                onClick={handleStartOver}
              >
                Start a new look
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <GenerationOverlay
        open={stage === "generating"}
        customerImage={customerImage ?? ""}
        garmentImage={garment?.imageUrl ?? ""}
        garmentName={garment?.name ?? "your outfit"}
        queuePosition={tryOn.queuePosition}
        onCancel={handleCancel}
      />

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={setCropOpen}
        imageUrl={customerRawImage}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
