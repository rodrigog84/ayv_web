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

export type Category = {
  id: string;
  name: string;
};

export type CategoryInput = {
  name: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  /** Fecha/hora libre, ej. "Viernes 19:30" o ISO. */
  eventDateTime?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  active: boolean;
  pinned: boolean;
  createdAt: string;
};

export type AnnouncementInput = Omit<Announcement, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

/** Categorías iniciales (seed). La lista viva está en data/categories.json. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-dormitorio", name: "Dormitorio" },
  { id: "cat-living", name: "Living" },
  { id: "cat-cocina", name: "Cocina" },
  { id: "cat-comedor", name: "Comedor" },
  { id: "cat-bano", name: "Baño" },
  { id: "cat-iluminacion", name: "Iluminación" },
  { id: "cat-otros", name: "Otros" },
];
