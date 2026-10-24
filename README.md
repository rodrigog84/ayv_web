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
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob (JSON + subida de imágenes) | *(vacío → archivo local / `public/uploads`)* |

Sin `BLOB_READ_WRITE_TOKEN`, el CRUD escribe en `data/*.json` y las imágenes subidas desde el admin se guardan en `public/uploads/` (solo desarrollo local).

## Admin

1. Ve a `/admin`
2. Ingresa la contraseña (`ADMIN_PASSWORD` o **`ayv-admin-local`** en local)
3. Tras el login verás el **perfil administrador** con accesos a:
   - **Productos** (`/admin/productos`) — lista + crear/editar/eliminar (varias fotos, portada, precio, compareAt/oferta, destacado, categoría, descripción)
   - **Novedades / Avisos** (`/admin/novedades`) — lista + crear/editar/eliminar (título, cuerpo, imagen, fecha/hora, CTA, activo, fijado)
   - **Categorías** (`/admin/categorias`) — crear, renombrar, eliminar (bloqueado si aún hay productos)
4. Navega entre secciones con la barra superior del admin. En productos puedes activar/desactivar **Oferta** y **Destacado** con un toque.

### Imágenes (productos y novedades)

En crear/editar puedes **subir fotos desde el computador** (file picker) o pegar URLs.

- **Productos:** varias fotos por ítem (`images[]`). La primera es la **portada** del catálogo; en el detalle se muestra un carrusel. En admin puedes reordenar, eliminar o marcar portada.
- **Novedades:** una imagen (igual que antes).
- Formatos: JPEG, PNG, WebP, GIF · máx. **4 MB**
- Con `BLOB_READ_WRITE_TOKEN`: la API `/api/admin/upload` sube a Vercel Blob y guarda la URL pública
- Sin token en **local**: se escribe bajo `public/uploads/` y se usa una ruta `/uploads/…`
- Sin token en **Vercel**: el admin muestra un error en español pidiendo configurar Blob (el filesystem de Vercel no sirve para persistir archivos)
- Datos legacy con solo `imageUrl` se migran automáticamente a `images: [imageUrl]`

Las categorías se guardan en `data/categories.json` (local) o Vercel Blob (`ayv-outlet/categories.json`), igual que los productos. Los avisos usan `data/announcements.json` / `ayv-outlet/announcements.json`.

## WhatsApp e Instagram

- WhatsApp: +56 9 8144 4794 (`56981444794`)
- Instagram: [instagram.com/ayvoutlet](https://www.instagram.com/ayvoutlet)

En el detalle de producto, **Me interesa** abre WhatsApp con un mensaje precargado.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `ADMIN_PASSWORD` | Sí en producción | Contraseña de `/admin` (default local: `ayv-admin-local`) |
| `BLOB_READ_WRITE_TOKEN` | Recomendada en Vercel | Persistencia del catálogo + subida de imágenes vía [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

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
