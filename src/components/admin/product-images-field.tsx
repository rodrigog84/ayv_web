"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  id?: string;
  images: string[];
  onChange: (images: string[]) => void;
  className?: string;
};

export function ProductImagesField({
  id = "product-images",
  images,
  onChange,
  className,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function appendUrls(urls: string[]) {
    const next = [...images];
    for (const url of urls) {
      const trimmed = url.trim();
      if (!trimmed || next.includes(trimmed)) continue;
      next.push(trimmed);
    }
    onChange(next);
  }

  async function onFilesSelected(
    fileList: FileList | null,
    input: HTMLInputElement,
  ) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        body.set("folder", "products");
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body,
        });
        const data = (await res.json().catch(() => null)) as {
          url?: string;
          error?: string;
        } | null;
        if (!res.ok || !data?.url) {
          setError(
            data?.error ||
              "No se pudo subir una imagen. Revisa el formato o la configuración.",
          );
          break;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length > 0) appendUrls(uploaded);
    } catch {
      setError(
        "No se pudo subir la imagen. Revisa la conexión e intenta de nuevo.",
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function addUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setError("Esa URL ya está en la lista.");
      return;
    }
    setError(null);
    onChange([...images, trimmed]);
    setUrlDraft("");
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  function setCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor={`${id}-file`}>Fotos del producto</Label>
        <p className="text-xs text-muted-foreground">
          Sube una o varias fotos desde tu computador, o agrega URLs. La primera
          es la <strong>portada</strong> del catálogo. JPEG, PNG, WebP o GIF ·
          máx. 4 MB c/u.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={`${id}-file`}
            type="file"
            accept={ACCEPT}
            multiple
            disabled={uploading}
            className="max-w-md cursor-pointer file:mr-3 file:cursor-pointer"
            onChange={(e) =>
              void onFilesSelected(e.target.files, e.target)
            }
          />
          {uploading ? (
            <span className="text-sm text-muted-foreground">Subiendo…</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-url`}>Agregar por URL</Label>
        <div className="flex flex-wrap gap-2">
          <Input
            id={`${id}-url`}
            type="text"
            placeholder="https://… o /uploads/…"
            value={urlDraft}
            disabled={uploading}
            onChange={(e) => {
              setUrlDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            className="min-w-[12rem] flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !urlDraft.trim()}
            onClick={addUrl}
          >
            Agregar URL
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no hay fotos. Sube al menos una para guardar el producto.
        </p>
      ) : (
        <ul className="space-y-2">
          {images.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="flex gap-3 rounded-lg border border-border bg-background p-2"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted sm:size-20">
                <Image
                  src={url}
                  alt={`Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={url.startsWith("/")}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Foto {index + 1}
                  </span>
                  {index === 0 ? (
                    <span className="rounded-full bg-sky/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky">
                      Portada
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground" title={url}>
                  {url}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0 || uploading}
                    onClick={() => move(index, -1)}
                  >
                    Subir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === images.length - 1 || uploading}
                    onClick={() => move(index, 1)}
                  >
                    Bajar
                  </Button>
                  {index !== 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploading}
                      className="border-sky/40 text-sky hover:bg-sky/10"
                      onClick={() => setCover(index)}
                    >
                      Usar como portada
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={uploading}
                    onClick={() => removeAt(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
