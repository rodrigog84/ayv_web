import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createCategory, getCategories } from "@/lib/categories";
import { persistenceMode } from "@/lib/products";
import type { CategoryInput } from "@/lib/types";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories, persistence: persistenceMode() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as CategoryInput | null;
  if (!body?.name?.trim()) {
    return NextResponse.json(
      { error: "El nombre de la categoría es obligatorio" },
      { status: 400 },
    );
  }
  try {
    const category = await createCategory({ name: body.name });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear la categoría";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
