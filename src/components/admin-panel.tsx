"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
import { PRODUCT_CATEGORIES, type Product } from "@/lib/types";
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

const emptyForm: FormState = {
  name: "",
  price: "",
  compareAtPrice: "",
  description: "",
  imageUrl: "",
  category: "Living",
  featured: false,
  onSale: false,
};

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

function FlagToggle({
  active,
  label,
  onClick,
  tone,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone: "sky" | "charcoal";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
        active && tone === "sky" && "border-sky bg-sky text-white",
        active && tone === "charcoal" && "border-charcoal bg-charcoal text-white",
        !active && "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

export function AdminPanel({
  initialProducts,
  persistence,
}: {
  initialProducts: Product[];
  persistence: "blob" | "local";
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(
    () => (editingId ? "Editar producto" : "Nuevo producto"),
    [editingId],
  );

  const offerCount = products.filter((p) => p.onSale).length;
  const featuredCount = products.filter((p) => p.featured).length;

  async function refresh() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = (await res.json()) as { products: Product[] };
    setProducts(data.products);
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
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "No se pudo guardar");
      return;
    }
    setForm(emptyForm);
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
      setForm(emptyForm);
    }
    setMessage("Producto eliminado");
    await refresh();
  }

  async function toggleFlag(
    product: Product,
    field: "featured" | "onSale",
  ) {
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
      setForm((f) => ({
        ...f,
        [field]: !product[field],
      }));
    }
    await refresh();
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky">
            Gestión del catálogo
          </p>
          <h1 className="mt-1 font-heading text-3xl text-foreground">
            Administración
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} productos · {featuredCount} destacados · {offerCount}{" "}
            ofertas · Persistencia:{" "}
            <span className="font-medium text-charcoal">
              {persistence === "blob" ? "Vercel Blob" : "archivo local (dev)"}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <div>
            <h2 className="font-heading text-xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Completa los datos básicos. Marca <strong>Oferta</strong> o{" "}
              <strong>Destacado</strong> para que se vean en el sitio.
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
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
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
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, category: value ?? "Otros" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de imagen</Label>
            <Input
              id="imageUrl"
              type="url"
              required
              placeholder="https://…"
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
              Activa estas opciones para resaltar el producto en inicio y catálogo.
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
            <Button type="submit" disabled={saving} className="bg-sky text-white hover:bg-sky/90">
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear producto"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
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
            <h2 className="font-heading text-xl">
              Productos ({products.length})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Toca <strong>Oferta</strong> o <strong>Destacado</strong> para
              activar/desactivar al instante. Usa Editar para el resto de datos.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center">
              <p className="font-medium text-foreground">Aún no hay productos</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea el primero con el formulario de la izquierda. Aparecerá aquí
                y en el catálogo público.
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
                        onClick={() => {
                          if (togglingId) return;
                          void toggleFlag(product, "onSale");
                        }}
                      />
                      <FlagToggle
                        active={product.featured}
                        label="Destacado"
                        tone="charcoal"
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
                        onClick={() => onDelete(product.id)}
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
