"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/novedades", label: "Novedades", icon: Megaphone },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
];

export function AdminShell({
  children,
  persistence,
  summary,
}: {
  children: React.ReactNode;
  persistence: "blob" | "local";
  summary?: string;
}) {
  const pathname = usePathname();

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- clear session with full navigation
    window.location.assign("/admin");
  }

  return (
    <div className="min-h-[70vh] bg-[linear-gradient(180deg,#f5fbff_0%,#ffffff_28%)]">
      <div className="border-b border-sky/20 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky">
                Perfil administrador
              </p>
              <h1 className="mt-1 font-heading text-3xl text-foreground">
                A & V Outlet
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary ||
                  "Gestiona el catálogo, avisos y categorías de tu tienda."}
                {" · "}
                Persistencia:{" "}
                <span className="font-medium text-charcoal">
                  {persistence === "blob"
                    ? "Vercel Blob"
                    : "archivo local (dev)"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/" target="_blank" rel="noreferrer">
                  Ver sitio
                </Link>
              </Button>
              <Button variant="outline" onClick={() => void onLogout()}>
                <LogOut className="size-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>

          <nav
            aria-label="Secciones del admin"
            className="flex gap-1 overflow-x-auto pb-1"
          >
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sky text-white shadow-sm"
                      : "text-muted-foreground hover:bg-sky/10 hover:text-charcoal",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
