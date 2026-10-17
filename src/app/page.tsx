import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AnnouncementCard } from "@/components/announcement-card";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getActiveAnnouncements } from "@/lib/announcements";
import { getProducts } from "@/lib/products";
import {
  generalWhatsAppMessage,
  whatsappUrl,
} from "@/lib/whatsapp";

export default async function HomePage() {
  await connection();
  const [products, announcements] = await Promise.all([
    getProducts(),
    getActiveAnnouncements(),
  ]);
  const picks = products
    .filter((p) => p.featured || p.onSale)
    .sort((a, b) => Number(b.onSale) - Number(a.onSale) || Number(b.featured) - Number(a.featured))
    .slice(0, 6);
  const homeAnnouncements = announcements.slice(0, 4);

  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="animate-drift absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#f7fafc]/95 via-[#eef7fc]/88 to-[#33c3ff]/35" />
          <div className="animate-glow absolute -right-24 top-10 size-[28rem] rounded-full bg-sky/30 blur-3xl" />
          <div className="absolute -left-16 bottom-0 size-[22rem] rounded-full bg-white/50 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #4a5560 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <div className="animate-fade-up flex items-center gap-4">
            <Image
              src="/logo.jpg"
              alt="A & V Outlet"
              width={88}
              height={88}
              className="size-20 rounded-full object-cover shadow-[0_10px_40px_-12px_rgba(51,195,255,0.7)] ring-2 ring-white/80 sm:size-24"
              priority
            />
            <p className="font-heading text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
              A & V Outlet
            </p>
          </div>

          <h1 className="animate-fade-up-delay mt-8 max-w-2xl font-heading text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
            Todo para tu hogar, sin rodeos
          </h1>
          <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base text-charcoal sm:text-lg">
            Catálogo seleccionado de productos para el hogar. Consulta por WhatsApp
            y te ayudamos a elegir.
          </p>

          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 bg-sky px-5 text-base text-white hover:bg-sky/90"
            >
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-charcoal/25 bg-white/70 px-5 text-base backdrop-blur hover:bg-white"
            >
              <a
                href={whatsappUrl(generalWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {homeAnnouncements.length > 0 ? (
        <section className="border-t border-border/60 bg-background">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky">
                Avisos y novedades
              </p>
              <h2 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
                Lo que está pasando
              </h2>
              <p className="mt-3 text-base text-charcoal">
                Lives, campañas y novedades de A & V Outlet. Los avisos fijados
                aparecen primero.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {homeAnnouncements.map((item) => (
                <AnnouncementCard key={item.id} announcement={item} />
              ))}
            </div>

            {announcements.length > homeAnnouncements.length ? (
              <div className="mt-8">
                <Button asChild variant="outline" size="lg" className="h-11">
                  <Link href="/novedades">Ver todas las novedades</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="border-t border-border/60 bg-soft/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky">
              Destacados y ofertas
            </p>
            <h2 className="mt-2 font-heading text-3xl text-foreground sm:text-4xl">
              Lo que más se consulta
            </h2>
            <p className="mt-3 text-base text-charcoal">
              Selección con precio de oferta o productos destacados. Mira el detalle
              o escríbenos por WhatsApp.
            </p>
          </div>

          {picks.length === 0 ? (
            <p className="mt-10 text-muted-foreground">
              Pronto publicaremos destacados y ofertas. Mientras tanto, revisa el{" "}
              <Link href="/catalogo" className="text-sky underline-offset-2 hover:underline">
                catálogo completo
              </Link>
              .
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((product) => (
                <ProductCard key={product.id} product={product} showWhatsApp />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 bg-sky px-5 text-white hover:bg-sky/90"
            >
              <Link href="/catalogo">Ver todo el catálogo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11">
              <Link href="/catalogo?filtro=ofertas">Solo ofertas</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
