import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Límite razonable para API route en Vercel (~4,5 MB de body). */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const EXT_BY_TYPE: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** En Vercel el filesystem es efímero; sin Blob no hay subida usable. */
export function canUseLocalUploads(): boolean {
  return !process.env.VERCEL;
}

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function validateImageFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo de imagen." };
  }
  if (!isAllowedImageType(file.type)) {
    return {
      ok: false,
      error:
        "Formato no permitido. Usa JPEG, PNG, WebP o GIF.",
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = MAX_IMAGE_BYTES / (1024 * 1024);
    return {
      ok: false,
      error: `La imagen es demasiado grande. Máximo ${mb} MB.`,
    };
  }
  return { ok: true };
}

function safeBaseName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return base || "imagen";
}

function buildPathname(file: File, folder: string): string {
  const ext = EXT_BY_TYPE[file.type as AllowedImageType];
  const stamp = Date.now().toString(36);
  const rand = randomBytes(4).toString("hex");
  return `${folder}/${safeBaseName(file.name)}-${stamp}-${rand}.${ext}`;
}

export type UploadResult = {
  url: string;
  pathname: string;
  mode: "blob" | "local";
};

/**
 * Sube la imagen a Vercel Blob, o en local (sin VERCEL) a public/uploads.
 * En Vercel sin BLOB_READ_WRITE_TOKEN lanza con mensaje en español.
 */
export async function uploadImageFile(
  file: File,
  folder: "products" | "announcements" = "products",
): Promise<UploadResult> {
  const check = validateImageFile(file);
  if (!check.ok) {
    throw new UploadError(check.error, 400);
  }

  const pathname = buildPathname(file, `ayv-outlet/${folder}`);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (hasBlobToken()) {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname, mode: "blob" };
  }

  if (!canUseLocalUploads()) {
    throw new UploadError(
      "La subida de imágenes no está configurada. En Vercel agrega la variable BLOB_READ_WRITE_TOKEN (Vercel Blob) y vuelve a desplegar.",
      503,
    );
  }

  const relative = pathname.replace(/^ayv-outlet\//, "uploads/");
  const dest = path.join(process.cwd(), "public", relative);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buffer);
  return { url: `/${relative}`, pathname: relative, mode: "local" };
}

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}
