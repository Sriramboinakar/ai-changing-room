/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { DEMO_GARMENTS } from "@/lib/tryon/garments";

// ------------------------------------------------------------------
// Store & catalog gateway.
// When DATABASE_URL points at a real Postgres database (e.g. Supabase)
// we use Prisma. Otherwise the app runs on the built-in demo store so
// the site keeps working out of the box with zero configuration.
// ------------------------------------------------------------------

interface Store {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface CatalogItem {
  id: string;
  storeId: string;
  name: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  sortOrder: number;
}

const DEMO_STORE: Store = {
  id: "demo-store",
  name: "Demo Boutique",
  slug: "demo",
  createdAt: new Date(),
};

const DEMO_ITEMS: CatalogItem[] = DEMO_GARMENTS.map((g, i) => ({
  id: g.id,
  storeId: DEMO_STORE.id,
  name: g.name,
  category: g.category,
  imageUrl: g.imageUrl,
  createdAt: new Date(),
  sortOrder: i,
}));

const demoDb: any = {
  store: {
    findMany: async () => [DEMO_STORE],
    findUnique: async ({ where }: { where: { slug?: string; id?: string } }) => {
      if (where.slug) return DEMO_STORE.slug === where.slug ? DEMO_STORE : null;
      if (where.id) return DEMO_STORE.id === where.id ? DEMO_STORE : null;
      return null;
    },
    create: async ({ data }: { data: { name: string; slug: string } }) => ({
      ...DEMO_STORE,
      name: data.name,
      slug: data.slug,
    }),
  },
  catalogItem: {
    findMany: async (args?: any) => {
      const where = args?.where;
      let items = DEMO_ITEMS.filter((i) => i.storeId === DEMO_STORE.id);
      if (where?.category) items = items.filter((i) => i.category === where.category);
      return items.sort((a, b) => a.sortOrder - b.sortOrder);
    },
    findFirst: async ({ where }: { where: { id: string; storeId: string } }) =>
      DEMO_ITEMS.find((i) => i.id === where.id && i.storeId === where.storeId) ?? null,
    create: async ({ data }: any) => ({
      id: `new-${Date.now()}`,
      createdAt: new Date(),
      sortOrder: 0,
      ...data,
    }),
    update: async ({ where, data }: any) => ({ ...DEMO_ITEMS.find((i) => i.id === where.id), ...data }),
    delete: async () => ({ success: true }),
    deleteMany: async () => ({ count: DEMO_ITEMS.length }),
  },
};

const DATABASE_URL = process.env.DATABASE_URL ?? "";
const useRealDb = DATABASE_URL.startsWith("postgres://") || DATABASE_URL.startsWith("postgresql://");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let realPrisma: PrismaClient | null = null;

function getRealPrisma(): PrismaClient | null {
  if (!useRealDb) return null;
  if (realPrisma) return realPrisma;

  // Prisma 7 requires a driver adapter (schema datasource no longer holds a
  // URL). node-postgres adapter connects via the pooled DATABASE_URL.
  realPrisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaPg({ connectionString: DATABASE_URL }),
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = realPrisma;
  }
  return realPrisma;
}

async function withFallback<T>(real: () => Promise<T>, demo: () => Promise<T>): Promise<T> {
  const db = getRealPrisma();
  if (!db) return demo();
  try {
    return await real();
  } catch (error) {
    console.warn("[db] Postgres unavailable, falling back to demo store:", error);
    return demo();
  }
}

export const prisma = {
  store: {
    findMany: (args?: any) =>
      withFallback(() => getRealPrisma()!.store.findMany(args), () => demoDb.store.findMany()),
    findUnique: (args: any) =>
      withFallback(() => getRealPrisma()!.store.findUnique(args), () => demoDb.store.findUnique(args)),
    create: (args: any) =>
      withFallback(() => getRealPrisma()!.store.create(args), () => demoDb.store.create(args)),
  },
  catalogItem: {
    findMany: (args?: any) =>
      withFallback(() => getRealPrisma()!.catalogItem.findMany(args), () => demoDb.catalogItem.findMany(args)),
    findFirst: (args: any) =>
      withFallback(
        () => getRealPrisma()!.catalogItem.findFirst(args),
        () => demoDb.catalogItem.findFirst(args)
      ),
    create: (args: any) =>
      withFallback(() => getRealPrisma()!.catalogItem.create(args), () => demoDb.catalogItem.create(args)),
    update: (args: any) =>
      withFallback(() => getRealPrisma()!.catalogItem.update(args), () => demoDb.catalogItem.update(args)),
    delete: (args: any) =>
      withFallback(() => getRealPrisma()!.catalogItem.delete(args), () => demoDb.catalogItem.delete(args)),
    deleteMany: (args?: any) =>
      withFallback(() => getRealPrisma()!.catalogItem.deleteMany(args), () => demoDb.catalogItem.deleteMany()),
  },
};
