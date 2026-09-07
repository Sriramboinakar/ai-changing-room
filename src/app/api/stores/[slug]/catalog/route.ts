import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { STORAGE_BUCKETS, uploadToStorage } from "@/lib/supabase";

type Params = { params: Promise<{ slug: string }> };

const MAX_IMAGE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const uploadSchema = z.object({
  image: z
    .instanceof(File, { message: "An image file is required" })
    .refine((file) => (ACCEPTED_TYPES as readonly string[]).includes(file.type), {
      message: "Unsupported image type — use JPG, PNG or WEBP",
    })
    .refine((file) => file.size <= MAX_IMAGE_MB * 1024 * 1024, {
      message: `Image must be under ${MAX_IMAGE_MB} MB`,
    }),
  name: z.string().trim().min(1, "Name is required").max(120),
  category: z.string().trim().min(1, "Category is required"),
});

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) {
    return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const items = await prisma.catalogItem.findMany({
    where: { storeId: store.id, ...(category ? { category } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ success: true, data: { store, items } });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) {
    return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse({
    image: formData.get("image"),
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request", error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { image, name, category } = parsed.data;

  let imageUrl: string;
  try {
    imageUrl = await uploadToStorage(
      STORAGE_BUCKETS.catalogItems,
      `${randomUUID()}.${extensionFor(image.type)}`,
      image,
      image.type
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the image to storage.";
    console.error("[api/catalog] upload failed:", message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }

  const item = await prisma.catalogItem.create({
    data: { storeId: store.id, name, category, imageUrl },
  });

  return NextResponse.json({ success: true, data: item });
}