import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/format";
import type { Product } from "@/lib/types";
import {
  productInterestMessage,
  whatsappUrl,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function ProductPrice({ product }: { product: Product }) {
  const showStrike =
    product.onSale &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price;

  if (showStrike) {
    return (
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm text-muted-foreground line-through">
          {formatCLP(product.compareAtPrice!)}
        </span>
        <span className="text-lg font-semibold text-sky">
          {formatCLP(product.price)}
        </span>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "text-base font-medium",
        product.onSale ? "text-sky" : "text-charcoal",
      )}
    >
      {formatCLP(product.price)}
      {product.onSale ? (
        <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-sky">
          Oferta
        </span>
      ) : null}
    </p>
  );
}

export function ProductCard({
  product,
  showWhatsApp = false,
}: {
  product: Product;
  showWhatsApp?: boolean;
}) {
  const interestUrl = whatsappUrl(productInterestMessage(product.name));
  const cover =
    product.images?.[0] || product.imageUrl || "/logo.jpg";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-background transition-all duration-300",
        product.onSale
          ? "border-sky/50 shadow-[0_8px_28px_-20px_rgba(51,195,255,0.7)]"
          : "border-border/80",
        "hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-[0_12px_40px_-24px_rgba(51,195,255,0.55)]",
      )}
    >
      <Link href={`/catalogo/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized={cover.startsWith("/")}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.onSale ? (
              <Badge className="h-6 border-0 bg-sky px-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm hover:bg-sky">
                Oferta
              </Badge>
            ) : null}
            {product.featured ? (
              <Badge className="h-6 border border-charcoal/20 bg-white/95 px-2.5 text-[11px] font-bold uppercase tracking-wide text-charcoal shadow-sm hover:bg-white">
                Destacado
              </Badge>
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
          <div className="mt-auto">
            <ProductPrice product={product} />
          </div>
        </div>
      </Link>
      {showWhatsApp ? (
        <div className="border-t border-border/70 px-4 pb-4 pt-0">
          <Button
            asChild
            size="sm"
            className="mt-3 w-full bg-sky text-white hover:bg-sky/90"
          >
            <a href={interestUrl} target="_blank" rel="noopener noreferrer">
              Consultar por WhatsApp
            </a>
          </Button>
        </div>
      ) : null}
    </article>
  );
}
