"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, Shirt, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GARMENT_CATEGORIES } from "@/lib/tryon/categories";
import type { SelectedGarment } from "@/lib/tryon/garments";

interface GarmentPickerProps {
  value: SelectedGarment | null;
  onSelect: (garment: SelectedGarment | null) => void;
}

type CatalogItem = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  imageUrl: string;
};

export function GarmentPicker({ value, onSelect }: GarmentPickerProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const storesRes = await fetch("/api/stores");
        const storesJson = await storesRes.json();
        if (!storesJson.success || storesJson.data.length === 0) {
          if (!cancelled) {
            setError("No stores available yet.");
            setLoading(false);
          }
          return;
        }
        const store = storesJson.data.find(
          (candidate: { slug: string }) => candidate.slug === "demo"
        ) ?? storesJson.data[0];
        const catalogRes = await fetch(`/api/stores/${store.slug}/catalog`);
        const catalogJson = await catalogRes.json();
        if (!cancelled) {
          if (catalogJson.success) {
            setItems(catalogJson.data.items);
            setStoreName(catalogJson.data.store.name);
          } else {
            setError(catalogJson.message ?? "Could not load the store catalog.");
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Could not reach the store catalog.");
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableCategories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return GARMENT_CATEGORIES.filter((categoryName) => present.has(categoryName));
  }, [items]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (category === "All" || item.category === category) &&
        (!normalized || item.name.toLowerCase().includes(normalized))
    );
  }, [items, query, category]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search the catalog…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 rounded-xl pr-4 pl-9"
          aria-label="Search garments"
        />
      </div>

      {availableCategories.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {["All", ...availableCategories].map((categoryName) => (
            <button
              key={categoryName}
              role="tab"
              aria-selected={category === categoryName}
              onClick={() => setCategory(categoryName)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                category === categoryName
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-accent/50"
              )}
            >
              {categoryName}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="border-border bg-card/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
          <Store className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-sm font-medium">Loading the store catalog…</p>
        </div>
      ) : error ? (
        <div className="border-border bg-card/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
          <Store className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-muted-foreground text-xs">
            {storeName} · {items.length} {items.length === 1 ? "garment" : "garments"} ·{" "}
            {category === "All" ? "all categories" : category}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((item) => {
              const selected = value?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    onSelect({
                      id: item.id,
                      name: item.name,
                      imageUrl: item.imageUrl,
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
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                      unoptimized
                    />
                    {selected ? (
                      <span className="bg-accent text-accent-foreground absolute top-2 right-2 flex size-6 items-center justify-center rounded-full shadow-lg">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                  <span className="flex flex-col px-1 pb-1">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    <Badge
                      variant="secondary"
                      className="mt-1 w-fit rounded-full text-[10px] font-medium"
                    >
                      {item.category}
                    </Badge>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="border-border bg-card/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center">
          <Shirt className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-sm font-medium">No garments found</p>
          <p className="text-muted-foreground text-xs">
            {query || category !== "All"
              ? "Try a different search or category."
              : "The store hasn't added garments yet."}
          </p>
        </div>
      )}
    </div>
  );
}
