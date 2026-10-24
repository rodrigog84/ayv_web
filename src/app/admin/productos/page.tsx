import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsManager } from "@/components/admin/products-manager";
import { requireAdmin } from "@/lib/admin";
import { getCategories } from "@/lib/categories";
import { getProducts, persistenceMode } from "@/lib/products";

export const metadata: Metadata = {
  title: "Productos · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductosPage() {
  await requireAdmin();
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminShell
      persistence={persistenceMode()}
      summary={`${products.length} productos en el catálogo`}
    >
      <ProductsManager
        initialProducts={products}
        initialCategories={categories}
      />
    </AdminShell>
  );
}
