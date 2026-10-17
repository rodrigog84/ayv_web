import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalogo/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-[0_12px_40px_-24px_rgba(51,195,255,0.55)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.onSale ? (
            <Badge className="bg-sky text-white hover:bg-sky">Oferta</Badge>
          ) : null}
          {product.featured ? (
            <Badge variant="secondary">Destacado</Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-heading text-lg leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="mt-auto text-base font-medium text-charcoal">
          {formatCLP(product.price)}
        </p>
      </div>
    </Link>
  );
}
