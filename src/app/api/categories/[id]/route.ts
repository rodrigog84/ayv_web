import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteCategory, renameCategory } from "@/lib/categories";
import type { CategoryInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as CategoryInput | null;
  if (!body?.name?.trim()) {
    return NextResponse.json(
      { error: "El nombre de la categoría es obligatorio" },
      { status: 400 },
    );
  }
  try {
    const category = await renameCategory(id, { name: body.name });
    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }
    return NextResponse.json({ category });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo renombrar la categoría";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const result = await deleteCategory(id);
  if (result.ok === false && result.reason === "not_found") {
    return NextResponse.json(
      { error: "Categoría no encontrada" },
      { status: 404 },
    );
  }
  if (result.ok === false && result.reason === "in_use") {
    const n = result.productCount ?? 0;
    return NextResponse.json(
      {
        error: `No se puede eliminar: hay ${n} producto${n === 1 ? "" : "s"} usando esta categoría. Reasigna o elimina esos productos primero.`,
        productCount: n,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
