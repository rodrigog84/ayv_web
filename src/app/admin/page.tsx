import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLogin } from "@/components/admin-login";
import { AdminPanel } from "@/components/admin-panel";
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
    return <AdminLogin />;
  }
  const [products, categories, announcements] = await Promise.all([
    getProducts(),
    getCategories(),
    getAnnouncements(),
  ]);
  return (
    <AdminPanel
      initialProducts={products}
      initialCategories={categories}
      initialAnnouncements={announcements}
      persistence={persistenceMode()}
    />
  );
}
