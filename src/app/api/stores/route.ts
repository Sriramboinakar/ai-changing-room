import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const storeSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(80),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function GET() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json({ success: true, data: stores });
}

export async function POST(request: Request) {
  const body = storeSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request", error: body.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  let slug = slugify(body.data.name) || "store";
  const existing = await prisma.store.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const store = await prisma.store.create({ data: { name: body.data.name, slug } });
  return NextResponse.json({ success: true, data: store }, { status: 201 });
}
