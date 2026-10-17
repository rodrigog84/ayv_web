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
3. Crea, edita o elimina productos (nombre, precio, descripción, URL de imagen, categoría, destacado, oferta)

## WhatsApp e Instagram

- WhatsApp: +56 9 6558 6116 (`56965586116`)
- Instagram: [instagram.com/ayvoutlet](https://www.instagram.com/ayvoutlet)

En el detalle de producto, **Me interesa** abre WhatsApp con un mensaje precargado.

## Deploy en Vercel

1. Importa el repositorio en Vercel
2. Configura:
   - `ADMIN_PASSWORD` — contraseña fuerte para producción
   - `BLOB_READ_WRITE_TOKEN` — crea un store de [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) y pega el token de lectura/escritura
3. Deploy

Con Blob activo, el catálogo persiste entre deploys y serverless. Sin Blob, el seed de `data/products.json` se sirve, pero los cambios del admin no sobreviven en el filesystem efímero de Vercel.

## Scripts

- `npm run dev` — servidor de desarrollo en el puerto **4321**
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — ESLint
