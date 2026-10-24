"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Product } from "@/lib/types";

export function CategoriesManager({
  initialCategories,
  initialProducts,
}: {
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return map;
  }, [products]);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);
      if (!catRes.ok || !prodRes.ok) {
        throw new Error("refresh");
      }
      const catData = (await catRes.json()) as { categories: Category[] };
      const prodData = (await prodRes.json()) as { products: Product[] };
      setCategories(catData.categories);
      setProducts(prodData.products);
      return catData.categories;
    } catch {
      setError("No se pudo actualizar la lista. Revisa la conexión e intenta de nuevo.");
      return categories;
    } finally {
      setLoading(false);
    }
  }

  async function onCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "No se pudo crear la categoría");
      return;
    }
    setNewCategoryName("");
    setMessage("Categoría creada");
    await refreshAll();
  }

  async function onRenameCategory(id: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingCategoryName }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "No se pudo renombrar");
      return;
    }
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setMessage("Categoría renombrada");
    await refreshAll();
  }

  async function onDeleteCategory(category: Category) {
    const used = productCountByCategory.get(category.name) || 0;
    if (used > 0) {
      setError(
        `No se puede eliminar “${category.name}”: hay ${used} producto${used === 1 ? "" : "s"} usándola. Reasigna o elimina esos productos primero.`,
      );
      setMessage(null);
      return;
    }
    if (!confirm(`¿Eliminar la categoría “${category.name}”?`)) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "No se pudo eliminar la categoría");
      return;
    }
    setMessage("Categoría eliminada");
    await refreshAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl">Categorías</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, renombra o elimina categorías. No se puede eliminar una que
            todavía usen productos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => void refreshAll()}
        >
          {loading ? "Actualizando…" : "Actualizar lista"}
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-background p-5">
        <form
          onSubmit={onCreateCategory}
          className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="newCategory">Nueva categoría</Label>
            <Input
              id="newCategory"
              placeholder="Ej: Terraza"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={busy || !newCategoryName.trim()}
            className="bg-sky text-white hover:bg-sky/90"
          >
            {busy ? "Guardando…" : "Crear"}
          </Button>
        </form>

        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {message ? <p className="mb-3 text-sm text-sky">{message}</p> : null}

        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
            <p className="font-medium text-foreground">Aún no hay categorías</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea la primera para poder asignarla a productos.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {categories.map((cat) => {
              const used = productCountByCategory.get(cat.name) || 0;
              const isEditing = editingCategoryId === cat.id;
              return (
                <li
                  key={cat.id}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  {isEditing ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={editingCategoryName}
                        onChange={(e) =>
                          setEditingCategoryName(e.target.value)
                        }
                        className="sm:max-w-xs"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={busy || !editingCategoryName.trim()}
                          onClick={() => void onRenameCategory(cat.id)}
                          className="bg-sky text-white hover:bg-sky/90"
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {used === 0
                            ? "Sin productos"
                            : `${used} producto${used === 1 ? "" : "s"}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setEditingCategoryName(cat.name);
                            setError(null);
                            setMessage(null);
                          }}
                        >
                          Renombrar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => void onDeleteCategory(cat)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
