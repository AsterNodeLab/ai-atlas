# AI Atlas — Glosario de Inteligencia Artificial

Glosario visual e interactivo en español (es-MX) para aprender IA desde cero hasta nivel de investigación.
Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4. Sin dependencias de UI externas.

## Ejecutar

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # exportación estática en ./out (todas las páginas se prerenderizan)
npm run start      # servir ./out localmente
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run models:sync  # actualiza el catálogo de modelos desde la API pública de OpenRouter
```

## Despliegue (GitHub Pages)

El sitio se exporta como HTML estático (`output: "export"`). Cada push a `main` ejecuta `.github/workflows/deploy.yml`, que compila con el `basePath` del repositorio y publica `out/` en GitHub Pages.

Variables: `NEXT_PUBLIC_BASE_PATH` (p. ej. `/ai-atlas`) y `NEXT_PUBLIC_SITE_URL` (URL pública completa); el workflow las define automáticamente.

## Arquitectura

```
app/                      Rutas (todas estáticas / SSG)
  page.tsx                Home
  glossary/               Índice A–Z y /glossary/[slug] (+ opengraph-image por término)
  explore/                Explorador con filtros en la URL
  learn/                  Rutas de aprendizaje y /learn/[slug]
  map/                    Mapa de IA (knowledge graph)
  categories/             Categorías y /categories/[slug]
  saved/                  Guardados + vistos recientemente (localStorage)
  tools/                  Recursos: directorio de herramientas de IA (enlaces oficiales verificados)
  models/                 Recursos: glosario de modelos, /models/[proveedor] y /models/[proveedor]/[modelo]
  search-index.json/      Índice de búsqueda estático (lo consume el cliente)
  sitemap.ts, robots.ts, not-found.tsx
components/
  glossary/               Tarjetas, badges, bloques del artículo, RichText, TermLink (tooltip)
  search/                 SearchPanel (combobox accesible), paleta ⌘K
  diagrams/               FlowDiagram + diagramas SVG a medida
  map/, learning/, explore/, home/, navigation/, ui/
content/
  glossary/*.ts           Conceptos por tema (datos tipados)
  learning-paths/         Rutas
  categories.ts, map.ts
  tools.ts                Herramientas curadas (nivel, categoría, URL oficial)
  models/openrouter.json  Snapshot procesado de la API de OpenRouter (solo datos estructurados)
  models/providers.ts     Descripciones propias de cada proveedor
lib/
  glossary.ts             Acceso a datos + validación de enlaces en build
  search.ts               Motor de búsqueda local (normalización, alias, fuzzy)
  storage.ts, analytics.ts, i18n.ts, site.ts
types/glossary.ts         Modelo de contenido
```

## Añadir un concepto

1. Agrega un objeto `TermInput` al archivo temático en `content/glossary/`.
2. En los textos, enlaza otros conceptos con `[[slug]]` o `[[slug|texto visible]]`; también se admite `**negritas**`, `*itálicas*` y `` `código` ``.
3. `npm run build`: si un `slug` relacionado o un enlace no existe, el build falla con la lista de errores (no hay enlaces muertos).

Campos opcionales: `analogy`, `inThirtySeconds`, `diagram`, `example`, `realExample`, `mentalModel`, `math`, `comparison`, `commonMistakes`, `sources`, `frontier`, `createdAt`/`updatedAt`.

## Branding

Nombre, URL y locale en `lib/site.ts`; logo en `components/ui/logo.tsx`; colores como tokens CSS en `app/globals.css`.

## Secciones de recursos

- **Herramientas** (`/tools`): cada URL es el sitio oficial y se verificó (respuesta HTTP y título de la página). Para agregar una, edita `content/tools.ts` y actualiza `toolsVerifiedAt`.
- **Modelos** (`/models`): `npm run models:sync` descarga la lista pública de OpenRouter, agrupa variantes `:free`/`:batch`, excluye alias y routers y guarda solo datos estructurados. Las descripciones en español se generan a partir de esos datos (no se copian textos de los proveedores).
- Ambas secciones usan el tema `.theme-resources` (acento teal) para distinguirse del glosario.
