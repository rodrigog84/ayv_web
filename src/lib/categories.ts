import { put, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Category, CategoryInput } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { getProducts, saveProducts } from "@/lib/products";
import seed from "../../data/categories.json";

const LOCAL_PATH = path.join(process.cwd(), "data", "categories.json");
const BLOB_PATHNAME = "ayv-outlet/categories.json";

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function normalize(categories: Category[]): Category[] {
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const c of categories) {
    const name = normalizeName(c.name || "");
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: (c.id || "").trim() || slugId(name),
      name,
    });
  }
  return out.sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
}

function slugId(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `cat-${base || "item"}-${Date.now().toString(36)}`;
}

async function seedFromProducts(): Promise<Category[]> {
  const products = await getProducts();
  const names = new Set<string>();
  for (const c of DEFAULT_CATEGORIES) names.add(c.name);
  for (const p of products) {
    const n = normalizeName(p.category || "");
    if (n) names.add(n);
  }
  const byName = new Map(DEFAULT_CATEGORIES.map((c) => [c.name.toLowerCase(), c]));
  const seeded: Category[] = [];
  for (const name of names) {
    const existing = byName.get(name.toLowerCase());
    seeded.push(existing ?? { id: slugId(name), name });
  }
  return normalize(seeded);
}

async function readLocal(): Promise<Category[]> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    const parsed = normalize(JSON.parse(raw) as Category[]);
    if (parsed.length > 0) return parsed;
  } catch {
    // fall through
  }
  return normalize(seed as Category[]);
}

async function writeLocal(categories: Category[]): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(categories, null, 2), "utf8");
}

async function readBlob(): Promise<Category[] | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 10 });
    const match =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (!match) return null;
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    return normalize((await res.json()) as Category[]);
  } catch {
    return null;
  }
}

async function writeBlob(categories: Category[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 20 });
    await Promise.all(blobs.map((b) => del(b.url)));
  } catch {
    // ignore cleanup errors
  }
  await put(BLOB_PATHNAME, JSON.stringify(categories, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getCategories(): Promise<Category[]> {
  if (hasBlobToken()) {
    const fromBlob = await readBlob();
    if (fromBlob && fromBlob.length > 0) return fromBlob;
    const seeded = await seedFromProducts();
    await writeBlob(seeded);
    return seeded;
  }
  const local = await readLocal();
  if (local.length > 0) return local;
  const seeded = await seedFromProducts();
  await writeLocal(seeded);
  return seeded;
}

export async function saveCategories(
  categories: Category[],
): Promise<Category[]> {
  const next = normalize(categories);
  if (hasBlobToken()) {
    await writeBlob(next);
  } else {
    await writeLocal(next);
  }
  return next;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const name = normalizeName(input.name);
  if (!name) {
    throw new Error("El nombre de la categoría es obligatorio");
  }
  const categories = await getCategories();
  if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error("Ya existe una categoría con ese nombre");
  }
  const category: Category = { id: slugId(name), name };
  categories.push(category);
  await saveCategories(categories);
  return category;
}

export async function renameCategory(
  id: string,
  input: CategoryInput,
): Promise<Category | null> {
  const name = normalizeName(input.name);
  if (!name) {
    throw new Error("El nombre de la categoría es obligatorio");
  }
  const categories = await getCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const oldName = categories[idx].name;
  if (
    categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("Ya existe una categoría con ese nombre");
  }
  categories[idx] = { ...categories[idx], name };
  await saveCategories(categories);

  if (oldName !== name) {
    const products = await getProducts();
    let changed = false;
    const next = products.map((p) => {
      if (p.category === oldName) {
        changed = true;
        return { ...p, category: name };
      }
      return p;
    });
    if (changed) await saveProducts(next);
  }

  return categories[idx];
}

export type DeleteCategoryResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "in_use"; productCount?: number };

export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  const categories = await getCategories();
  const target = categories.find((c) => c.id === id);
  if (!target) return { ok: false, reason: "not_found" };

  const products = await getProducts();
  const inUse = products.filter((p) => p.category === target.name);
  if (inUse.length > 0) {
    return { ok: false, reason: "in_use", productCount: inUse.length };
  }

  await saveCategories(categories.filter((c) => c.id !== id));
  return { ok: true };
}

export async function categoryExists(name: string): Promise<boolean> {
  const n = normalizeName(name);
  if (!n) return false;
  const categories = await getCategories();
  return categories.some((c) => c.name.toLowerCase() === n.toLowerCase());
}
