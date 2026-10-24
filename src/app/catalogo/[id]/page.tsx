import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/format";
import { getProductById, getProducts } from "@/lib/products";
import {
  productInterestMessage,
  whatsappUrl,
} from "@/lib/whatsapp";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Producto" };
  return {
    title: product.name,
    description: product.description.slice(0, 140),
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const interestUrl = whatsappUrl(productInterestMessage(product.name));
  const showStrike =
    product.onSale &&
    product.compareAtPrice != null &&
    product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Link
        href="/catalogo"
        className="text-sm text-muted-foreground transition-colors hover:text-sky"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductImageCarousel
          key={product.id}
          images={
            product.images?.length > 0
              ? product.images
              : product.imageUrl
                ? [product.imageUrl]
                : []
          }
          alt={product.name}
        >
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            {product.onSale ? (
              <Badge className="h-7 border-0 bg-sky px-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-sky">
                Oferta
              </Badge>
            ) : null}
            {product.featured ? (
              <Badge className="h-7 border border-charcoal/20 bg-white/95 px-3 text-xs font-bold uppercase tracking-wide text-charcoal hover:bg-white">
                Destacado
              </Badge>
            ) : null}
          </div>
        </ProductImageCarousel>

        <div className="flex flex-col">
          <Badge variant="secondary" className="w-fit">
            {product.category}
          </Badge>
          <h1 className="mt-4 font-heading text-4xl text-foreground">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            {showStrike ? (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCLP(product.compareAtPrice!)}
                </span>
                <span className="text-3xl font-semibold text-sky">
                  {formatCLP(product.price)}
                </span>
              </>
            ) : (
              <p
                className={`text-3xl font-medium ${product.onSale ? "text-sky" : "text-charcoal"}`}
              >
                {formatCLP(product.price)}
              </p>
            )}
          </div>
          <p className="mt-6 text-base leading-relaxed text-charcoal">
            {product.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 bg-sky px-5 text-white hover:bg-sky/90"
            >
              <a href={interestUrl} target="_blank" rel="noopener noreferrer">
                Me interesa
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11">
              <Link href="/catalogo">Ver más productos</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Al tocar “Me interesa” se abre WhatsApp con un mensaje precargado
            sobre este producto.
          </p>
        </div>
      </div>
    </div>
  );
}
