import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { GARMENT_CATEGORIES } from "@/lib/tryon/categories";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  category: z.enum(GARMENT_CATEGORIES).optional(),
});

type Params = { params: Promise<{ slug: string; id: string }> };

async function findItem(slug: string, id: string) {
  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) return null;
  return prisma.catalogItem.findFirst({ where: { id, storeId: store.id } });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug, id } = await params;
  const item = await findItem(slug, id);
  if (!item) {
    return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
  }

  const body = updateSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request", error: body.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await prisma.catalogItem.update({
    where: { id: item.id },
    data: body.data,
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug, id } = await params;
  const item = await findItem(slug, id);
  if (!item) {
    return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
  }

  await prisma.catalogItem.delete({ where: { id: item.id } });

  return NextResponse.json({ success: true });
}
