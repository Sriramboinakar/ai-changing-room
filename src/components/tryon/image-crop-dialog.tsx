"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { MAX_ZOOM, MIN_ZOOM, nextRotation, renderCrop, type CropTransform } from "@/lib/image/crop";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  onConfirm: (croppedDataUrl: string) => void;
}

const PREVIEW_WIDTH = 420;

export function ImageCropDialog({ open, onOpenChange, imageUrl, onConfirm }: ImageCropDialogProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<CropTransform>({ zoom: MIN_ZOOM, rotationDeg: 0 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTransform({ zoom: MIN_ZOOM, rotationDeg: 0 });
  }, [open]);

  useEffect(() => {
    if (!open || !imageUrl || !previewRef.current) return;
    let cancelled = false;

    renderCrop(imageUrl, transform, PREVIEW_WIDTH).then((dataUrl) => {
      if (cancelled || !previewRef.current) return;
      const image = new Image();
      image.onload = () => {
        if (cancelled) return;
        const context = previewRef.current?.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_WIDTH / (3 / 4));
        context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
      };
      image.src = dataUrl;
    });

    return () => {
      cancelled = true;
    };
  }, [open, imageUrl, transform]);

  const handleConfirm = async () => {
    if (!imageUrl || processing) return;
    setProcessing(true);
    try {
      const cropped = await renderCrop(imageUrl, transform);
      onConfirm(cropped);
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
          <DialogDescription>
            Zoom and rotate to frame yourself — the perfect fit starts here.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border bg-muted/50 mx-auto flex w-full max-w-[340px] items-center justify-center rounded-2xl border p-3">
          <canvas
            ref={previewRef}
            width={PREVIEW_WIDTH}
            height={PREVIEW_WIDTH / (3 / 4)}
            className="bg-card w-full rounded-xl"
            aria-label="Cropped photo preview"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              className="h-10 shrink-0 rounded-xl"
              onClick={() =>
                setTransform((current) => ({
                  ...current,
                  rotationDeg: nextRotation(current.rotationDeg),
                }))
              }
            >
              <RotateCw />
              Rotate
            </Button>
            <span className="text-muted-foreground text-xs">Portrait 3:4</span>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <Slider
              aria-label="Zoom level"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={[transform.zoom]}
              onValueChange={([zoom]) => setTransform((current) => ({ ...current, zoom }))}
              className="flex-1"
            />
            <ZoomIn className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={() => void handleConfirm()} disabled={processing}>
            {processing ? "Applying…" : "Apply crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
