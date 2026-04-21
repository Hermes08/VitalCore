# Vesper — Deployment Guide

SEO-driven supplement storefront. 82 products, bilingual (EN/ES), static HTML.

## What to deploy

Deploy **this folder as-is**. It is a static site — no build step, no server runtime.

**Entry point:** `index.html` (redirects to `Home.html`).

## Canonical file map

| Path | Role |
|---|---|
| `index.html` | Root redirect → `Home.html` |
| `Home.html` | English homepage (SEO landing) |
| `Catalog.html` | Full apothecary — 82 products, modal PDP, cart |
| `Journal.html` | Article index |
| `Articles/apple-cider-vinegar-gummies.html` | P0 article |
| `Articles/magnesium-glycinate.html` | P0 article |
| `es/Home.html` | Spanish homepage |
| `es/Catalog.html` | Spanish apothecary |
| `es/articulos/gomitas-vinagre-de-manzana.html` | ES article |
| `es/articulos/magnesio-glicinato.html` | ES article |
| `data/products.js` | Product data (source of truth) |
| `catalog-data.js`, `catalog-app.js` | Catalog runtime |
| `vesper-shared.css` | Shared styles |

Nothing else should exist in the deployed output. Legacy files (`Hub.html`, `Shop.html`, `Quiz.html`, `Founder.html`, `Vesper Apothecary.html`, `vesper-3d.js`, `vesper-ui.js`, `nav-partial.html`, `UX.md`, `qa/`, `uploads/`, `ios-frame.jsx`) have been removed — if your deploy shows them, you are deploying from a stale snapshot.

## SEO wiring

- `hreflang`: EN canonical is `./Home.html`, ES is `./es/Home.html`, with `x-default` → EN.
- Product URLs are slug-based via the catalog modal (`?id=<slug>`).
- Each article has `<link rel="canonical">` + JSON-LD Article schema.

## Instructions for implementation agent

If you are an agent picking this up:

1. Serve the project root. `index.html` redirects to `Home.html`.
2. **Do not re-introduce deleted legacy pages.** If the user asks for quiz/bundles/etc., build them fresh — do not look for `Quiz.html` etc.; they were explicitly removed.
3. `data/products.js` is the single source of truth for product data. Both `Catalog.html` and `Home.html` read from it via the `window.VESPER_PRODUCTS` / `VESPER_P0` / `VESPER_FIND` globals.
4. Product images are CSS-rendered (orb halo + colored capsule/gummy/tablet shape). No raster assets needed.
5. For new pages, reuse `vesper-shared.css` and match the nav pattern in `Home.html`.

## Local preview

```sh
python3 -m http.server 8000
# → open http://localhost:8000/
```
