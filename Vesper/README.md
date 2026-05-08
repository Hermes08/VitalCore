# Vesper / Puravigor — branch puravigor-main

Snapshot del estado **actualmente desplegado** en https://puravigor.com (capturado 2026-05-08).

Esta branch existe como referencia de "producción" para comparar contra las correcciones propuestas en `puravigor-dev`.

## Archivos

- `catalog-data.js` — 82 productos del catálogo, dosis y supplement facts en estado live
- `catalog-data-es.js` — overlay de traducciones al español
- `catalog-app.js` — renderer del catálogo (lógica de modal, filtros, cart)

## Sitio Netlify

- **Producción:** `puravigor.com` (Netlify project: `brilliant-bavarois-ae92a3`, siteId: `5081d870-aa37-46c3-9b34-390991f7e24a`)
- **Preview QA (dev):** https://puravigor-preview-qa-2026.netlify.app (sitio Netlify aislado, sin afectar producción)

## Comparación

Para ver la propuesta de correcciones contra Global Nutraceutics (la página madre / source de fórmulas), abrir el PR `puravigor-dev → puravigor-main`.
