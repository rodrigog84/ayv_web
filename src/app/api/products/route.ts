import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createProduct, getProducts, persistenceMode } from "@/lib/products";
import type { ProductInput } from "@/lib/types";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products, persistence: persistenceMode() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as ProductInput | null;
  if (!body?.name || body.price == null || !body.imageUrl || !body.category) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 },
    );
  }
  const product = await createProduct({
    name: body.name,
    price: Number(body.price),
    description: body.description || "",
    imageUrl: body.imageUrl,
    category: body.category,
    featured: Boolean(body.featured),
    onSale: Boolean(body.onSale),
  });
  return NextResponse.json({ product }, { status: 201 });
}
