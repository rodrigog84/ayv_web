import { NextResponse } from "next/server";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/announcements";
import { isAdminAuthenticated } from "@/lib/auth";
import type { AnnouncementInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as AnnouncementInput | null;
  if (!body?.title?.trim()) {
    return NextResponse.json(
      { error: "El título es obligatorio" },
      { status: 400 },
    );
  }
  try {
    const announcement = await updateAnnouncement(id, {
      title: body.title,
      body: body.body || "",
      imageUrl: body.imageUrl,
      eventDateTime: body.eventDateTime,
      ctaLabel: body.ctaLabel,
      ctaUrl: body.ctaUrl,
      active: body.active !== false,
      pinned: Boolean(body.pinned),
    });
    if (!announcement) {
      return NextResponse.json(
        { error: "Aviso no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ announcement });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo actualizar el aviso";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const ok = await deleteAnnouncement(id);
  if (!ok) {
    return NextResponse.json({ error: "Aviso no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
