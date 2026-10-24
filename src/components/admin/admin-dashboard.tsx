import Link from "next/link";
import { ArrowRight, Megaphone, Package, Tags } from "lucide-react";

type Props = {
  productCount: number;
  offerCount: number;
  featuredCount: number;
  announcementCount: number;
  activeAnnouncementCount: number;
  categoryCount: number;
};

const CARDS = [
  {
    href: "/admin/productos",
    title: "Productos",
    description:
      "Lista completa: crear, editar y eliminar. Imagen, precio, oferta, destacado y categoría.",
    icon: Package,
    tone: "sky" as const,
  },
  {
    href: "/admin/novedades",
    title: "Novedades (Avisos)",
    description:
      "Lives, campañas y avisos del inicio. Título, texto, imagen, fecha, CTA, activo y fijado.",
    icon: Megaphone,
    tone: "charcoal" as const,
  },
  {
    href: "/admin/categorias",
    title: "Categorías",
    description:
      "Lista administrable para el catálogo. Crear, renombrar o eliminar (si no hay productos).",
    icon: Tags,
    tone: "sky" as const,
  },
];

export function AdminDashboard({
  productCount,
  offerCount,
  featuredCount,
  announcementCount,
  activeAnnouncementCount,
  categoryCount,
}: Props) {
  const stats: Record<string, string> = {
    "/admin/productos": `${productCount} productos · ${featuredCount} destacados · ${offerCount} ofertas`,
    "/admin/novedades": `${announcementCount} avisos · ${activeAnnouncementCount} activos`,
    "/admin/categorias": `${categoryCount} categorías`,
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-2xl text-foreground">
          ¿Qué quieres gestionar?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Elige una sección. Puedes moverte entre Productos, Novedades y
          Categorías con la barra de arriba en cualquier momento.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-border bg-background p-5 shadow-[0_18px_40px_-36px_rgba(51,195,255,0.7)] transition-transform hover:-translate-y-0.5 hover:border-sky/40"
            >
              <div
                className={
                  card.tone === "sky"
                    ? "inline-flex size-11 items-center justify-center rounded-xl bg-sky/15 text-sky"
                    : "inline-flex size-11 items-center justify-center rounded-xl bg-charcoal/10 text-charcoal"
                }
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-heading text-xl text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
              <p className="mt-4 text-xs font-medium text-charcoal">
                {stats[card.href]}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky">
                Abrir sección
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
