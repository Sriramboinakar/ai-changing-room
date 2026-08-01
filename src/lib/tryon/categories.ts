/**
 * Canonical garment categories. Shop owners pick from this list when adding
 * catalog items; customers filter the catalog by it.
 */
export const GARMENT_CATEGORIES = [
  "Saree",
  "Kurti",
  "Kurta",
  "Gown",
  "Shirt",
  "Blouse",
  "Anarkali",
  "Blazer",
  "Dress",
  "Lehenga",
  "Skirt",
  "Pants",
  "Sherwani",
  "Top",
  "Jacket",
  "Coat",
] as const;

export type GarmentCategory = (typeof GARMENT_CATEGORIES)[number];
