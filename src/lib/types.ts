export type Product = {
  id: string;
  name: string;
  price: number;
  /** Precio anterior (tachado) cuando hay oferta. */
  compareAtPrice?: number | null;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  onSale: boolean;
};

export type ProductInput = Omit<Product, "id"> & { id?: string };

export const PRODUCT_CATEGORIES = [
  "Dormitorio",
  "Living",
  "Cocina",
  "Comedor",
  "Baño",
  "Iluminación",
  "Otros",
] as const;
