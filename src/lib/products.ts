import { put, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductInput } from "@/lib/types";
import seed from "../../data/products.json";

const LOCAL_PATH = path.join(process.cwd(), "data", "products.json");
const BLOB_PATHNAME = "ayv-outlet/products.json";

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeCompareAt(
  price: number,
  compareAt: unknown,
): number | null {
  if (compareAt == null || compareAt === "") return null;
  const n = Number(compareAt);
  if (!Number.isFinite(n) || n <= price) return null;
  return n;
}

function normalize(products: Product[]): Product[] {
  return products.map((p) => {
    const price = Number(p.price);
    return {
      ...p,
      featured: Boolean(p.featured),
      onSale: Boolean(p.onSale),
      price,
      compareAtPrice: normalizeCompareAt(price, p.compareAtPrice),
    };
  });
}

async function readLocal(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return normalize(JSON.parse(raw) as Product[]);
  } catch {
    return normalize(seed as Product[]);
  }
}

async function writeLocal(products: Product[]): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(products, null, 2), "utf8");
}

async function readBlob(): Promise<Product[] | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 10 });
    const match =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (!match) return null;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    return normalize((await res.json()) as Product[]);
  } catch {
    return null;
  }
}

async function writeBlob(products: Product[]): Promise<void> {
  // Replace previous blob versions with the same pathname
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 20 });
    await Promise.all(blobs.map((b) => del(b.url)));
  } catch {
    // ignore cleanup errors
  }
  await put(BLOB_PATHNAME, JSON.stringify(products, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getProducts(): Promise<Product[]> {
  if (hasBlobToken()) {
    const fromBlob = await readBlob();
    if (fromBlob && fromBlob.length > 0) return fromBlob;
    const seeded = normalize(seed as Product[]);
    await writeBlob(seeded);
    return seeded;
  }
  return readLocal();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function saveProducts(products: Product[]): Promise<Product[]> {
  const next = normalize(products);
  if (hasBlobToken()) {
    await writeBlob(next);
  } else {
    await writeLocal(next);
  }
  return next;
}

function slugId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `prod-${base || "item"}-${Date.now().toString(36)}`;
}

function toProduct(id: string, input: ProductInput): Product {
  const price = Number(input.price);
  return {
    id,
    name: input.name.trim(),
    price,
    compareAtPrice: normalizeCompareAt(price, input.compareAtPrice),
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim(),
    category: input.category.trim(),
    featured: Boolean(input.featured),
    onSale: Boolean(input.onSale),
  };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await getProducts();
  const product = toProduct(input.id || slugId(input.name), input);
  products.push(product);
  await saveProducts(products);
  return product;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | null> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = toProduct(id, input);
  products[idx] = updated;
  await saveProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  await saveProducts(next);
  return true;
}

export function persistenceMode(): "blob" | "local" {
  return hasBlobToken() ? "blob" : "local";
}
