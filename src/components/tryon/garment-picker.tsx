"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, Shirt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/components/tryon/upload-dropzone";
import { cn } from "@/lib/utils";
import { DEMO_GARMENTS, searchGarments, type SelectedGarment } from "@/lib/tryon/garments";

interface GarmentPickerProps {
  value: SelectedGarment | null;
  onSelect: (garment: SelectedGarment | null) => void;
}

export function GarmentPicker({ value, onSelect }: GarmentPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchGarments(query, DEMO_GARMENTS), [query]);

  return (
    <Tabs defaultValue="demo" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-xl">
        <TabsTrigger value="demo" className="rounded-lg">
          Demo wardrobe
        </TabsTrigger>
        <TabsTrigger value="upload" className="rounded-lg">
          Upload yours
        </TabsTrigger>
      </TabsList>

      <TabsContent value="demo" className="mt-4 flex flex-col gap-4 focus-visible:outline-none">
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search garments…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded-xl pr-4 pl-9"
            aria-label="Search demo garments"
          />
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((garment) => {
              const selected = value?.id === garment.id;
              return (
                <button
                  key={garment.id}
                  onClick={() =>
                    onSelect({
                      id: garment.id,
                      name: garment.name,
                      imageUrl: garment.imageUrl,
                      isCustom: false,
                    })
                  }
                  aria-pressed={selected}
                  className={cn(
                    "group bg-card focus-visible:ring-ring relative flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none",
                    selected
                      ? "border-accent shadow-accent/10 ring-accent shadow-lg ring-1"
                      : "border-border hover:border-accent/50 hover:shadow-md"
                  )}
                >
                  <div className="bg-muted relative aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      src={garment.imageUrl}
                      alt={garment.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {selected ? (
                      <span className="bg-accent text-accent-foreground absolute top-2 right-2 flex size-6 items-center justify-center rounded-full shadow-lg">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                  <span className="flex flex-col px-1 pb-1">
                    <span className="truncate text-sm font-medium">{garment.name}</span>
                    <Badge
                      variant="secondary"
                      className="mt-1 w-fit rounded-full text-[10px] font-medium"
                    >
                      {garment.category}
                    </Badge>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-card/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
            <Shirt className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="text-sm font-medium">No garments found</p>
            <p className="text-muted-foreground text-xs">
              Try a different search, or upload your own.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="mt-4 focus-visible:outline-none">
        <UploadDropzone
          value={value?.isCustom ? value.imageUrl : null}
          previewAlt={value?.name ?? "Uploaded garment"}
          label={value?.isCustom ? value.name : "Your garment"}
          hint="Upload a clear photo of the clothing item on a plain background."
          onFileSelected={(dataUrl) =>
            onSelect({
              id: `custom-${Date.now()}`,
              name: "Your garment",
              imageUrl: dataUrl,
              isCustom: true,
            })
          }
          onRemove={() => onSelect(null)}
        />
        <p className="text-muted-foreground mt-3 text-center text-xs">
          Uploading is optional — the demo wardrobe works great too.
        </p>
      </TabsContent>
    </Tabs>
  );
}
