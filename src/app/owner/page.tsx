"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Plus, Store, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GARMENT_CATEGORIES } from "@/lib/tryon/categories";

type Store = { id: string; name: string; slug: string };
type CatalogItem = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  imageUrl: string;
};

const CATEGORY_OPTIONS = [...GARMENT_CATEGORIES];

export default function OwnerPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>("");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<CatalogItem | null>(null);

  const loadStores = useCallback(async () => {
    const res = await fetch("/api/stores");
    const json = await res.json();
    if (json.success) {
      setStores(json.data);
      if (!activeStoreId && json.data.length > 0) {
        setActiveStoreId(json.data[0].id);
      }
    }
  }, [activeStoreId]);

  const loadItems = useCallback(
    async (storeId: string) => {
      setLoading(true);
      const res = await fetch(`/api/stores/${storeId}/catalog`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data.items);
      } else {
        toast.error(json.message ?? "Failed to load catalog");
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    if (activeStoreId) {
      loadItems(activeStoreId);
    }
  }, [activeStoreId, loadItems]);

  function pickImage(file: File | null) {
    setNewImage(file);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview(file ? URL.createObjectURL(file) : null);
  }

  async function addItem() {
    if (!newImage) {
      toast.error("Choose an image first");
      return;
    }
    if (!newName.trim()) {
      toast.error("Enter a name for the garment");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.set("image", newImage);
    formData.set("name", newName.trim());
    formData.set("category", newCategory);

    try {
      const res = await fetch(`/api/stores/${activeStoreId}/catalog`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Upload failed");
      }
      toast.success(`Added "${json.data.name}"`);
      setNewName("");
      setNewImage(null);
      setNewImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadItems(activeStoreId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveEdit() {
    if (!editing || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${activeStoreId}/catalog/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), category: editCategory }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Update failed");
      }
      toast.success("Item updated");
      setEditing(null);
      await loadItems(activeStoreId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/stores/${activeStoreId}/catalog/${deleting.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Delete failed");
      }
      toast.success("Item removed");
      setDeleting(null);
      await loadItems(activeStoreId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Store className="size-5 text-accent" aria-hidden />
            <span>Owner Dashboard</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/try-on">Try-on studio</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/">View site</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Store catalog</h1>
            <p className="text-muted-foreground">
              Upload your garments once — customers can try them on from the store page.
            </p>
          </div>
          {stores.length > 0 && (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Store
              <select
                value={activeStoreId}
                onChange={(event) => setActiveStoreId(event.target.value)}
                className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-end">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Image
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full md:w-auto"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newImagePreview ? "Change image" : "Choose image"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Name
                  <Input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="e.g. Crimson Silk Saree"
                    className="h-10"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Category
                  <select
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <Button onClick={addItem} disabled={uploading}>
                  <Plus className="size-4" aria-hidden />
                  {uploading ? "Adding…" : "Add to catalog"}
                </Button>
              </div>
            </div>
            {newImagePreview && (
              <div className="relative mt-4 h-40 w-28 overflow-hidden rounded-xl border border-border">
                <Image src={newImagePreview} alt="Preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  aria-label="Remove preview"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                  onClick={() => pickImage(null)}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading catalog…</p>
        ) : items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No garments yet — add your first item above.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-[3/4] bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => {
                          setEditing(item);
                          setEditName(item.name);
                          setEditCategory(item.category);
                        }}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit garment</DialogTitle>
            <DialogDescription>Update the name or category of this item.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Name
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="h-10"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Category
              <select
                value={editCategory}
                onChange={(event) => setEditCategory(event.target.value)}
                className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving || !editName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove garment?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleting?.name}&rdquo; will be removed from the catalog and its image
              deleted. Customers can no longer try it on.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
