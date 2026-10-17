import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { CatalogFilters } from "@/components/catalog-filters";
import { getCategories } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default async function CatalogPage() {
  await connection();
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const featuredCount = products.filter((p) => p.featured).length;
  const offerCount = products.filter((p) => p.onSale).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl text-foreground sm:text-5xl">
          Catálogo
        </h1>
        <p className="mt-3 text-base text-charcoal">
          {products.length} productos · {featuredCount} destacados · {offerCount}{" "}
          ofertas. Elige un ítem y escríbenos por WhatsApp.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<p className="text-muted-foreground">Cargando catálogo…</p>}>
          <CatalogFilters products={products} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
