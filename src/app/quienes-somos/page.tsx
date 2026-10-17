import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_URL } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Quiénes somos",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky">
            A & V Outlet
          </p>
          <h1 className="mt-3 font-heading text-4xl text-foreground sm:text-5xl">
            Quiénes somos
          </h1>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-charcoal">
            <p>
              Somos A & V Outlet, un proyecto dedicado a productos para el hogar:
              piezas prácticas y con buen diseño para renovar living, cocina,
              dormitorio y más.
            </p>
            <p>
              Creemos en una compra simple: miras el catálogo, eliges lo que te
              gusta y nos escribes por WhatsApp. Te orientamos sin vueltas y
              coordinamos la venta de forma cercana.
            </p>
            <p>
              También compartimos novedades y ofertas en Instagram. Síguenos en{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky underline-offset-4 hover:underline"
              >
                @ayvoutlet
              </a>
              .
            </p>
          </div>
          <div className="mt-8">
            <Button asChild className="bg-sky text-white hover:bg-sky/90">
              <Link href="/catalogo">Explorar catálogo</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-soft">
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=80"
            alt="Ambiente de hogar con mobiliario y decoración"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
