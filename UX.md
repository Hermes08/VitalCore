# Vesper — UX & Funnel Spec

The rules that keep the pages honest. If a behavior isn't written here, default to the quietest, least pushy option.

---

## 1. The four funnels

### A. Quiz → Report → Buy (the "advised" path)
Landing on `Quiz.html`, the user answers 5–7 short questions (concern, sleep quality, stressors, age/life-stage, routine). Each answer is tagged against our `need:` taxonomy (`sleep`, `calm`, `energy`, `women`, `men`, `digestion`, `joints`, `heart`, `beauty`, `kids`, `daily`).

End-state: a **Report** with 1–3 recommended formulas, ranked by `need` match score + P0 priority (so we don't recommend a niche molecule when a bestseller fits). Each card in the report links to its `Articles/<slug>.html` guide, **not** directly to cart. Reasoning: the Journal article is where we earn the click, and it ends with a product panel.

Do **not** show price on the Quiz-result cards — price arrives at the article footer, after evidence. The CTA on the report card is "Read the guide →".

### B. Catalog → PDP → Cart (the "informed" path)
`Catalog.html` is the index of every SKU. Filters by need, form, price. Each card is a cell in a borderless grid — no card-within-card noise.

Click → PDP modal slides in from the right (full-height sheet, not a full-page route). Price, dose, third-party test, benefits, facts table, single CTA at the bottom.

The PDP `.cta-bar` is **position:sticky bottom** so it always has a buy button within reach. On mobile, the bar stacks: price+CTA row on top, subscription toggle row underneath. It must never cover the scrolling content's last line — `body` has `padding-bottom` equal to CTA-bar height + `env(safe-area-inset-bottom)`.

### C. Journal → Article → Product panel (the "learned" path)
`Journal.html` indexes all 82 guides. Readers arriving from search land on an article, scroll, and at the end see a product panel for the SKU the article is about. The panel re-uses the same component as the Catalog card but larger and with a direct "Add to routine" CTA.

This is the highest-intent funnel because the user just read 10 minutes about the molecule. Conversion here should be 3–5× the Catalog cold-browse rate.

### D. Special Order (the "niche" path)
Six products are currently flagged `special:true`: L-Theanine 200mg, Glutathione Reduced, CoQ10 100mg, Tongkat Ali, DIM Complex, Berberine Complex. These are low-volume SKUs we don't keep in inventory but will compound to order.

Rules:
1. Display a **dark "Pedido especial / Special Order"** tag on the card (not ochre, not sage — matte ink so it reads as distinct from priority badges).
2. Modal CTA text swaps: `Añadir al carrito` → `Solicitar pedido especial`.
3. Price line shows a lead-time subtext: `Pedido especial · 3–5 semanas`.
4. These products never appear in the Quiz recommender. Quiz only recommends in-stock formulas.
5. A Special Order basket doesn't coexist with the subscription toggle — a special-order item is a one-time production run.

---

## 2. Subscription mechanics

Every non-special product supports `Once / Every month / Every 2 months`. Default: **Every month** (lowers mental friction; matches Ritual's convention).

The `.sub-choose` toggle is persistent across the visit (sessionStorage) so switching between PDPs doesn't force re-selection. Price line updates to show `$X / month` when subscribed, strikethrough `$Y` one-time price when applicable (10% off).

Subscription is paused-by-the-user, not canceled. Dashboard (future) shows next shipment date and a single "Skip this month" button.

---

## 3. Mobile CTA rules (the bottom-of-screen contract)

This is the rule that's easiest to break. Do not break it.

1. **Sticky buy bar** is only on PDP (`Catalog.html` modal). It is `position:sticky bottom:0`. Never add a second sticky bar on Home or Shop — mobile users get exactly one CTA surface at a time.
2. **Top nav mobile buy button** (`nav.top .m-buy`) only shows on `max-width:900px` and only links to `Quiz.html` or `Catalog.html` — it is a navigation shortcut, not a cart action.
3. The PDP sticky CTA **never covers price**. On `max-width:640px` we rewrite the grid: `grid-template-columns:1fr auto; grid-template-rows:auto auto`. Price on row 1 col 1, Add button on row 1 col 2, subscription toggle spans row 2. This guarantees price is always visible above the CTA row.
4. `body` on PDP has `padding-bottom: 96px` on mobile so the last line of content clears the CTA bar.
5. Safe-area: add `env(safe-area-inset-bottom)` to the CTA bar's bottom padding so it doesn't fight the iOS home indicator.
6. No CTA should ever use `position:fixed` on mobile except the cart drawer (which is out-of-flow anyway).

---

## 4. Content hierarchy rules

- **Home hero:** one featured bestseller, rotating through the top 3. Never more than 3 — 5 is where users stop paying attention to any of them.
- **Bestsellers strip:** 5 cards. Ranked by `rank` (our internal metric), not by search volume. We've earned our opinion; the strip reflects it.
- **Needs row:** categorical entry for buyers who already know what they want (sleep, calm, energy, women, men, gut, joints).
- **Journal preview:** 6 articles. Mixed P0/P1 so it doesn't feel like a pile of bestsellers.
- **Founder column:** never lead with it on Home. It's a trust anchor that belongs mid-page or at `Founder.html`.

---

## 5. Tone of copy

Short sentences. No exclamation marks. No emoji. No "game-changer". Serif italic for names and headlines, monospace caps for metadata (dose, vol/mo, KD, ratings). The voice is the pharmacist who's happy you asked, not the wellness influencer who's happy you scrolled.

Spanish copy on `/es/` pages reads in the same register — we don't soften it for the Spanish-speaking reader. "Honest product" translates as "producto honesto", not "producto buenísimo".

---

## 6. What we don't do

- No countdown timers.
- No "only 3 left" scarcity copy.
- No push notifications asking to bundle.
- No email capture modal before the user has read anything.
- No upsell between cart and checkout.
- No dark-mode toggle on Quiz — the Quiz is a quiet form, not a product.
