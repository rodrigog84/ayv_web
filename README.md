# A & V Outlet

Sitio web MVP de **A & V Outlet** (productos para el hogar): presentación, catálogo administrable y contacto por WhatsApp. Español (Chile).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Persistencia del catálogo: archivo local en desarrollo, Vercel Blob en producción (opcional)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:4321](http://127.0.0.1:4321).

Variables opcionales (copia `.env.example` a `.env.local`):

| Variable | Descripción | Default local |
|---|---|---|
| `ADMIN_PASSWORD` | Contraseña de `/admin` | `ayv-admin-local` |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para guardar `products.json` | *(vacío → usa `data/products.json`)* |

Sin `BLOB_READ_WRITE_TOKEN`, el CRUD escribe en `data/products.json` (adecuado para desarrollo).

## Admin

1. Ve a `/admin`
2. Ingresa la contraseña (`ADMIN_PASSWORD` o `ayv-admin-local` en local)
3. Gestiona **categorías** (crear, renombrar, eliminar). No se puede eliminar una categoría si aún tienen productos.
4. Gestiona **avisos / novedades** (lives, campañas): título, descripción, imagen opcional, fecha/hora texto, CTA, activo, fijado.
5. Crea, edita o elimina productos (nombre, precio, precio anterior opcional, descripción, URL de imagen, categoría de la lista, destacado, oferta)
6. En la lista puedes activar/desactivar **Oferta** y **Destacado** con un toque

Las categorías se guardan en `data/categories.json` (local) o Vercel Blob (`ayv-outlet/categories.json`), igual que los productos. Los avisos usan `data/announcements.json` / `ayv-outlet/announcements.json`.

## WhatsApp e Instagram

- WhatsApp: +56 9 8144 4794 (`56981444794`)
- Instagram: [instagram.com/ayvoutlet](https://www.instagram.com/ayvoutlet)

En el detalle de producto, **Me interesa** abre WhatsApp con un mensaje precargado.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `ADMIN_PASSWORD` | Sí en producción | Contraseña de `/admin` (default local: `ayv-admin-local`) |
| `BLOB_READ_WRITE_TOKEN` | Recomendada en Vercel | Persistencia del catálogo vía [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

Ver también `.env.example`.

## Deploy en GitHub + Vercel

1. Crea un repo vacío en GitHub (p. ej. `ayv-outlet`), sin README.
2. Empuja el MVP como `main`:

```bash
git remote add github https://github.com/TU_USUARIO/ayv-outlet.git
git push -u github cursor/ayv-outlet-mvp-d081:main
```

3. En [vercel.com/new](https://vercel.com/new): **Import** el repo → Framework Next.js.
4. Environment Variables:
   - `ADMIN_PASSWORD` — contraseña fuerte (no uses el default local en producción)
   - `BLOB_READ_WRITE_TOKEN` — opcional; crea un Blob store en el proyecto y conéctalo (recomendado)
5. **Deploy** y abre la URL `*.vercel.app`.

Con Blob activo, el catálogo persiste entre deploys. Sin Blob, se sirve el seed de `data/products.json`, pero los cambios del admin no sobreviven en el filesystem efímero de Vercel.

Guía detallada (copy-paste): en el Context del proyecto, `docs/deploy-vercel.md`.

## Scripts

- `npm run dev` — servidor de desarrollo en el puerto **4321**
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — ESLint
