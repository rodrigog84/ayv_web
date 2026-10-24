import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { requireAdmin } from "@/lib/admin";
import { getCategories } from "@/lib/categories";
import { getProducts, persistenceMode } from "@/lib/products";

export const metadata: Metadata = {
  title: "Categorías · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriasPage() {
  await requireAdmin();
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <AdminShell
      persistence={persistenceMode()}
      summary={`${categories.length} categorías administrables`}
    >
      <CategoriesManager
        initialCategories={categories}
        initialProducts={products}
      />
    </AdminShell>
  );
}
