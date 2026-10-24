import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { requireAdmin } from "@/lib/admin";
import { getAnnouncements } from "@/lib/announcements";
import { persistenceMode } from "@/lib/products";

export const metadata: Metadata = {
  title: "Novedades · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNovedadesPage() {
  await requireAdmin();
  const announcements = await getAnnouncements();

  return (
    <AdminShell
      persistence={persistenceMode()}
      summary={`${announcements.length} avisos · ${announcements.filter((a) => a.active).length} activos`}
    >
      <AnnouncementsManager initialAnnouncements={announcements} />
    </AdminShell>
  );
}
