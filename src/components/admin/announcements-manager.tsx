"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  body: string;
  imageUrl: string;
  eventDateTime: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
  pinned: boolean;
};

function emptyForm(): FormState {
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

function toForm(a: Announcement): FormState {
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

export function AnnouncementsManager({
  initialAnnouncements,
}: {
  initialAnnouncements: Announcement[];
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (editingId ? "Editar aviso" : "Nuevo aviso"),
    [editingId],
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements", { cache: "no-store" });
      if (!res.ok) throw new Error("refresh");
      const data = (await res.json()) as { announcements: Announcement[] };
      setAnnouncements(data.announcements);
    } catch {
      setError(
        "No se pudo actualizar la lista de avisos. Revisa la conexión e intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = {
      title: form.title,
      body: form.body,
      imageUrl: form.imageUrl || null,
      eventDateTime: form.eventDateTime || null,
      ctaLabel: form.ctaLabel || null,
      ctaUrl: form.ctaUrl || null,
      active: form.active,
      pinned: form.pinned,
    };
    const url = editingId
      ? `/api/announcements/${editingId}`
      : "/api/announcements";
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
      setError(data?.error || "No se pudo guardar el aviso");
      return;
    }
    setForm(emptyForm());
    setEditingId(null);
    setMessage(editingId ? "Aviso actualizado" : "Aviso creado");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar este aviso?")) return;
    setError(null);
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo eliminar el aviso");
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm());
    }
    setMessage("Aviso eliminado");
    await refresh();
  }

  async function toggleFlag(item: Announcement, field: "active" | "pinned") {
    setError(null);
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
      setError("No se pudo actualizar el aviso");
      return;
    }
    if (editingId === item.id) {
      setForm((f) => ({ ...f, [field]: !item[field] }));
    }
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl">Novedades (Avisos)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Publica lives, campañas y avisos. Solo los <strong>activos</strong>{" "}
            se muestran en inicio y en /novedades. Los <strong>fijados</strong>{" "}
            aparecen primero.
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

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <h3 className="font-heading text-lg">{title}</h3>
          <div className="space-y-2">
            <Label htmlFor="avisoTitle">Título</Label>
            <Input
              id="avisoTitle"
              required
              placeholder="Ej: Live de ofertas en Instagram"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avisoBody">Descripción</Label>
            <Textarea
              id="avisoBody"
              rows={3}
              placeholder="Qué pasa, cuándo y por qué interesa…"
              value={form.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, body: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avisoWhen">Fecha / hora</Label>
            <Input
              id="avisoWhen"
              placeholder="Viernes 19:30"
              value={form.eventDateTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventDateTime: e.target.value }))
              }
            />
          </div>
          <ImageUploadField
            id="avisoImage"
            label="Imagen del aviso (opcional)"
            folder="announcements"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
            hint="Sube una foto desde tu computador (JPEG, PNG, WebP o GIF · máx. 4 MB), o pega una URL abajo."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="avisoCtaLabel">Texto del botón (opcional)</Label>
              <Input
                id="avisoCtaLabel"
                placeholder="Ver en Instagram"
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaLabel: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avisoCtaUrl">URL del botón (opcional)</Label>
              <Input
                id="avisoCtaUrl"
                placeholder="https://instagram.com/…"
                value={form.ctaUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ctaUrl: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 rounded-lg border border-sky/30 bg-accent/50 p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, active: checked === true }))
                }
              />
              Activo
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.pinned}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, pinned: checked === true }))
                }
              />
              Fijado
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-sky">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-sky text-white hover:bg-sky/90"
            >
              {saving
                ? "Guardando…"
                : editingId
                  ? "Guardar aviso"
                  : "Crear aviso"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                  setMessage(null);
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
          {loading && announcements.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              Cargando avisos…
            </p>
          ) : announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
              <p className="font-medium text-foreground">Aún no hay avisos</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea el primero con el formulario. Aparecerá en el inicio si
                está activo.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {announcements.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex gap-3 rounded-xl border bg-background p-3",
                    editingId === item.id
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
                        onClick={() => void toggleFlag(item, "active")}
                      />
                      <FlagToggle
                        active={item.pinned}
                        label="Fijado"
                        tone="charcoal"
                        onClick={() => void toggleFlag(item, "pinned")}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm(toForm(item));
                          setMessage(null);
                          setError(null);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void onDelete(item.id)}
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
