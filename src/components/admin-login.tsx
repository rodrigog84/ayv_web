"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Contraseña incorrecta. Revisa e intenta de nuevo.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border bg-background p-6 shadow-[0_16px_48px_-32px_rgba(51,195,255,0.45)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky">
          Panel de gestión
        </p>
        <h1 className="mt-2 font-heading text-3xl text-foreground">
          Admin A & V Outlet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ingresa la contraseña para ver, crear y editar productos del catálogo
          (incluye Oferta y Destacado).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Escribe la contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sky text-white hover:bg-sky/90"
          >
            {loading ? "Entrando…" : "Entrar al panel"}
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-sky/25 bg-accent/60 px-3 py-3 text-xs leading-relaxed text-charcoal">
          <p className="font-medium text-foreground">Demo local</p>
          <p className="mt-1">
            Si no configuraste <code className="text-foreground">ADMIN_PASSWORD</code>,
            usa: <span className="font-semibold text-foreground">ayv-admin-local</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            En producción (Vercel) define tu propia contraseña en las variables de
            entorno.
          </p>
        </div>
      </div>
    </div>
  );
}
