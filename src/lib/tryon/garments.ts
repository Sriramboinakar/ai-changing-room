export interface DemoGarment {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

export const DEMO_GARMENTS: DemoGarment[] = [
  {
    id: "saree-1",
    name: "Maroon Silk Saree",
    category: "Saree",
    imageUrl: "/demo/garments/1777267220789.webp",
  },
  {
    id: "saree-2",
    name: "Beige Designer Saree",
    category: "Saree",
    imageUrl: "/demo/garments/image_241cec32-8016-415b-90cc-21b42dbce3f8.webp",
  },
  {
    id: "saree-3",
    name: "Green Printed Saree",
    category: "Saree",
    imageUrl: "/demo/garments/image_81793d35-5f28-4f51-a8ac-f6289a7a6906.webp",
  },
  {
    id: "saree-4",
    name: "Pink Floral Saree",
    category: "Saree",
    imageUrl: "/demo/garments/image_9ad3d884-d998-4c41-9959-89c53a5fa818.webp",
  },
  {
    id: "saree-5",
    name: "Golden Embroidery Saree",
    category: "Saree",
    imageUrl: "/demo/garments/WhatsAppImage2026-01-27at8.48.19PM.webp",
  },
  {
    id: "saree-6",
    name: "Designer Saree",
    category: "Saree",
    imageUrl: "/demo/garments/saree-f.jpeg",
  },
  {
    id: "saree-7",
    name: "Printed Saree",
    category: "Saree",
    imageUrl: "/demo/garments/saree-h.jpeg",
  },
  {
    id: "kurta-1",
    name: "Black Kurta",
    category: "Kurta",
    imageUrl: "/demo/garments/kurtha-black.jpg",
  },
  {
    id: "saree-8",
    name: "Saree 1",
    category: "Saree",
    imageUrl: "/demo/garments/saree-1.jpeg",
  },
  {
    id: "saree-9",
    name: "Saree 2",
    category: "Saree",
    imageUrl: "/demo/garments/saree-2.jpeg",
  },
  {
    id: "saree-10",
    name: "Saree 3",
    category: "Saree",
    imageUrl: "/demo/garments/saree-3.jpeg",
  },
  {
    id: "saree-11",
    name: "Saree 4",
    category: "Saree",
    imageUrl: "/demo/garments/saree-4.jpeg",
  },
  {
    id: "saree-12",
    name: "Saree 5",
    category: "Saree",
    imageUrl: "/demo/garments/saree-5.jpeg",
  },
  {
    id: "saree-13",
    name: "Saree 6",
    category: "Saree",
    imageUrl: "/demo/garments/saree-6.jpeg",
  },
  {
    id: "saree-14",
    name: "Saree 7",
    category: "Saree",
    imageUrl: "/demo/garments/saree-7.jpeg",
  },
  {
    id: "person-1",
    name: "My Photo",
    category: "Top",
    imageUrl: "/demo/garments/my-pic.jfif",
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
