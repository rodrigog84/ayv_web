import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { categoryExists } from "@/lib/categories";
import { deleteProduct, normalizeProductImages, updateProduct } from "@/lib/products";
import type { ProductInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as ProductInput | null;
  if (!body?.name || body.price == null || !body.category) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 },
    );
  }
  const { images, imageUrl } = normalizeProductImages(body);
  if (!images.length) {
    return NextResponse.json(
      { error: "Agrega al menos una imagen del producto" },
      { status: 400 },
    );
  }
  if (!(await categoryExists(body.category))) {
    return NextResponse.json(
      { error: "La categoría no existe. Elige una de la lista administrada." },
      { status: 400 },
    );
  }
  const product = await updateProduct(id, {
    name: body.name,
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice,
    description: body.description || "",
    images,
    imageUrl,
    category: body.category,
    featured: Boolean(body.featured),
    onSale: Boolean(body.onSale),
  });
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
