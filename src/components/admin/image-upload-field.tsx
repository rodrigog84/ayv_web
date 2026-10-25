"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoTips } from "@/components/admin/photo-tips";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  folder?: "products" | "announcements";
  hint?: string;
  /** Show compact photo tips under the label. Default: announcements tips when folder is announcements. */
  showTips?: boolean;
  className?: string;
};

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  required = false,
  folder = "products",
  hint,
  showTips,
  className,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tipsVisible = showTips ?? folder === "announcements";
  const tipsVariant =
    folder === "announcements" ? "announcement" : "product";

  async function onFileChange(
    file: File | undefined,
    input: HTMLInputElement,
  ) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
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
            "No se pudo subir la imagen. Revisa el formato o la configuración.",
        );
        return;
      }
      onChange(data.url);
    } catch {
      setError(
        "No se pudo subir la imagen. Revisa la conexión e intenta de nuevo.",
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={`${id}-file`}>{label}</Label>
        {tipsVisible ? <PhotoTips variant={tipsVariant} /> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={`${id}-file`}
            type="file"
            accept={ACCEPT}
            disabled={uploading}
            className="max-w-md cursor-pointer file:mr-3 file:cursor-pointer"
            onChange={(e) =>
              void onFileChange(e.target.files?.[0], e.target)
            }
          />
          {uploading ? (
            <span className="text-sm text-muted-foreground">Subiendo…</span>
          ) : null}
          {value ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => {
                onChange("");
                setError(null);
              }}
            >
              Quitar imagen
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {hint ||
            "JPEG, PNG, WebP o GIF · máx. 4 MB. En producción se usa Vercel Blob (BLOB_READ_WRITE_TOKEN)."}
        </p>
      </div>

      {value ? (
        <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={value}
            alt="Vista previa"
            fill
            className="object-cover"
            sizes="320px"
            unoptimized={value.startsWith("/")}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={id}>
          {required
            ? "URL de imagen (alternativa)"
            : "URL de imagen (opcional)"}
        </Label>
        <Input
          id={id}
          type="text"
          required={required && !value}
          placeholder="https://… o /uploads/…"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setError(null);
          }}
        />
        <p className="text-xs text-muted-foreground">
          También puedes pegar un enlace directo (Unsplash, Blob u otra URL
          pública).
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
