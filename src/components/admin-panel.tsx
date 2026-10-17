"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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

type FormState = {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  onSale: boolean;
};

const emptyForm: FormState = {
  name: "",
  price: "",
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
    description: product.description,
    imageUrl: product.imageUrl,
    category: product.category,
    featured: product.featured,
    onSale: product.onSale,
  };
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
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(
    () => (editingId ? "Editar producto" : "Nuevo producto"),
    [editingId],
  );

  async function refresh() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = (await res.json()) as { products: Product[] };
    setProducts(data.products);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      imageUrl: form.imageUrl,
      category: form.category,
      featured: form.featured,
      onSale: form.onSale,
    };
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
          <h1 className="font-heading text-3xl text-foreground">Administración</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Persistencia:{" "}
            <span className="font-medium text-charcoal">
              {persistence === "blob" ? "Vercel Blob" : "archivo local (dev)"}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <h2 className="font-heading text-xl">{title}</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (CLP)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
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
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, featured: checked === true }))
                }
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.onSale}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, onSale: checked === true }))
                }
              />
              Oferta
            </label>
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
                }}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="font-heading text-xl">Productos ({products.length})</h2>
          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex gap-3 rounded-xl border border-border bg-background p-3"
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
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category} · {formatCLP(product.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(product.id);
                        setForm(toForm(product));
                        setMessage(null);
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
        </div>
      </div>
    </div>
  );
}
