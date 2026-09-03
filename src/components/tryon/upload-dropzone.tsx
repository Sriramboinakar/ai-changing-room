"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Pencil, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_TYPES,
  isAcceptedImageType,
  isWithinSizeLimit,
  compressImage,
} from "@/lib/image/file";

interface UploadDropzoneProps {
  value: string | null;
  previewAlt: string;
  label: string;
  hint: string;
  onFileSelected: (dataUrl: string) => void;
  onRemove: () => void;
  onEdit?: () => void;
  editLabel?: string;
  className?: string;
}

export function UploadDropzone({
  value,
  previewAlt,
  label,
  hint,
  onFileSelected,
  onRemove,
  onEdit,
  editLabel = "Edit",
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!isAcceptedImageType(file.type)) {
      toast.error("Unsupported format", {
        description: `Please upload a ${ACCEPTED_IMAGE_TYPES.join(", ")} image.`,
      });
      return;
    }

    if (!isWithinSizeLimit(file.size)) {
      toast.error("Image too large", { description: "Please upload an image under 10 MB." });
      return;
    }

    try {
      const compressed = await compressImage(file);
      onFileSelected(compressed.dataUrl);
    } catch {
      toast.error("Something went wrong", {
        description: "Could not process that image. Please try another one.",
      });
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    void handleFile(file);
  };

  if (value) {
    return (
      <div
        className={cn(
          "border-border bg-card flex items-center gap-4 rounded-2xl border p-3",
          className
        )}
      >
        <div className="border-border relative size-20 shrink-0 overflow-hidden rounded-xl border shadow-sm">
          <Image src={value} alt={previewAlt} fill sizes="5rem" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate text-sm font-medium">{label}</p>
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={onEdit}
              >
                <Pencil />
                {editLabel}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive h-8 rounded-lg text-xs"
              onClick={onRemove}
            >
              <Trash2 />
              Remove
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "focus-visible:ring-ring relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-primary/40 bg-card/60 hover:border-primary hover:bg-card",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="from-accent/10 to-transparent pointer-events-none absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full bg-gradient-to-b blur-3xl"
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
      <span
        className={cn(
          "bg-primary text-accent flex size-14 items-center justify-center rounded-2xl shadow-md shadow-primary/15 transition-transform duration-300",
          dragging ? "scale-110" : "group-hover:scale-105"
        )}
      >
        <UploadCloud className="size-6" aria-hidden="true" />
      </span>
      <span className="relative flex flex-col gap-1">
        <span className="text-base font-semibold">
          Upload your photo{" "}
          <span className="text-muted-foreground font-normal">or tap to browse</span>
        </span>
        {hint ? <span className="text-muted-foreground text-sm">{hint}</span> : null}
      </span>
      <span className="border-border bg-background text-muted-foreground relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
        <ImagePlus className="size-3.5" aria-hidden="true" />
        JPG · PNG · WEBP — up to 10 MB
      </span>
    </div>
  );
}