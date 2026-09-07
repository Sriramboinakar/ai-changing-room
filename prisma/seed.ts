import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_GARMENTS } from "../src/lib/tryon/garments";

// Prisma 7 requires a driver adapter. Use the DIRECT connection for
// seeding/migrations so long-running statements don't trip pgbouncer limits.
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
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
