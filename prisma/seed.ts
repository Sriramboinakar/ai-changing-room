import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_GARMENTS } from "../src/lib/tryon/garments";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL ?? "postgres://",
  }),
});

async function main() {
  const store = await prisma.store.upsert({
    where: { slug: "demo" },
    update: { name: "Demo Boutique" },
    create: { name: "Demo Boutique", slug: "demo" },
  });

  await prisma.catalogItem.deleteMany({ where: { storeId: store.id } });

  const items = await prisma.catalogItem.createMany({
    data: DEMO_GARMENTS.map((garment, index) => ({
      storeId: store.id,
      name: garment.name,
      category: garment.category,
      imageUrl: garment.imageUrl,
      sortOrder: index,
    })),
  });

  console.log(`Seeded store "${store.slug}" (${store.name}) with ${items.count} catalog items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
