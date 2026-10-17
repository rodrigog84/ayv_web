import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Link
        href="/catalogo"
        className="text-sm text-muted-foreground transition-colors hover:text-sky"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted lg:aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.onSale ? (
              <Badge className="bg-sky text-white hover:bg-sky">Oferta</Badge>
            ) : null}
            {product.featured ? <Badge variant="outline">Destacado</Badge> : null}
          </div>
          <h1 className="mt-4 font-heading text-4xl text-foreground">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-medium text-charcoal">
            {formatCLP(product.price)}
          </p>
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
