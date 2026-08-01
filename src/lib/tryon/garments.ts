export interface DemoGarment {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export const DEMO_GARMENTS: DemoGarment[] = [
  {
    id: "gold-silk-blouse",
    name: "Gold Silk Blouse",
    category: "Blouse",
    imageUrl: "/demo/garments/gold-silk-blouse.svg",
  },
  {
    id: "black-velvet-kurta",
    name: "Black Velvet Kurta",
    category: "Kurta",
    imageUrl: "/demo/garments/black-velvet-kurta.svg",
  },
  {
    id: "crimson-silk-saree",
    name: "Crimson Silk Saree",
    category: "Saree",
    imageUrl: "/demo/garments/crimson-silk-saree.svg",
  },
  {
    id: "navy-tailored-blazer",
    name: "Navy Tailored Blazer",
    category: "Blazer",
    imageUrl: "/demo/garments/navy-tailored-blazer.svg",
  },
  {
    id: "emerald-evening-gown",
    name: "Emerald Evening Gown",
    category: "Gown",
    imageUrl: "/demo/garments/emerald-evening-gown.svg",
  },
  {
    id: "ivory-linen-shirt",
    name: "Ivory Linen Shirt",
    category: "Shirt",
    imageUrl: "/demo/garments/ivory-linen-shirt.svg",
  },
  {
    id: "rose-anarkali",
    name: "Rose Anarkali",
    category: "Anarkali",
    imageUrl: "/demo/garments/rose-anarkali.svg",
  },
];

export interface SelectedGarment {
  id: string;
  name: string;
  imageUrl: string;
  isCustom: boolean;
}

export function searchGarments(query: string, garments: DemoGarment[]): DemoGarment[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return garments;
  return garments.filter(
    (garment) =>
      garment.name.toLowerCase().includes(trimmed) ||
      garment.category.toLowerCase().includes(trimmed)
  );
}
