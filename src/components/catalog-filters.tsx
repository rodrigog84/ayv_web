"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "featured" | "onSale";

function initialFilter(raw: string | null): Filter {
  if (raw === "ofertas" || raw === "onSale") return "onSale";
  if (raw === "destacados" || raw === "featured") return "featured";
  return "all";
}

export function CatalogFilters({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() =>
    initialFilter(searchParams.get("filtro")),
  );
  const [category, setCategory] = useState<string>("Todas");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Todas", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter === "featured" && !p.featured) return false;
      if (filter === "onSale" && !p.onSale) return false;
      if (category !== "Todas" && p.category !== category) return false;
      return true;
    });
  }, [products, filter, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todos"],
              ["featured", "Destacados"],
              ["onSale", "Ofertas"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className={cn(
                filter === value && "bg-sky text-white hover:bg-sky/90",
              )}
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                category === cat
                  ? "bg-charcoal text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No hay productos con estos filtros.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
