"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCLP } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  price: string;
  compareAtPrice: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  onSale: boolean;
};

function emptyForm(defaultCategory: string): FormState {
  return {
    name: "",
    price: "",
    compareAtPrice: "",
    description: "",
    imageUrl: "",
    category: defaultCategory,
    featured: false,
    onSale: false,
  };
}

function toForm(product: Product): FormState {
  return {
    name: product.name,
    price: String(product.price),
    compareAtPrice:
      product.compareAtPrice != null ? String(product.compareAtPrice) : "",
    description: product.description,
    imageUrl: product.imageUrl,
    category: product.category,
    featured: product.featured,
    onSale: product.onSale,
  };
}

export function ProductsManager({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  const defaultCategory = initialCategories[0]?.name || "Otros";
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCategory));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (editingId ? "Editar producto" : "Nuevo producto"),
    [editingId],
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      if (!prodRes.ok || !catRes.ok) throw new Error("refresh");
      const prodData = (await prodRes.json()) as { products: Product[] };
      const catData = (await catRes.json()) as { categories: Category[] };
      setProducts(prodData.products);
      setCategories(catData.categories);
    } catch {
      setError(
        "No se pudo actualizar el catálogo. Revisa la conexión e intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  function payloadFromForm() {
    return {
      name: form.name,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice
        ? Number(form.compareAtPrice)
        : null,
      description: form.description,
      imageUrl: form.imageUrl,
      category: form.category,
      featured: form.featured,
      onSale: form.onSale,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = payloadFromForm();
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error || "No se pudo guardar");
      return;
    }
    const first = categories[0]?.name || defaultCategory;
    setForm(emptyForm(first));
    setEditingId(null);
    setMessage(editingId ? "Producto actualizado" : "Producto creado");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    setError(null);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm(categories[0]?.name || defaultCategory));
    }
    setMessage("Producto eliminado");
    await refresh();
  }

  async function toggleFlag(product: Product, field: "featured" | "onSale") {
    setTogglingId(product.id);
    setError(null);
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        description: product.description,
        imageUrl: product.imageUrl,
        category: product.category,
        featured: field === "featured" ? !product.featured : product.featured,
        onSale: field === "onSale" ? !product.onSale : product.onSale,
      }),
    });
    setTogglingId(null);
    if (!res.ok) {
      setError("No se pudo actualizar Oferta/Destacado");
      return;
    }
    if (editingId === product.id) {
      setForm((f) => ({ ...f, [field]: !product[field] }));
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl">Productos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, edita o elimina cada producto del catálogo. Marca{" "}
            <strong>Oferta</strong> o <strong>Destacado</strong> para resaltarlos
            en el sitio.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => void refresh()}
        >
          {loading ? "Actualizando…" : "Actualizar lista"}
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <div>
            <h3 className="font-heading text-xl">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa los datos básicos del producto.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              required
              placeholder="Ej: Lámpara de mesa"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio actual (CLP)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                required
                placeholder="18990"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">
                Precio anterior / oferta (opcional)
              </Label>
              <Input
                id="compareAtPrice"
                type="number"
                min={0}
                placeholder="24990"
                value={form.compareAtPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Si es mayor al precio actual, se muestra tachado en ofertas.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            {categories.length === 0 ? (
              <p className="text-sm text-destructive">
                Crea al menos una categoría en{" "}
                <a href="/admin/categorias" className="underline">
                  Categorías
                </a>{" "}
                para poder guardar productos.
              </p>
            ) : (
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    category: value ?? categories[0]?.name ?? "",
                  }))
                }
              >
                <SelectTrigger className="w-full" id="category">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de imagen</Label>
            <Input
              id="imageUrl"
              required
              placeholder="https://… o /products/…"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Usa un enlace directo a la foto (por ejemplo Unsplash o Blob).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Breve descripción para el cliente…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="rounded-lg border border-sky/30 bg-accent/50 p-4">
            <p className="text-sm font-medium text-foreground">
              Visibilidad en el sitio
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Activa estas opciones para resaltar el producto en inicio y
              catálogo.
            </p>
            <div className="mt-3 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={form.onSale}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, onSale: checked === true }))
                  }
                />
                Oferta
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={form.featured}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, featured: checked === true }))
                  }
                />
                Destacado
              </label>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-sky">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={saving || categories.length === 0}
              className="bg-sky text-white hover:bg-sky/90"
            >
              {saving
                ? "Guardando…"
                : editingId
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm(categories[0]?.name || defaultCategory));
                  setMessage(null);
                }}
              >
                Cancelar edición
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-3">
          <div>
            <h3 className="font-heading text-xl">
              Productos ({products.length})
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Toca <strong>Oferta</strong> o <strong>Destacado</strong> para
              activar/desactivar al instante. Usa Editar para el resto de datos.
            </p>
          </div>

          {loading && products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
              Cargando productos…
            </p>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center">
              <p className="font-medium text-foreground">
                Aún no hay productos
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea el primero con el formulario. Aparecerá aquí y en el
                catálogo público.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  className={cn(
                    "flex gap-3 rounded-xl border bg-background p-3",
                    editingId === product.id
                      ? "border-sky/60 ring-1 ring-sky/30"
                      : "border-border",
                  )}
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} · {formatCLP(product.price)}
                          {product.compareAtPrice != null &&
                          product.compareAtPrice > product.price ? (
                            <span className="ml-1 line-through">
                              {formatCLP(product.compareAtPrice)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.onSale ? (
                          <Badge className="bg-sky text-white hover:bg-sky">
                            Oferta
                          </Badge>
                        ) : null}
                        {product.featured ? (
                          <Badge variant="secondary">Destacado</Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <FlagToggle
                        active={product.onSale}
                        label="Oferta"
                        tone="sky"
                        disabled={togglingId === product.id}
                        onClick={() => {
                          if (togglingId) return;
                          void toggleFlag(product, "onSale");
                        }}
                      />
                      <FlagToggle
                        active={product.featured}
                        label="Destacado"
                        tone="charcoal"
                        disabled={togglingId === product.id}
                        onClick={() => {
                          if (togglingId) return;
                          void toggleFlag(product, "featured");
                        }}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(product.id);
                          setForm(toForm(product));
                          setMessage(null);
                          setError(null);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void onDelete(product.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
