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
import type { Announcement, Category, Product } from "@/lib/types";
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

type AnnouncementFormState = {
  title: string;
  body: string;
  imageUrl: string;
  eventDateTime: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  pinned: boolean;
};

function emptyAnnouncementForm(): AnnouncementFormState {
  return {
    title: "",
    body: "",
    imageUrl: "",
    eventDateTime: "",
    ctaLabel: "",
    ctaUrl: "",
    active: true,
    pinned: false,
  };
}

function toAnnouncementForm(a: Announcement): AnnouncementFormState {
  return {
    title: a.title,
    body: a.body,
    imageUrl: a.imageUrl || "",
    eventDateTime: a.eventDateTime || "",
    ctaLabel: a.ctaLabel || "",
    ctaUrl: a.ctaUrl || "",
    active: a.active,
    pinned: a.pinned,
  };
}

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
  initialCategories,
  initialAnnouncements,
  persistence,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  initialAnnouncements: Announcement[];
  persistence: "blob" | "local";
}) {
  const defaultCategory = initialCategories[0]?.name || "Otros";
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCategory));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormState>(
    emptyAnnouncementForm,
  );
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [announcementError, setAnnouncementError] = useState<string | null>(
    null,
  );
  const [announcementMessage, setAnnouncementMessage] = useState<string | null>(
    null,
  );
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const title = useMemo(
    () => (editingId ? "Editar producto" : "Nuevo producto"),
    [editingId],
  );

  const announcementTitle = useMemo(
    () => (editingAnnouncementId ? "Editar aviso" : "Nuevo aviso"),
    [editingAnnouncementId],
  );

  const offerCount = products.filter((p) => p.onSale).length;
  const featuredCount = products.filter((p) => p.featured).length;
  const activeAnnouncementCount = announcements.filter((a) => a.active).length;

  const productCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return map;
  }, [products]);

  async function refreshProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = (await res.json()) as { products: Product[] };
    setProducts(data.products);
  }

  async function refreshCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = (await res.json()) as { categories: Category[] };
    setCategories(data.categories);
    return data.categories;
  }

  async function refreshAnnouncements() {
    const res = await fetch("/api/announcements", { cache: "no-store" });
    const data = (await res.json()) as { announcements: Announcement[] };
    setAnnouncements(data.announcements);
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
    const first = categories[0]?.name || defaultCategory;
    setForm(emptyForm(first));
    setEditingId(null);
    setMessage(editingId ? "Producto actualizado" : "Producto creado");
    await refreshProducts();
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
    await refreshProducts();
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
    await refreshProducts();
  }

  async function onCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryBusy(true);
    setCategoryError(null);
    setCategoryMessage(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    setCategoryBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setCategoryError(data?.error || "No se pudo crear la categoría");
      return;
    }
    setNewCategoryName("");
    setCategoryMessage("Categoría creada");
    const next = await refreshCategories();
    if (!form.category && next[0]) {
      setForm((f) => ({ ...f, category: next[0].name }));
    }
  }

  async function onRenameCategory(id: string) {
    const previousName = categories.find((c) => c.id === id)?.name;
    setCategoryBusy(true);
    setCategoryError(null);
    setCategoryMessage(null);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingCategoryName }),
    });
    setCategoryBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setCategoryError(data?.error || "No se pudo renombrar");
      return;
    }
    const data = (await res.json()) as { category: Category };
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setCategoryMessage("Categoría renombrada");
    await refreshCategories();
    await refreshProducts();
    if (previousName && form.category === previousName) {
      setForm((f) => ({ ...f, category: data.category.name }));
    }
  }

  async function onDeleteCategory(category: Category) {
    const used = productCountByCategory.get(category.name) || 0;
    if (used > 0) {
      setCategoryError(
        `No se puede eliminar “${category.name}”: hay ${used} producto${used === 1 ? "" : "s"} usándola. Reasigna o elimina esos productos primero.`,
      );
      setCategoryMessage(null);
      return;
    }
    if (!confirm(`¿Eliminar la categoría “${category.name}”?`)) return;
    setCategoryBusy(true);
    setCategoryError(null);
    setCategoryMessage(null);
    const res = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });
    setCategoryBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setCategoryError(data?.error || "No se pudo eliminar la categoría");
      return;
    }
    setCategoryMessage("Categoría eliminada");
    const next = await refreshCategories();
    if (form.category === category.name) {
      setForm((f) => ({
        ...f,
        category: next[0]?.name || "",
      }));
    }
  }

  async function onSubmitAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setAnnouncementSaving(true);
    setAnnouncementError(null);
    setAnnouncementMessage(null);
    const payload = {
      title: announcementForm.title,
      body: announcementForm.body,
      imageUrl: announcementForm.imageUrl || null,
      eventDateTime: announcementForm.eventDateTime || null,
      ctaLabel: announcementForm.ctaLabel || null,
      ctaUrl: announcementForm.ctaUrl || null,
      active: announcementForm.active,
      pinned: announcementForm.pinned,
    };
    const url = editingAnnouncementId
      ? `/api/announcements/${editingAnnouncementId}`
      : "/api/announcements";
    const method = editingAnnouncementId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setAnnouncementSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setAnnouncementError(data?.error || "No se pudo guardar el aviso");
      return;
    }
    setAnnouncementForm(emptyAnnouncementForm());
    setEditingAnnouncementId(null);
    setAnnouncementMessage(
      editingAnnouncementId ? "Aviso actualizado" : "Aviso creado",
    );
    await refreshAnnouncements();
  }

  async function onDeleteAnnouncement(id: string) {
    if (!confirm("¿Eliminar este aviso?")) return;
    setAnnouncementError(null);
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setAnnouncementError("No se pudo eliminar el aviso");
      return;
    }
    if (editingAnnouncementId === id) {
      setEditingAnnouncementId(null);
      setAnnouncementForm(emptyAnnouncementForm());
    }
    setAnnouncementMessage("Aviso eliminado");
    await refreshAnnouncements();
  }

  async function toggleAnnouncementFlag(
    item: Announcement,
    field: "active" | "pinned",
  ) {
    setAnnouncementError(null);
    const res = await fetch(`/api/announcements/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        body: item.body,
        imageUrl: item.imageUrl,
        eventDateTime: item.eventDateTime,
        ctaLabel: item.ctaLabel,
        ctaUrl: item.ctaUrl,
        active: field === "active" ? !item.active : item.active,
        pinned: field === "pinned" ? !item.pinned : item.pinned,
      }),
    });
    if (!res.ok) {
      setAnnouncementError("No se pudo actualizar el aviso");
      return;
    }
    if (editingAnnouncementId === item.id) {
      setAnnouncementForm((f) => ({
        ...f,
        [field]: !item[field],
      }));
    }
    await refreshAnnouncements();
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
            {products.length} productos · {categories.length} categorías ·{" "}
            {announcements.length} avisos ({activeAnnouncementCount} activos) ·{" "}
            {featuredCount} destacados · {offerCount} ofertas · Persistencia:{" "}
            <span className="font-medium text-charcoal">
              {persistence === "blob" ? "Vercel Blob" : "archivo local (dev)"}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </div>

      <section className="mb-10 rounded-xl border border-border bg-background p-5">
        <div className="mb-4">
          <h2 className="font-heading text-xl">Categorías</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, renombra o elimina categorías. No se puede eliminar una que
            todavía usen productos.
          </p>
        </div>

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
            disabled={categoryBusy || !newCategoryName.trim()}
            className="bg-sky text-white hover:bg-sky/90"
          >
            {categoryBusy ? "Guardando…" : "Crear"}
          </Button>
        </form>

        {categoryError ? (
          <p className="mb-3 text-sm text-destructive">{categoryError}</p>
        ) : null}
        {categoryMessage ? (
          <p className="mb-3 text-sm text-sky">{categoryMessage}</p>
        ) : null}

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay categorías. Crea la primera para poder asignarla a
            productos.
          </p>
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
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="sm:max-w-xs"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={categoryBusy || !editingCategoryName.trim()}
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
                            setCategoryError(null);
                            setCategoryMessage(null);
                          }}
                        >
                          Renombrar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={categoryBusy}
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

      <section className="mb-10 rounded-xl border border-border bg-background p-5">
        <div className="mb-4">
          <h2 className="font-heading text-xl">Avisos / Novedades</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Publica lives, campañas y avisos. Solo los <strong>activos</strong>{" "}
            se muestran en inicio y en /novedades. Los <strong>fijados</strong>{" "}
            aparecen primero.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <form onSubmit={onSubmitAnnouncement} className="space-y-4">
            <h3 className="font-heading text-lg">{announcementTitle}</h3>
            <div className="space-y-2">
              <Label htmlFor="avisoTitle">Título</Label>
              <Input
                id="avisoTitle"
                required
                placeholder="Ej: Live de ofertas en Instagram"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avisoBody">Descripción corta</Label>
              <Textarea
                id="avisoBody"
                rows={3}
                placeholder="Qué pasa, cuándo y por qué interesa…"
                value={announcementForm.body}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({ ...f, body: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="avisoWhen">Fecha / hora (texto)</Label>
                <Input
                  id="avisoWhen"
                  placeholder="Viernes 19:30"
                  value={announcementForm.eventDateTime}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      eventDateTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avisoImage">URL de imagen (opcional)</Label>
                <Input
                  id="avisoImage"
                  placeholder="/announcements/… o https://…"
                  value={announcementForm.imageUrl}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      imageUrl: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="avisoCtaLabel">Texto del botón (opcional)</Label>
                <Input
                  id="avisoCtaLabel"
                  placeholder="Ver en Instagram"
                  value={announcementForm.ctaLabel}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      ctaLabel: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avisoCtaUrl">URL del botón (opcional)</Label>
                <Input
                  id="avisoCtaUrl"
                  placeholder="https://instagram.com/…"
                  value={announcementForm.ctaUrl}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      ctaUrl: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 rounded-lg border border-sky/30 bg-accent/50 p-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={announcementForm.active}
                  onCheckedChange={(checked) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      active: checked === true,
                    }))
                  }
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={announcementForm.pinned}
                  onCheckedChange={(checked) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      pinned: checked === true,
                    }))
                  }
                />
                Fijado
              </label>
            </div>
            {announcementError ? (
              <p className="text-sm text-destructive">{announcementError}</p>
            ) : null}
            {announcementMessage ? (
              <p className="text-sm text-sky">{announcementMessage}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={announcementSaving}
                className="bg-sky text-white hover:bg-sky/90"
              >
                {announcementSaving
                  ? "Guardando…"
                  : editingAnnouncementId
                    ? "Guardar aviso"
                    : "Crear aviso"}
              </Button>
              {editingAnnouncementId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingAnnouncementId(null);
                    setAnnouncementForm(emptyAnnouncementForm());
                    setAnnouncementMessage(null);
                  }}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="font-heading text-lg">
              Avisos ({announcements.length})
            </h3>
            {announcements.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Aún no hay avisos. Crea el primero con el formulario.
              </p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex gap-3 rounded-xl border bg-background p-3",
                      editingAnnouncementId === item.id
                        ? "border-sky/60 ring-1 ring-sky/30"
                        : "border-border",
                    )}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.eventDateTime || "Sin fecha"}
                            {item.active ? " · Activo" : " · Inactivo"}
                            {item.pinned ? " · Fijado" : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.active ? (
                            <Badge className="bg-sky text-white hover:bg-sky">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                          {item.pinned ? (
                            <Badge variant="secondary">Fijado</Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <FlagToggle
                          active={item.active}
                          label="Activo"
                          tone="sky"
                          onClick={() =>
                            void toggleAnnouncementFlag(item, "active")
                          }
                        />
                        <FlagToggle
                          active={item.pinned}
                          label="Fijado"
                          tone="charcoal"
                          onClick={() =>
                            void toggleAnnouncementFlag(item, "pinned")
                          }
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAnnouncementId(item.id);
                            setAnnouncementForm(toAnnouncementForm(item));
                            setAnnouncementMessage(null);
                            setAnnouncementError(null);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void onDeleteAnnouncement(item.id)}
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
      </section>

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
            {categories.length === 0 ? (
              <p className="text-sm text-destructive">
                Crea al menos una categoría arriba para poder guardar productos.
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
            <Button
              type="submit"
              disabled={saving || categories.length === 0}
              className="bg-sky text-white hover:bg-sky/90"
            >
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear producto"}
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
