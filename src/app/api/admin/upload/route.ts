import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  UploadError,
  canUseLocalUploads,
  hasBlobToken,
  uploadImageFile,
} from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo. Intenta de nuevo." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Selecciona un archivo de imagen." },
      { status: 400 },
    );
  }

  const folderRaw = String(form.get("folder") || "products");
  const folder =
    folderRaw === "announcements" ? "announcements" : "products";

  try {
    const result = await uploadImageFile(file, folder);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[upload]", err);
    if (!hasBlobToken() && !canUseLocalUploads()) {
      return NextResponse.json(
        {
          error:
            "La subida de imágenes no está configurada. Agrega BLOB_READ_WRITE_TOKEN en Vercel.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
