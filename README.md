# Outfit Optimizer — Frontend

Este es el **frontend** de Outfit Optimizer, una app que analiza fotos de tus outfits (una imagen o un tablero de looks) con IA y te recomienda prendas y accesorios de distintas tiendas para completar tu estilo, según tu ciudad, presupuesto, talla y género.

Este repo solo contiene la interfaz web (Next.js). El análisis de imágenes y la búsqueda de productos los resuelve un backend aparte, al que este frontend le pega vía API.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- [Supabase](https://supabase.com) para autenticación (email/contraseña)
- [Bun](https://bun.sh) como gestor de paquetes

## Estructura del proyecto

```
app/
  login/     -> pantalla de inicio de sesión / registro
  board/     -> análisis de un tablero de varias imágenes (pantalla principal tras login)
  analyze/   -> análisis de una sola imagen
  layout.tsx -> layout raíz (fuentes, AuthProvider)
  page.tsx   -> redirige a /board o /login según haya sesión

components/  -> UI compartida (nav, tarjetas de recomendación, etc.)
lib/         -> cliente de la API del backend, cliente de Supabase, contexto de auth
```

## Requisitos previos

- [Bun](https://bun.sh) 1.3+ (o Node.js 20+ si prefieres usar npm/pnpm/yarn)
- El backend de Outfit Optimizer corriendo en algún lado (local o desplegado) — este frontend no funciona sin él
- Un proyecto de [Supabase](https://supabase.com) para la autenticación

## Variables de entorno

Copia el archivo de ejemplo y complétalo:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000        # URL del backend
NEXT_PUBLIC_SUPABASE_URL=                        # Project URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=                   # anon/public key de ese proyecto
```

Los dos valores de Supabase están en **Project Settings → API** dentro del dashboard de tu proyecto.

## Instalación y ejecución

```bash
bun install
bun run dev
```

La app queda disponible en [http://localhost:3001](http://localhost:3001).

> El dev server corre en el puerto **3001** (no 3000) a propósito, para no chocar con el backend, que por defecto corre en `localhost:3000`.

## Scripts disponibles

| Comando         | Qué hace                              |
| --------------- | -------------------------------------- |
| `bun run dev`   | Levanta el servidor de desarrollo      |
| `bun run build` | Compila la app para producción         |
| `bun run start` | Sirve el build de producción           |
| `bun run lint`  | Corre ESLint sobre el proyecto         |

## Flujo de la app

1. **Login** (`/login`): el usuario inicia sesión o crea una cuenta con Supabase.
2. Tras autenticarse, se redirige a **`/board`**, la pantalla principal.
3. En el tablero, el usuario sube una o varias fotos de sus looks y completa ciudad, género, presupuesto (opcional) y talla (opcional).
4. Al analizar, la app muestra:
   - una narrativa de estilo generada por IA,
   - una recomendación de accesorio (si aplica),
   - las prendas esenciales detectadas, cada una con recomendaciones de productos de tiendas reales para completar el look.
5. `/analyze` es un modo alterno pensado para analizar una sola imagen en vez de un tablero completo.

Si no hay sesión activa, cualquier pantalla protegida (`/board`, `/analyze`) redirige automáticamente a `/login`.
