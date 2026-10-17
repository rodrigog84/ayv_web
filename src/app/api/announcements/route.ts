import { NextResponse } from "next/server";
import {
  createAnnouncement,
  getAnnouncements,
} from "@/lib/announcements";
import { isAdminAuthenticated } from "@/lib/auth";
import { persistenceMode } from "@/lib/products";
import type { AnnouncementInput } from "@/lib/types";

export async function GET() {
  const announcements = await getAnnouncements();
  return NextResponse.json({ announcements, persistence: persistenceMode() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as AnnouncementInput | null;
  if (!body?.title?.trim()) {
    return NextResponse.json(
      { error: "El título es obligatorio" },
      { status: 400 },
    );
  }
  try {
    const announcement = await createAnnouncement({
      title: body.title,
      body: body.body || "",
      imageUrl: body.imageUrl,
      eventDateTime: body.eventDateTime,
      ctaLabel: body.ctaLabel,
      ctaUrl: body.ctaUrl,
      active: body.active !== false,
      pinned: Boolean(body.pinned),
    });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear el aviso";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
