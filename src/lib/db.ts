/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { DEMO_GARMENTS } from "@/lib/tryon/garments";

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

export const prisma = {
  store: {
    findMany: async (_args?: any) => [DEMO_STORE],
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
    upsert: async (_args: any) => DEMO_STORE,
  },
  catalogItem: {
    findMany: async (_args?: any) => {
      const where = _args?.where;
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
    update: async ({ where, data }: any) => ({
      ...DEMO_ITEMS.find((i) => i.id === where.id),
      ...data,
    }),
    delete: async (_args: any) => ({ success: true }),
    deleteMany: async (_args: any) => ({ count: DEMO_ITEMS.length }),
  },
};