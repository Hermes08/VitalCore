# Vesper / Puravigor — branch puravigor-dev (QA)

Branch de **QA / desarrollo** con correcciones alineadas a **Global Nutraceutics** (la página madre — fuente de las fórmulas).

## Estado

- **0 mismatches restantes** vs GN (verificación automática 2026-05-08)
- **82 productos** alineados (76 con match en GN + 6 marcados como `tag: 'custom'` para Vesper-exclusive)
- **Preview en vivo:** https://puravigor-preview-qa-2026.netlify.app

## Cambios principales (vs puravigor-main)

### Correcciones P0 (10)
- Form mismatches corregidos: Hair Skin & Nails, BCAA, Joint Matrix → tablet
- Phytoceramides: vitaminas transpuestas + duplicado eliminado
- Super Fat Burner: Cayenne → GLA 100mg (era ingrediente equivocado)
- Vit D-3 + K-2 Gummies: K-2 (MK-7) ahora presente
- Multi-Vitamin Gummies + Kids Multi: desglose completo con cantidades %DV individuales

### Correcciones P1/P2 (20+)
- Tongkat Ali: 200:1 → 100:1
- Garcinia: 60% HCA → 50% HCA + Calcium 136mg
- Kids Lutein: dosis duplicadas + fuente Lutemax® 2020
- Kids Probiotic: 1B → 2.5B CFU + DE111® strain
- Blood Pressure Support: Vit C agregado, Olive Leaf 50→125mg, Uva Ursi 25→15mg, Buchu (4:1)
- Hair, Skin & Nails: 21+ ingredientes agregados (Citrus Bioflavonoid, Hydrolyzed Keratin, ALA, Gotu Kola, Grape Seed, etc.)
- Prostate Support: 12 ingredientes agregados
- Women's Support: Soy Isoflavones, Blessed Thistle, Red Raspberry, Wild Yam, trans-Resveratrol
- Joint Matrix: alineado a fórmula completa GN (Vit A/C/E/B-1/B-2/B-6/B-12, minerales, NZ Green Lipped Mussel, etc.)
- Bone Health: Calcium 600→1000mg, +L-Lysine, +Potassium gluconate
- Calcium+Mag: ajuste de dosis a fórmula GN
- Cape Aloe: +Senna +Cascara +Fennel
- 15-Day Cleanse: +Cascara +Senna +Flaxseed
- B-100 Complex: B-1, B-2, B-6 con formas químicas correctas
- Immune Defense: +Magnesium 400mg
- BP Support: drop CoQ10 (no estaba en GN)

### Cambios estructurales
- Campo `serving` agregado a cada producto (renderer en catalog-app.js usa `${p.serving}` en el modal)
- Form sincronizado con serving (ej: si serving="2 Tablets", form="tablet")
- Take benefits actualizados: "2 caps AM" → "2 tablets AM" donde el form cambió
- 6 productos marcados con `tag: 'custom'`: daily-01, iron, rhodiola, l-theanine, cordyceps, hyaluronic

## Cómo aplicar a producción

```bash
# 1. Revisar el PR puravigor-dev → puravigor-main para ver el diff completo
# 2. Si todo OK, hacer merge del PR
# 3. Copy catalog-data.js al deploy de puravigor.com via Netlify CLI o subiendo el archivo
```

**⚠️ NO hacer merge directamente a `main` de VitalCore** — `main` es de otro proyecto. La comparación correcta es `puravigor-dev` ↔ `puravigor-main` (ambos son del proyecto Vesper/Puravigor).
