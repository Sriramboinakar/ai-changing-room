import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

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

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Uploads are disabled in MVP mode. Connect a database (Turso/PlanetScale) and writable storage to enable catalog uploads.",
    },
    { status: 501 }
  );
}
