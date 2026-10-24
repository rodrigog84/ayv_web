import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminLogin } from "@/components/admin-login";
import { getAnnouncements } from "@/lib/announcements";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { getProducts, persistenceMode } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await connection();
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return (
      <Suspense fallback={null}>
        <AdminLogin />
      </Suspense>
    );
  }

  const [products, categories, announcements] = await Promise.all([
    getProducts(),
    getCategories(),
    getAnnouncements(),
  ]);

  return (
    <AdminShell
      persistence={persistenceMode()}
      summary={`${products.length} productos · ${categories.length} categorías · ${announcements.length} avisos`}
    >
      <AdminDashboard
        productCount={products.length}
        offerCount={products.filter((p) => p.onSale).length}
        featuredCount={products.filter((p) => p.featured).length}
        announcementCount={announcements.length}
        activeAnnouncementCount={announcements.filter((a) => a.active).length}
        categoryCount={categories.length}
      />
    </AdminShell>
  );
}
