import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AnnouncementCard } from "@/components/announcement-card";
import { Button } from "@/components/ui/button";
import { getActiveAnnouncements } from "@/lib/announcements";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Avisos, lives y campañas especiales de A & V Outlet.",
};

export default async function NovedadesPage() {
  await connection();
  const announcements = await getActiveAnnouncements();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky">
          Avisos y novedades
        </p>
        <h1 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
          Novedades
        </h1>
        <p className="mt-3 text-base text-charcoal">
          Lives de Instagram, campañas de temporada y avisos importantes.
        </p>
      </div>

      {announcements.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Por ahora no hay avisos activos. Revisa el{" "}
          <Link
            href="/catalogo"
            className="text-sky underline-offset-2 hover:underline"
          >
            catálogo
          </Link>{" "}
          o vuelve pronto.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <AnnouncementCard key={item.id} announcement={item} />
          ))}
        </div>
      )}

      <div className="mt-12">
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
