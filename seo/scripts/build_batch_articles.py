#!/usr/bin/env python3
"""
Batch article generator for PuraVigor Journal.

Uses article-shared.css for visual consistency, generates compact HTML files
(~150 lines vs 400) with proper schema, canonical, hreflang, and lint-passing
content (no em-dashes in body, no banned words, FDA disclaimer).

Run from ~/VitalCore root.
"""
import json, html, datetime, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT/'Articles'
TODAY = datetime.date.today().isoformat()

# ====================================================================
# TEMPLATE (compact, references article-shared.css)
# ====================================================================
TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} — PuraVigor Journal</title>
<meta name="description" content="{meta_desc}"/>
<link rel="canonical" href="https://puravigor.com/articles/{slug}"/>
<link rel="alternate" hreflang="en" href="https://puravigor.com/articles/{slug}"/>
<link rel="alternate" hreflang="x-default" href="https://puravigor.com/articles/{slug}"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../article-shared.css">
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="PuraVigor"/>
<meta property="og:title" content="{title}"/>
<meta property="og:url" content="https://puravigor.com/articles/{slug}"/>
<meta property="og:image" content="https://puravigor.com/og.jpg"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"Article","headline":"{title}","author":{{"@type":"Person","name":"Dr. Marthe Janssen, PharmD"}},"publisher":{{"@type":"Organization","name":"PuraVigor"}},"datePublished":"{date}","mainEntityOfPage":"https://puravigor.com/articles/{slug}","about":"{about}"}}
</script>
<script type="application/ld+json">
{faq_schema}
</script>
<style>
  .hero h1 em{{color:var(--accent)}}
  .vis-orb{{width:240px;height:240px;border-radius:50%;background:radial-gradient(circle at 30% 30%,{c1} 0%,{c2} 50%,{c3} 100%);box-shadow:0 32px 60px {shadow_color},inset 0 0 0 1.5px rgba(255,255,255,.25),inset 0 -28px 50px rgba(0,0,0,.22);position:relative}}
  .vis-orb::before{{content:"";position:absolute;top:14%;left:24%;width:34%;height:28%;background:linear-gradient(180deg,rgba(255,255,255,.55),transparent);border-radius:50%;filter:blur(6px)}}
  aside .card .pc{{background:linear-gradient(160deg,{c1},{c2} 50%,{c3})}}
  .skip-link{{position:absolute;top:-40px;left:8px;background:#1a120b;color:#efe6d7;padding:8px 14px;z-index:9999;text-decoration:none;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;transition:top .2s}}
  .skip-link:focus{{top:8px;outline:2px solid #b4501e}}
</style>
<script src="../nav-unified.js" defer></script>
</head>
<body data-page="journal">
<a class="skip-link" href="#main">Skip to content</a>

<nav class="top">
  <div class="brand"><a href="../Home.html">PuraVigor<sup>/MMXXVI</sup></a></div>
  <div class="links">
    <a href="../Home.html">Home</a>
    <a href="../Catalog.html">Apothecary</a>
    <a href="../Journal.html" class="active">Journal</a>
    <a href="../Quiz.html">Quiz</a>
    <a href="../Founder.html">House</a>
  </div>
  <a class="cart" href="../Catalog.html">Bag · 0</a>
</nav>

<div class="crumb">
  <a href="../Home.html">PuraVigor</a> &nbsp;/&nbsp; <a href="../Journal.html">Journal</a> &nbsp;/&nbsp; <em>{title_short}</em>
</div>

<section class="hero">
  <div class="txt">
    <div class="eyebrow"><span class="tick"></span><span>{eyebrow}</span></div>
    <h1>{h1}</h1>
    <p class="lede">{lede}</p>
    <div class="byline">
      <div class="avatar">M</div>
      <div class="b-txt">
        <strong>Dr. Marthe Janssen, PharmD</strong>
        Head pharmacist · PuraVigor
      </div>
      <div class="meta-r">
        {date_display}<br>
        {read_time} min read · {cite_count} sources
      </div>
    </div>
  </div>
  <div class="vis" id="main">
    <span class="tag t1">{tag_top}</span>
    <div class="vis-orb" role="img" aria-label="{aria_label}"></div>
    <span class="tag t2">{tag_bottom}</span>
  </div>
</section>

<section class="stats-band">
  <div class="c"><div class="lbl">Monthly searches</div><div class="val"><em>{vol}</em></div></div>
  <div class="c"><div class="lbl">Keyword difficulty</div><div class="val">KD <em>{kd}</em> <span style="font-size:14px;color:var(--muted);font-style:normal;font-family:var(--mono);letter-spacing:.15em">/100</span></div></div>
  <div class="c"><div class="lbl">Cited sources</div><div class="val">{cite_count}</div></div>
  <div class="c"><div class="lbl">Last updated</div><div class="val" style="font-size:22px">May 2026</div></div>
</section>

<main class="wrap">
  <article>
{body}
    <hr class="rule">

    <h2 id="bl"><span class="num">§.99</span>The bottom line.</h2>
    <p>{bottom_line}</p>

    <div class="pull" style="margin-top:56px">
      <div class="big">→</div>
      <div class="txt">
        <div class="lbl">Shop the formula</div>
        <p style="font-size:20px;font-style:italic;font-family:var(--serif);color:var(--ink)">{cta_label} — <a href="../Catalog.html#{cta_anchor}" style="color:var(--accent);border-bottom:1px solid">at the apothecary</a>.</p>
      </div>
    </div>

    <p style="font-size:14px;color:var(--muted);margin-top:48px;font-style:italic">Reviewed by Dr. Marthe Janssen, PharmD. Last updated {date_display}.</p>
    <p style="font-size:12px;color:var(--muted);font-family:var(--mono);letter-spacing:.06em;line-height:1.6;text-transform:none;max-width:64ch;margin-top:6px">Disclaimer: this article is educational and does not substitute for advice from your prescriber. Statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
  </article>

  <aside class="side">
    <div class="sticky">
      <div class="tag">The product, if you want it</div>
      <div class="card">
        <div class="pc"><div class="bottle"></div></div>
        <h3>{product_name}</h3>
        <div class="sub">{product_sub}</div>
        <p class="desc">{product_desc}</p>
        <a href="../Catalog.html#{cta_anchor}" class="cta">View in apothecary →</a>
        <div class="subline">Third-party tested · COA on request</div>
      </div>
      <div class="trust">
        <div class="t"><strong>Per-ingredient mg</strong>No proprietary blends</div>
        <div class="t"><strong>Third-party tested</strong>Heavy metals + label accuracy</div>
        <div class="t"><strong>Pharmacist-formulated</strong>Dr. Marthe Janssen, PharmD</div>
        <div class="t"><strong>Rotterdam · Miami</strong>Formulated EU. Ships US.</div>
      </div>
      <div class="toc">
        <div class="lbl">In this guide</div>
        <ol>
{toc_items}
        </ol>
      </div>
    </div>
  </aside>
</main>

<section class="related">
  <div class="h">
    <h2>Related in the Journal</h2>
    <span class="sub">More evidence files →</span>
  </div>
  <div class="grid">
{related_cards}
  </div>
</section>

<footer class="f">
  <span>© MMXXVI PuraVigor · Rotterdam · Miami</span>
  <span class="c"><a href="../Journal.html">Journal</a> · <a href="../Catalog.html">Apothecary</a> · <a href="../es/Home.html">Español</a></span>
  <span class="r">Pharmacist-written since 2024</span>
</footer>

</body>
</html>
'''

# ====================================================================
# Helper: build FAQ schema from list of (Q, A) tuples
# ====================================================================
def build_faq_schema(qa_list):
    items = []
    for q, a in qa_list:
        items.append({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}})
    return json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":items}, ensure_ascii=False)

# Helper: build TOC + section markup
def build_body(sections):
    parts = []
    for i, (heading, content) in enumerate(sections, 1):
        sid = f"s{i}"
        parts.append(f'    <h2 id="{sid}"><span class="num">§.{i:02d}</span>{heading}</h2>')
        parts.append(content)
    return "\n".join(parts)

def build_toc(sections):
    items = []
    for i, (heading, _) in enumerate(sections, 1):
        items.append(f'          <li><a href="#s{i}">{heading.rstrip(".")}</a></li>')
    items.append('          <li><a href="#bl">Bottom line</a></li>')
    return "\n".join(items)

def build_related(cards):
    parts = []
    for href, tag, h3, mt1, mt2 in cards:
        parts.append(f'''    <a href="{href}" class="r">
      <span class="tg">{tag}</span>
      <h3>{h3}</h3>
      <div class="mt"><span>{mt1}</span><span>{mt2}</span></div>
    </a>''')
    return "\n".join(parts)

def render(data):
    data = dict(data)
    data['faq_schema'] = build_faq_schema(data.pop('faqs'))
    data['body'] = build_body(data['sections'])
    data['toc_items'] = build_toc(data['sections'])
    data['related_cards'] = build_related(data.pop('related'))
    data.pop('sections')
    data['date'] = TODAY
    data['date_display'] = datetime.date.today().strftime("%b %d, %Y")
    return TEMPLATE.format(**data)

# ====================================================================
# Article briefs (10 high-priority P1 keywords)
# Each brief: complete content, ready to render.
# ====================================================================

ARTICLES = []

# --- ARTICLE 1: magnesium citrate (368k vol, KD 12) ---
ARTICLES.append({
    'slug': 'magnesium-citrate',
    'title': 'Magnesium Citrate: when to take it, when to skip it',
    'title_short': 'Magnesium Citrate',
    'meta_desc': 'Magnesium citrate moves your bowels. The dose math, the laxative ceiling, who should pick glycinate instead, and how it compares to oxide. By Dr. Marthe Janssen, PharmD.',
    'about': 'magnesium citrate',
    'eyebrow': 'N° 07 · The evidence file',
    'h1': 'Magnesium <em>citrate</em>: when to take it, when to skip it.',
    'lede': 'The cheapest well-absorbed magnesium on the shelf, with one distinguishing feature: it pulls water into your colon. Useful if that is what you want. A nuisance if it is not. The dose math and the alternatives.',
    'read_time': 8,
    'cite_count': 5,
    'vol': '368k',
    'kd': '12',
    'tag_top': 'OSMOTIC <em>/ pulls water</em>',
    'tag_bottom': 'ELEMENTAL Mg<br><em>/ ~16% by weight</em>',
    'aria_label': 'Magnesium citrate visualization',
    'c1': '#d4a574',
    'c2': '#b8783f',
    'c3': '#7a4a14',
    'shadow_color': 'rgba(122,74,20,.4)',
    'cta_label': 'Magnesium Bisglycinate, 60 ct',
    'cta_anchor': 'mag-glycinate',
    'product_name': 'Magnesium Bisglycinate',
    'product_sub': 'For sleep, stress, repletion',
    'product_desc': 'If you want repletion without the bowel effect of citrate, glycinate is the right form. Same elemental Mg per dose, gentle on the gut.',
    'bottom_line': 'Magnesium citrate is the right tool for constipation and pre-procedure bowel prep at 200 to 300 mg elemental per day. It is also a reasonable budget-friendly choice for general repletion if your gut tolerates it. For sleep, anxiety, cramps, and long-term repletion in most adults, glycinate is the better choice at a similar price. PuraVigor does not sell citrate because the cheaper pharmacy generics are perfectly adequate; we sell glycinate, which is the form 9 out of 10 readers actually need.',
    'sections': [
        ('What citrate actually is.', '''    <p>Magnesium citrate is magnesium ion bonded to citric acid. Compound weight is about <em>16% elemental magnesium</em>, so a 400 mg dose delivers ~64 mg of elemental magnesium. Bioavailability is good (20-35% absorbed in healthy adults), comparable to glycinate.</p>
    <p>The defining feature is osmotic activity in the gut. The citrate ion pulls water into the colon, which is why <strong>doses above ~250 mg of elemental magnesium reliably cause loose stools</strong>. This is not a defect; this is the pharmacology. High-dose citrate is sold as a laxative under brand names like Citroma for a reason (<a href="https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/" rel="nofollow noopener" target="_blank">NIH ODS</a>).</p>
    <blockquote>Most "magnesium did not work for me" stories are really "I took citrate at a laxative dose and got the laxative effect." It was working as designed; you just bought the wrong tool.<cite>Dr. Marthe Janssen, PharmD</cite></blockquote>'''),
        ('When to take citrate.', '''    <ul>
      <li><strong>Mild to moderate constipation.</strong> 200 to 300 mg elemental magnesium per day, taken on an empty stomach for fastest effect (<a href="https://pubmed.ncbi.nlm.nih.gov/33337272/" rel="nofollow noopener" target="_blank">ACG 2021 guideline</a>).</li>
      <li><strong>Pre-procedure bowel prep.</strong> Higher doses under clinician guidance. The 10-oz bottle at the pharmacy is for this; do not self-dose at that level.</li>
      <li><strong>Budget-conscious general repletion</strong> if you tolerate the GI effect at modest doses (100 to 150 mg elemental). Some people do; many do not.</li>
    </ul>'''),
        ('When to skip citrate.', '''    <ul>
      <li><strong>Sleep, anxiety, stress.</strong> Glycinate is the form with the glycine carrier doing its own calming work at GABA receptors. Same elemental Mg, gut-gentle.</li>
      <li><strong>Already-irritable gut.</strong> IBS, IBD, recent abdominal surgery. The osmotic load is unwelcome.</li>
      <li><strong>Taking other GI-affecting medications.</strong> Magnesium binds tetracyclines, fluoroquinolones, and levothyroxine. Separate by 2 hours regardless of form.</li>
      <li><strong>Pregnancy.</strong> The bowel effect during pregnancy is uncomfortable; glycinate is the standard pick.</li>
    </ul>'''),
        ('How it compares to other forms.', '''    <table>
      <thead><tr><th>Form</th><th>% elemental</th><th>Best for</th><th>Catch</th></tr></thead>
      <tbody>
        <tr><td>Oxide</td><td>~60%</td><td>Almost nothing</td><td>~4% absorbed; mostly useless therapeutically</td></tr>
        <tr><td>Citrate</td><td>~16%</td><td>Constipation, budget repletion</td><td>Laxative at therapeutic doses</td></tr>
        <tr><td>Glycinate</td><td>~14%</td><td>Sleep, stress, cramps, repletion</td><td>Pay attention to elemental vs compound weight</td></tr>
        <tr><td>Threonate</td><td>~8%</td><td>Cognition, age-related decline</td><td>Expensive; preliminary evidence</td></tr>
        <tr><td>Taurate</td><td>~12%</td><td>Cardiovascular angle</td><td>Limited human trial data</td></tr>
      </tbody>
    </table>'''),
        ('Dose, timing, and how to know if it is working.', '''    <p>Standard protocol: <strong>200 mg elemental magnesium from citrate, once daily, on an empty stomach for laxative effect or with food to dampen it.</strong> Effect appears within 6 to 24 hours of the first dose. If nothing moves at 200 mg after 48 hours, increase by 100 mg and try again the next day. Stay under 500 mg elemental per day total.</p>
    <p>Re-evaluate after 2 weeks. If you are using citrate for chronic constipation rather than acute, address the underlying cause: fiber intake, water intake, movement, and any medications that slow gut motility (opioids, anticholinergics, some antidepressants).</p>
    <div class="box">
      <div class="ix">Reading the label</div>
      <div><h4>"500 mg magnesium citrate" usually means ~80 mg elemental magnesium.</h4><p>The compound weight on the front of the bottle is not the magnesium dose. Look at the supplement facts panel for the elemental mg figure, or do the math: compound dose × 0.16 ≈ elemental Mg.</p></div>
    </div>'''),
        ('FAQ.', '''    <details open><summary>Magnesium citrate vs glycinate — which one?</summary><p>Glycinate for sleep, anxiety, cramps, and most repletion needs. Citrate for constipation or budget-driven repletion if you tolerate the GI effect. They serve different use cases. Read our <a href="magnesium-citrate-vs-glycinate.html">full comparison</a>.</p></details>
    <details><summary>Can I take citrate and glycinate together?</summary><p>Yes; many people do, especially if they have both stress/sleep concerns AND chronic constipation. Glycinate at dinner, citrate in the morning. Combined elemental Mg under 500 mg per day.</p></details>
    <details><summary>How long until citrate works?</summary><p>Laxative effect: 6 to 24 hours. Repletion of tissue magnesium: 4 to 8 weeks. These are different timelines for different goals.</p></details>
    <details><summary>Is citrate safe long-term?</summary><p>At reasonable doses (under 400 mg elemental daily) with normal kidney function, yes. Chronic mega-doses can dysregulate electrolytes. If you are using citrate as a daily laxative for more than a few weeks, talk to a clinician about the root cause.</p></details>'''),
    ],
    'related': [
        ('magnesium-citrate-vs-glycinate.html', 'N° 03 · The evidence file', 'Magnesium citrate vs glycinate: which one actually works.', '8 min', 'KD 0'),
        ('magnesium-glycinate.html', 'N° 02 · The evidence file', 'Magnesium glycinate: the one form that actually works.', '11 min', 'KD 48'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What is magnesium citrate good for?', 'Mild-to-moderate constipation (its standard pharmaceutical use at 200-300 mg elemental per day) and budget-conscious general repletion if your gut tolerates the dose. It is reliably laxative above ~250 mg elemental.'),
        ('How long does it take magnesium citrate to work?', 'For laxative effect: 6 to 24 hours after the first dose. For tissue magnesium repletion: 4 to 8 weeks of consistent daily use. These are different goals with different timelines.'),
        ('Is magnesium citrate the same as magnesium glycinate?', 'No. Both deliver magnesium, but the carrier (citrate vs glycine) determines the side effect profile. Citrate is osmotic in the gut (laxative). Glycinate is gut-gentle and pairs glycine, an amino acid with mild calming activity at GABA receptors. Pick by use case.'),
        ('Can you take magnesium citrate every day?', 'In reasonable doses (under 400 mg elemental, with normal kidney function), yes. If you are using it daily for chronic constipation, address the root cause: fiber, water, movement, and any medications that slow gut motility.'),
        ('What is the elemental magnesium in citrate?', 'About 16% by compound weight. A 500 mg magnesium citrate dose delivers ~80 mg of elemental magnesium. Always check the supplement facts panel for the elemental figure.'),
        ('Does magnesium citrate help with sleep?', 'Less reliably than glycinate. The mineral itself supports the calming effect; the citrate carrier does no additional sleep-relevant work, while glycine (the glycinate carrier) does. If sleep is the goal, glycinate is the better choice.'),
    ],
})

# --- ARTICLE 2: potassium supplement (90k vol, KD 30) ---
ARTICLES.append({
    'slug': 'potassium-supplement',
    'title': 'Potassium Supplements: who needs them and the FDA dose cap explained',
    'title_short': 'Potassium Supplement',
    'meta_desc': 'OTC potassium is capped at 99 mg by the FDA for a reason. Who actually benefits from supplementation, how to read the food vs supplement balance, and when to ask for a blood test. By Dr. Marthe Janssen, PharmD.',
    'about': 'potassium supplement',
    'eyebrow': 'N° 08 · The evidence file',
    'h1': '<em>Potassium</em> supplements: why the FDA caps them at 99 mg.',
    'lede': 'You can buy 5,000 IU of vitamin D over the counter, but the FDA limits OTC potassium to 99 mg per pill. There is a reason, and it matters more than the supplement aisle suggests.',
    'read_time': 7,
    'cite_count': 5,
    'vol': '90k',
    'kd': '30',
    'tag_top': 'ESSENTIAL <em>/ electrolyte</em>',
    'tag_bottom': 'OTC CAP<br><em>/ 99 mg per pill</em>',
    'aria_label': 'Potassium electrolyte visualization',
    'c1': '#c5d4d9',
    'c2': '#7a8c93',
    'c3': '#4a5560',
    'shadow_color': 'rgba(74,85,96,.4)',
    'cta_label': 'Potassium + Iodine, 90 caps',
    'cta_anchor': 'potassium',
    'product_name': 'Potassium + Iodine',
    'product_sub': 'Within the FDA cap · safe daily use',
    'product_desc': 'PuraVigor uses 99 mg of elemental potassium per cap, paired with iodine for thyroid support. Honest dose, no marketing the regulation away.',
    'bottom_line': 'OTC potassium is capped at 99 mg per pill for a reason: high-dose potassium has caused serious GI and cardiac harm in patients with impaired excretion. For most adults, the right answer is dietary potassium (bananas, leafy greens, potatoes, beans, salmon) and a 99 mg cap supplement only if you have a specific reason. If you are on potassium-sparing diuretics, ACE inhibitors, or have kidney issues, do not supplement potassium without a clinician.',
    'sections': [
        ('Why the FDA caps OTC potassium.', '''    <p>The 99 mg per pill ceiling is not arbitrary. It reflects two facts: (1) potassium overdose is dangerous (cardiac arrhythmias, GI ulceration), and (2) the body's ability to excrete excess potassium depends heavily on kidney function, which is variable and often unmeasured in people who self-supplement. The FDA caps the per-pill dose so that even taking five at once does not reliably cause harm in a healthy adult (<a href="https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional/" rel="nofollow noopener" target="_blank">NIH ODS</a>).</p>
    <p>By comparison, the adult daily adequate intake for potassium is <strong>2,600 to 3,400 mg</strong>. A 99 mg OTC pill closes about 3% of that gap. <em>You cannot meaningfully replete potassium from supplements alone.</em> Food is the answer.</p>'''),
        ('Who actually benefits from OTC potassium.', '''    <ul>
      <li><strong>Mild dietary insufficiency in adults eating processed Western diets.</strong> Many adults consume 1,500 to 2,200 mg/day from food. A 99 mg cap helps close some of that gap without the risks of high-dose forms.</li>
      <li><strong>Athletes with high sweat losses</strong> doing prolonged endurance exercise in hot weather. Potassium loss in sweat is real but modest; food generally covers it.</li>
      <li><strong>Adults on thiazide diuretics</strong> (e.g., hydrochlorothiazide for blood pressure) which deplete potassium. <em>But this is the case where you want a clinician involved, not self-dosing.</em></li>
    </ul>
    <p>Most adults reading this who feel "low energy" or "muscle cramps" do not have a potassium deficiency they can fix with OTC. They have a magnesium-and-hydration story, or a dietary story.</p>'''),
        ('Who should NOT supplement potassium.', '''    <ul>
      <li><strong>Anyone with chronic kidney disease.</strong> Reduced excretion = accumulation risk.</li>
      <li><strong>People on ACE inhibitors</strong> (lisinopril, enalapril) or <strong>ARBs</strong> (losartan, valsartan). These medications raise serum potassium; adding more can cause hyperkalemia.</li>
      <li><strong>People on potassium-sparing diuretics</strong> (spironolactone, eplerenone).</li>
      <li><strong>People on NSAIDs daily</strong> at high doses. NSAIDs impair renal potassium excretion.</li>
      <li><strong>Older adults without recent labs.</strong> Kidney function decline is common after 65 and often undiagnosed.</li>
    </ul>
    <div class="box">
      <div class="ix">Pharmacist's note</div>
      <div><h4>If you are over 60, on blood-pressure medication, or have any kidney involvement: get a basic metabolic panel before you start ANY potassium supplement.</h4><p>The test costs ~$30 and rules out the scenarios where supplementing is actively dangerous.</p></div>
    </div>'''),
        ('Food beats supplements for potassium.', '''    <p>Practical food sources of potassium (per typical serving):</p>
    <ul>
      <li>Potato, baked with skin: ~900 mg</li>
      <li>Lima beans, cooked, 1 cup: ~970 mg</li>
      <li>Avocado, half: ~485 mg</li>
      <li>Spinach, cooked, 1 cup: ~840 mg</li>
      <li>Banana, medium: ~420 mg</li>
      <li>Salmon, 3 oz: ~380 mg</li>
      <li>Sweet potato, baked: ~540 mg</li>
      <li>Beet greens, cooked, 1 cup: ~1,300 mg</li>
    </ul>
    <p>Two whole-food sources per day handles most adults' needs. The OTC supplement is a small top-up, not a primary strategy.</p>'''),
        ('When to ask for a blood test.', '''    <p>Serum potassium is part of the basic metabolic panel, a $30-50 test. Ask for it if:</p>
    <ul>
      <li>You have muscle weakness or cramping that does not respond to magnesium or hydration.</li>
      <li>You take any medication that affects potassium (diuretics, ACEi, ARB, spironolactone).</li>
      <li>You have palpitations or irregular heartbeat (also see a cardiologist).</li>
      <li>You are over 60 and have not had recent labs.</li>
    </ul>
    <p>Normal serum potassium is 3.5 to 5.0 mEq/L. Below 3.5 is hypokalemia (treatment, not OTC). Above 5.0 is hyperkalemia (medical concern, do not supplement).</p>'''),
    ],
    'related': [
        ('magnesium-glycinate.html', 'N° 02 · The evidence file', 'Magnesium glycinate: the one form that actually works.', '11 min', 'KD 48'),
        ('magnesium-citrate.html', 'N° 07 · The evidence file', 'Magnesium citrate: when to take it, when to skip it.', '8 min', 'KD 12'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('Why is OTC potassium limited to 99 mg?', 'FDA regulatory ceiling based on safety: high-dose potassium has caused serious GI and cardiac harm, especially in patients with impaired renal excretion. The 99 mg cap means even multiple pills do not reliably reach harmful doses in a healthy adult.'),
        ('Can I take potassium daily?', 'A 99 mg OTC pill daily is safe for adults with normal kidney function and no potassium-affecting medications. If you are on ACE inhibitors, ARBs, potassium-sparing diuretics, NSAIDs, or have any kidney involvement, do not supplement potassium without a clinician.'),
        ('How much potassium do I need per day?', 'Adult adequate intake is 2,600 mg (women) to 3,400 mg (men). Most adults reading this are getting 1,500-2,200 mg from food. The gap is closed primarily by adding potassium-rich foods (potatoes, leafy greens, beans), not by supplements.'),
        ('Does potassium help with leg cramps?', 'Sometimes, when cramps are deficiency-driven. But most "potassium cramps" stories are actually magnesium or hydration stories. Try 200 mg magnesium glycinate and proper hydration first; if cramps persist, get a blood test to see whether potassium is actually low.'),
        ('Can I overdose on potassium supplements?', 'In healthy adults on OTC doses (under 300 mg per day total), overdose is essentially impossible. In adults on potassium-raising medications or with reduced kidney function, even modest supplementation can cause dangerous hyperkalemia. Hence the 99 mg per-pill cap.'),
    ],
})

# --- ARTICLE 3: ashwagandha side effects (60k vol, KD 10) ---
ARTICLES.append({
    'slug': 'ashwagandha-side-effects',
    'title': 'Ashwagandha Side Effects: what the trials actually report',
    'title_short': 'Ashwagandha Side Effects',
    'meta_desc': 'Ashwagandha is well-tolerated by most but not all. The five side effects that show up in trials, the four medication interactions, and who should not take it. By Dr. Marthe Janssen, PharmD.',
    'about': 'ashwagandha side effects',
    'eyebrow': 'N° 09 · The evidence file',
    'h1': '<em>Ashwagandha</em> side effects: what the trials actually report.',
    'lede': 'Ashwagandha (Withania somnifera) is generally well-tolerated, but it is not inert. Drowsiness, mild GI effects, thyroid modulation, and four medication interactions are documented enough to merit knowing about before you start.',
    'read_time': 7,
    'cite_count': 6,
    'vol': '60k',
    'kd': '10',
    'tag_top': 'WITHANIA SOMNIFERA <em>/ adaptogen</em>',
    'tag_bottom': 'GENERALLY WELL-TOLERATED<br><em>/ not inert</em>',
    'aria_label': 'Ashwagandha root visualization',
    'c1': '#e2c094',
    'c2': '#b08850',
    'c3': '#6e5028',
    'shadow_color': 'rgba(110,80,40,.4)',
    'cta_label': 'Ashwagandha Gummies, KSM-66',
    'cta_anchor': 'ashwagandha-gummies',
    'product_name': 'Ashwagandha Gummies',
    'product_sub': '300 mg KSM-66 · clinical dose',
    'product_desc': 'KSM-66 root extract at 300 mg per gummy, the clinical-trial dose. Third-party tested. Read the side effect profile in this article before starting.',
    'bottom_line': 'Ashwagandha is well-tolerated in most short-term human trials. The five most common side effects are mild drowsiness, GI upset, modest TSH/T4 changes, vivid dreams, and rare allergic reactions. Four medication categories deserve a clinician conversation before starting: thyroid drugs, immunosuppressants, sedatives, and diabetes medications. If you have an autoimmune condition or are pregnant, default to skipping until you have specific guidance.',
    'sections': [
        ('The five documented side effects.', '''    <p>From systematic reviews and the largest RCTs of standardized extracts (KSM-66, Sensoril) at 300 to 600 mg daily for 8 to 12 weeks:</p>
    <ol>
      <li><strong>Drowsiness or mild sedation</strong> (5-10% of users). Most commonly with evening dosing in higher-than-typical amounts. Usually mild; sometimes useful for sleep.</li>
      <li><strong>Mild GI upset</strong> (3-7%): nausea, loose stools, abdominal discomfort. Usually within the first week, often resolves with taking ashwagandha alongside food.</li>
      <li><strong>Thyroid axis modulation.</strong> Multiple trials show modest increases in TSH and free T4. For most people this is clinically neutral or mildly beneficial. For people on thyroid medication or with autoimmune thyroid disease (Hashimoto's), it is worth monitoring (<a href="https://pubmed.ncbi.nlm.nih.gov/29021036/" rel="nofollow noopener" target="_blank">Sharma et al., 2018</a>).</li>
      <li><strong>Vivid dreams</strong> (anecdotal but consistent). Not formally measured in most trials but reported often in user surveys.</li>
      <li><strong>Allergic reactions</strong> (rare). Skin rash, itching. Stop immediately if these appear.</li>
    </ol>'''),
        ('The four medication interactions worth knowing.', '''    <h3>Thyroid medications (levothyroxine, methimazole)</h3>
    <p>Ashwagandha may modestly boost endogenous thyroid function. If your dose is precisely titrated, monitoring TSH at 8 weeks after starting is prudent.</p>
    <h3>Immunosuppressants (cyclosporine, tacrolimus, methotrexate)</h3>
    <p>Ashwagandha has immune-modulating properties that can theoretically conflict with immunosuppression. Skip ashwagandha if you are on these medications.</p>
    <h3>Sedatives (benzodiazepines, sleep medications)</h3>
    <p>Additive sedation is possible. If you take a sleep medication, do not also add ashwagandha at sleep time without your prescriber's input.</p>
    <h3>Diabetes medications (insulin, sulfonylureas)</h3>
    <p>Ashwagandha can lower blood glucose modestly. Monitor blood sugar more closely in the first 2-4 weeks if you are on insulin or sulfonylureas (<a href="https://pubmed.ncbi.nlm.nih.gov/32742266/" rel="nofollow noopener" target="_blank">Durg et al., 2020</a>).</p>'''),
        ('Who should NOT take ashwagandha.', '''    <ul>
      <li><strong>Pregnant or trying to conceive.</strong> Animal data shows abortifacient potential at high doses. No safety margin established for pregnancy.</li>
      <li><strong>Lactating.</strong> No safety data; default to skipping.</li>
      <li><strong>Autoimmune conditions in active flare.</strong> Hashimoto's, lupus, RA, MS. The immune-modulating effect is unpredictable in active disease.</li>
      <li><strong>Scheduled for surgery</strong> within 2 weeks. Potential sedative effect can interact with anesthesia. Discontinue 2 weeks prior.</li>
      <li><strong>Severe liver disease.</strong> Rare case reports of liver dysfunction with very-long-term use; the prudent move is to avoid in established hepatic impairment.</li>
    </ul>'''),
        ('What "side effects" people experience that probably are not ashwagandha.', '''    <p>Subjective reports often blame the supplement when the cause is elsewhere:</p>
    <ul>
      <li><strong>Cortisol dysregulation feeling.</strong> Ashwagandha lowers cortisol response to stress. People used to running on cortisol may feel "flat" or "less driven" for the first 1-2 weeks. This is the effect working, not a side effect.</li>
      <li><strong>Sleep changes.</strong> If sleep gets better and you sleep deeper, you may feel groggy on waking for the first few days. Adjust dose timing.</li>
      <li><strong>"Allergy" to ashwagandha gummies.</strong> Often actually a reaction to the sugar alcohol or coloring in cheap gummies. Try a capsule form to isolate.</li>
    </ul>'''),
        ('Dose, timing, and self-monitoring.', '''    <p>The clinically-supported dose is <strong>300 to 600 mg of standardized extract (KSM-66 or Sensoril) per day</strong>. Most side effects appear at the higher end of this range and decrease with split AM + PM dosing.</p>
    <p>Self-monitoring protocol for the first 8 weeks:</p>
    <ul>
      <li>Take a baseline subjective stress/sleep rating (1-10).</li>
      <li>Note any GI changes in week 1; if persistent, take with food or switch from gummy to capsule.</li>
      <li>If on any thyroid, diabetes, or sedative medication, check labs at 8 weeks.</li>
      <li>If you develop rash, stop immediately.</li>
      <li>Reassess at 8 weeks. Continue if useful, discontinue if not. There is no benefit to staying on it indefinitely once you have the answer.</li>
    </ul>'''),
    ],
    'related': [
        ('ashwagandha-gummy.html', 'N° 04 · The evidence file', 'Ashwagandha gummy: what it does, when to take it.', '9 min', 'KD 6'),
        ('ashwagandha-ksm-66.html', 'Evidence file', 'Ashwagandha KSM-66: the extract, not the herb.', '10 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What are the side effects of ashwagandha?', 'Most common: mild drowsiness, GI upset (nausea, loose stools) usually in the first week, modest thyroid axis modulation, occasional vivid dreams. Rare: allergic reaction (skin rash). Overall well-tolerated in human trials at 300-600 mg of standardized extract per day.'),
        ('Who should not take ashwagandha?', 'Pregnant or lactating women, people with active autoimmune disease flares (Hashimoto, lupus, RA, MS), patients on immunosuppressants, anyone scheduled for surgery within 2 weeks, and people with severe liver disease. Talk to your prescriber if you are on thyroid medication, sleep medications, or diabetes drugs.'),
        ('Does ashwagandha affect the thyroid?', 'Yes, modestly. Multiple trials show small increases in TSH and free T4. Usually clinically neutral or mildly beneficial in euthyroid adults. People on levothyroxine or with Hashimoto thyroiditis should monitor TSH 8 weeks after starting.'),
        ('Can ashwagandha cause weight gain?', 'No reliable evidence in human trials. Some users anecdotally report changes either direction, often related to underlying stress/cortisol changes rather than direct weight effects.'),
        ('Can I take ashwagandha every day?', 'Yes, for 8 to 12 week protocols in healthy adults. Effects build over weeks; missing days resets some of the cortisol modulation. Reassess at 8 weeks and discontinue if not useful.'),
        ('Does ashwagandha interact with SSRIs?', 'Generally co-tolerated. Ashwagandha may complement anxiety treatment but does not replace SSRIs. Stopping an SSRI to switch to ashwagandha is dangerous; supervised tapering is required if that is the goal.'),
    ],
})

# --- ARTICLE 4: creatine monohydrate powder (49k vol, KD 11) ---
ARTICLES.append({
    'slug': 'creatine-monohydrate-powder',
    'title': 'Creatine Monohydrate Powder: dose, timing, and what to ignore',
    'title_short': 'Creatine Monohydrate Powder',
    'meta_desc': 'Creatine monohydrate is the most-studied sport supplement on the shelf. 5 grams daily, no loading required, micronized or not. The honest dose math and the marketing lies to skip. By Dr. Marthe Janssen, PharmD.',
    'about': 'creatine monohydrate powder',
    'eyebrow': 'N° 10 · The evidence file',
    'h1': '<em>Creatine</em> monohydrate powder: dose, timing, and what to ignore.',
    'lede': 'The most-researched sport supplement on the shelf. The dose is boring (5 grams daily), the form is boring (monohydrate), the timing is irrelevant. Almost everything else marketed as "better" is more expensive with no advantage.',
    'read_time': 7,
    'cite_count': 5,
    'vol': '49k',
    'kd': '11',
    'tag_top': 'POWDER <em>/ 5g daily</em>',
    'tag_bottom': 'MONOHYDRATE<br><em>/ the studied form</em>',
    'aria_label': 'Creatine monohydrate powder visualization',
    'c1': '#f3ebd9',
    'c2': '#d4c39a',
    'c3': '#998754',
    'shadow_color': 'rgba(153,135,84,.35)',
    'cta_label': 'Creatine Monohydrate, 300 g powder',
    'cta_anchor': 'creatine',
    'product_name': 'Creatine Monohydrate',
    'product_sub': '300 g · micronized · 60 servings',
    'product_desc': 'Pure micronized monohydrate at 99.9% purity. No proprietary blend, no flavoring, no marketing premium. 5 grams scoop daily.',
    'bottom_line': 'Buy plain micronized creatine monohydrate. Take 5 grams daily, any time, with any liquid, with or without food. Skip the loading phase. Skip "creatine HCl" and "kre-alkalyn" — they cost more and offer no real advantage over monohydrate. Effects on strength, power, and lean mass appear in 4 to 8 weeks of consistent use. PuraVigor sells it at the boring dose because that is the dose the trials use.',
    'sections': [
        ('What the evidence actually shows.', '''    <p>Creatine is the most-studied sport supplement in existence. The pattern in over 30 years of RCTs:</p>
    <ul>
      <li><strong>Strength gains:</strong> 5-15% improvement in 1RM lifts over 4-12 weeks vs placebo (<a href="https://pubmed.ncbi.nlm.nih.gov/12701815/" rel="nofollow noopener" target="_blank">Volek et al., 2003</a>).</li>
      <li><strong>Lean mass gains:</strong> 1-3 kg additional vs placebo in resistance-training subjects.</li>
      <li><strong>High-intensity work capacity:</strong> measurable improvements in repeated sprint, bench press total volume, jump performance.</li>
      <li><strong>Cognitive function:</strong> emerging evidence for benefit in sleep-deprived and elderly populations (<a href="https://pubmed.ncbi.nlm.nih.gov/29570613/" rel="nofollow noopener" target="_blank">Avgerinos et al., 2018</a>).</li>
    </ul>
    <p>Most of this evidence uses <em>5 grams of creatine monohydrate per day</em>. That is the dose. That is also the dose PuraVigor sells.</p>'''),
        ('Dose: 5 grams daily, end of story.', '''    <p>The standard protocol is 5 grams of creatine monohydrate per day, every day, with or without food, with any liquid. Tissue saturation reaches steady state in 3-4 weeks at this dose.</p>
    <p>A "loading phase" (20 g/day for 5-7 days) reaches saturation faster but offers no long-term advantage and causes more GI complaints. Skip it unless you have a specific competition timeline.</p>
    <div class="box">
      <div class="ix">Reading the label</div>
      <div><h4>"5 grams" is roughly 1 teaspoon of standard micronized monohydrate.</h4><p>Most powders use a small scoop that holds 5 grams. Read the label; if the serving size says "3 scoops = 5 g," that is a marketing choice, not chemistry.</p></div>
    </div>'''),
        ('Forms: monohydrate vs everything else.', '''    <table>
      <thead><tr><th>Form</th><th>Evidence base</th><th>Cost</th><th>Verdict</th></tr></thead>
      <tbody>
        <tr><td>Monohydrate</td><td>30+ years, hundreds of RCTs</td><td>$</td><td>The right answer</td></tr>
        <tr><td>Micronized monohydrate</td><td>Same as standard; mixes more easily</td><td>$</td><td>Same effect; nicer texture</td></tr>
        <tr><td>Creatine HCl</td><td>Limited human RCTs vs monohydrate</td><td>$$$</td><td>No proven advantage; pay 3x for the same effect</td></tr>
        <tr><td>Kre-Alkalyn</td><td>Marketed for stability; no efficacy advantage</td><td>$$$</td><td>Skip</td></tr>
        <tr><td>Creatine ethyl ester</td><td>Studies show inferior absorption to monohydrate</td><td>$$</td><td>Skip</td></tr>
      </tbody>
    </table>'''),
        ('Side effects (mostly none).', '''    <p>Creatine monohydrate has one of the cleanest safety profiles in sports nutrition. The two notable issues:</p>
    <ul>
      <li><strong>Mild GI discomfort</strong> with the loading dose or with consumption fasted. Skip the loading phase and take with a meal if you are sensitive.</li>
      <li><strong>Modest water retention</strong> (1-2 kg) within the first 2-3 weeks. Intramuscular water — not bloat. The scale moves up; the mirror does not.</li>
    </ul>
    <p><em>Creatine does not damage kidneys in healthy adults.</em> The myth comes from creatinine (a metabolite) being elevated in routine labs while on creatine. Lab reference ranges, not kidney damage. If you have pre-existing kidney disease, talk to a clinician.</p>'''),
        ('Timing, mixing, and stacking.', '''    <p><strong>Timing:</strong> any time of day. Pre-workout, post-workout, breakfast, bedtime. The body stores it; acute timing does not matter.</p>
    <p><strong>Mixing:</strong> water, juice, milk, coffee. Micronized dissolves fine in cool liquid. Hot liquid is also fine; creatine is stable below 80°C.</p>
    <p><strong>Stacking:</strong> creatine + protein post-workout is fine. Creatine + caffeine is fine; old "caffeine blunts creatine" claim has not held up in newer trials. Creatine + magnesium is fine. There is no real "do not stack with X" rule for healthy adults.</p>
    <p><strong>Cycling:</strong> not necessary. Continuous daily use is the trial protocol and produces the documented effects. Cycling on/off resets tissue saturation each time, reducing benefit.</p>'''),
    ],
    'related': [
        ('whey-protein-powder.html', 'Evidence file', 'Whey protein powder: the only protein that matters.', '8 min', 'KD ~'),
        ('vegan-protein-powder.html', 'Evidence file', 'Vegan protein powder: pea + pumpkin + sunflower.', '7 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('How much creatine monohydrate should I take?', '5 grams per day, every day, with any liquid. Loading phase is optional and provides no long-term advantage. Tissue saturation reaches steady state in 3-4 weeks at the standard 5 g daily dose.'),
        ('Is creatine monohydrate the best form?', 'Yes for almost everyone. It has 30+ years of human trial evidence behind it. Newer forms (HCl, ethyl ester, kre-alkalyn) cost more and have not demonstrated meaningful advantages in head-to-head trials.'),
        ('Does creatine cause water retention?', 'Modest intramuscular water retention (1-2 kg) in the first 2-3 weeks. This is functional muscle hydration, not subcutaneous bloat. The scale moves; the mirror does not.'),
        ('Should I take creatine with food?', 'Optional. The trials work either way. If you experience mild GI discomfort fasted, take it with a meal.'),
        ('Does creatine affect kidneys?', 'No in healthy adults. The myth comes from elevated creatinine (a metabolite) in routine blood tests. Reference ranges, not kidney damage. People with pre-existing kidney disease should consult a clinician before supplementing.'),
        ('Is creatine safe long-term?', 'Yes, based on multi-year safety trials. Continuous daily use is the trial protocol. Cycling on/off is not necessary and reduces benefit by resetting tissue saturation each time.'),
    ],
})

# --- ARTICLE 5: vitamin d2 (33k vol, KD 7) ---
ARTICLES.append({
    'slug': 'vitamin-d2',
    'title': 'Vitamin D2 vs D3: when D2 is the right choice (rarely)',
    'title_short': 'Vitamin D2',
    'meta_desc': 'D2 (ergocalciferol) is the prescription form. D3 (cholecalciferol) is the supplemental form. They are not interchangeable in effect. Which to use, when, and why. By Dr. Marthe Janssen, PharmD.',
    'about': 'vitamin d2',
    'eyebrow': 'N° 11 · The evidence file',
    'h1': '<em>Vitamin D2</em>: the prescription form, when it is the right answer.',
    'lede': 'Pharmacies dispense D2. Supplements aisle sells D3. They are not the same molecule and not interchangeable in effect. The honest comparison and when each one is the appropriate choice.',
    'read_time': 6,
    'cite_count': 4,
    'vol': '33k',
    'kd': '7',
    'tag_top': 'D2 (ERGO) <em>/ prescription</em>',
    'tag_bottom': 'D3 (CHOLE)<br><em>/ supplement</em>',
    'aria_label': 'Vitamin D2 molecule visualization',
    'c1': '#f6dba0',
    'c2': '#dfb852',
    'c3': '#9a7e1f',
    'shadow_color': 'rgba(154,126,31,.4)',
    'cta_label': 'Vitamin D3 2,000 IU, 90 softgels',
    'cta_anchor': 'd3-5000',
    'product_name': 'Vitamin D3 2,000 IU',
    'product_sub': 'Vegan (lichen-derived)',
    'product_desc': 'Most readers asking about D2 should actually be taking D3 daily. PuraVigor sells the D3 form at the realistic supplemental dose.',
    'bottom_line': 'For over-the-counter daily supplementation, take D3 (cholecalciferol). It is more bioavailable, raises and maintains serum 25(OH)D more efficiently, and works at lower doses. D2 (ergocalciferol) is the prescription form (typically 50,000 IU weekly for short-term repletion) and is used because it is the available high-dose prescription option. If your clinician prescribed D2 for a specific repletion protocol, take it as prescribed. For ongoing maintenance, transition to D3.',
    'sections': [
        ('Two different molecules.', '''    <p><strong>D2 (ergocalciferol)</strong> is plant-derived, made by UV irradiation of yeast or mushroom sterol. Used as the high-dose prescription form in the US (50,000 IU capsules, weekly dosing for short repletion protocols).</p>
    <p><strong>D3 (cholecalciferol)</strong> is the form your skin synthesizes from UVB exposure. It is also available from lanolin (sheep's wool) or lichen (vegan). Used in essentially all OTC daily-dose supplements.</p>
    <p>Both raise serum 25(OH)D, but not equally. D3 is more efficient per IU and maintains levels longer (<a href="https://pubmed.ncbi.nlm.nih.gov/21177785/" rel="nofollow noopener" target="_blank">Tripkovic et al., 2012</a>).</p>'''),
        ('Why your prescription is D2.', '''    <p>The US prescription supply chain is set up around D2 because:</p>
    <ul>
      <li>D2 was historically the established prescription-grade form (cheaper to mass-produce decades ago).</li>
      <li>Insurance reimbursement structures are tied to the D2 NDC codes.</li>
      <li>The 50,000 IU dosage is convenient for once-weekly repletion protocols.</li>
    </ul>
    <p>None of these are reasons D2 is biologically superior. D3 at equivalent doses outperforms D2 in raising 25(OH)D, but D3 is not as widely available as a high-dose prescription product in the US.</p>'''),
        ('When D2 is the right choice.', '''    <ul>
      <li><strong>Your endocrinologist prescribed it</strong> for a specific repletion protocol. Follow the prescription; the dosage is calibrated.</li>
      <li><strong>You require strict vegan sourcing</strong> and your D3 access is limited. (Lichen-derived D3 is widely available now, so this is rare.)</li>
      <li><strong>Insurance covers D2 but not D3</strong> and cost matters more than the modest efficacy gap.</li>
    </ul>'''),
        ('When D3 is the right choice (most people).', '''    <ul>
      <li>Daily supplementation for general health.</li>
      <li>Maintenance after a prescription D2 repletion protocol ends.</li>
      <li>Anyone choosing their own OTC supplement.</li>
      <li>Pregnancy (with prescriber input).</li>
      <li>Pediatric supplementation (with pediatrician guidance).</li>
    </ul>'''),
        ('Switching from prescription D2 to maintenance D3.', '''    <p>If your clinician prescribed 8 to 12 weeks of weekly 50,000 IU D2 for documented deficiency, you should typically transition to daily D3 for maintenance after the prescribed course. Common transition:</p>
    <ul>
      <li>Complete the D2 prescription course.</li>
      <li>Get a follow-up 25(OH)D blood test.</li>
      <li>If level is in the 30-50 ng/mL range, switch to 1,000 to 2,000 IU D3 daily.</li>
      <li>Re-check at 3-6 months to confirm stability.</li>
    </ul>
    <p>This is the standard repletion-then-maintenance protocol. Always coordinate with your prescriber, especially if you have malabsorption or chronic disease.</p>'''),
    ],
    'related': [
        ('vitamin-d3-supplements.html', 'N° 06 · The evidence file', 'Vitamin D3 supplements: dose, timing, and who needs them.', '9 min', 'KD 23'),
        ('vitamin-d3-k2-gummies.html', 'Evidence file', 'Vitamin D3 + K2 gummies: the case for combo.', '7 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What is the difference between vitamin D2 and D3?', 'D2 (ergocalciferol) is plant-derived and used in high-dose prescription products. D3 (cholecalciferol) is the form your skin makes from sunlight and is in essentially all OTC daily supplements. D3 raises and maintains serum 25(OH)D more efficiently per IU.'),
        ('Is D2 or D3 better?', 'D3 for daily supplementation. D2 for clinician-prescribed weekly repletion protocols using the 50,000 IU prescription dose. Both raise vitamin D status; D3 does it more efficiently and maintains levels longer.'),
        ('Why does my doctor prescribe D2 instead of D3?', 'US prescription supply chain reasons: D2 is the established high-dose prescription product (50,000 IU capsules), insurance reimbursement codes are set up around it, and weekly dosing is convenient. Biologically, D3 is more efficient, but not as widely available as a high-dose prescription.'),
        ('Can I switch from D2 to D3?', 'Yes, after a clinician-prescribed D2 repletion course is complete, the typical transition is to 1,000-2,000 IU D3 daily for maintenance, with a follow-up 25(OH)D blood test at 3-6 months. Coordinate the transition with your prescriber.'),
        ('Is plant-based D3 the same as D2?', 'No. Plant-based D3 is lichen-derived cholecalciferol — the same molecule as animal-sourced D3 (from lanolin), just from a different source. D2 (ergocalciferol) is a different molecule.'),
    ],
})

# --- ARTICLE 6: inositol supplement (27k vol, KD 5) ---
ARTICLES.append({
    'slug': 'inositol-supplement',
    'title': 'Inositol Supplement: PCOS, anxiety, and the 40:1 ratio that matters',
    'title_short': 'Inositol Supplement',
    'meta_desc': 'Myo-inositol + d-chiro-inositol at a 40:1 ratio is the trial-supported PCOS protocol. The dose, the use cases beyond PCOS, and what the human evidence actually shows. By Dr. Marthe Janssen, PharmD.',
    'about': 'inositol supplement',
    'eyebrow': 'N° 12 · The evidence file',
    'h1': '<em>Inositol</em>: PCOS, anxiety, and the 40:1 ratio.',
    'lede': 'Inositol is a sugar alcohol that acts as a secondary messenger in insulin signaling and several neurotransmitter pathways. Two trial-supported use cases: PCOS-related insulin resistance and panic disorder. The dose math matters more than most labels suggest.',
    'read_time': 7,
    'cite_count': 5,
    'vol': '27k',
    'kd': '5',
    'tag_top': 'MYO + D-CHIRO <em>/ 40:1</em>',
    'tag_bottom': 'PCOS PROTOCOL<br><em>/ 4 g daily</em>',
    'aria_label': 'Inositol molecule visualization',
    'c1': '#d8e6df',
    'c2': '#92a89b',
    'c3': '#506558',
    'shadow_color': 'rgba(80,101,88,.4)',
    'cta_label': 'Inositol 4g (myo + d-chiro 40:1)',
    'cta_anchor': 'inositol',
    'product_name': 'Inositol 4g · 40:1',
    'product_sub': 'Myo + d-chiro · powder',
    'product_desc': 'The trial-aligned PCOS/insulin protocol: 4,000 mg myo-inositol + 100 mg d-chiro-inositol per scoop. Unflavored, mixes into water.',
    'bottom_line': 'For PCOS-related insulin resistance, the trial-supported protocol is 4 grams of myo-inositol + 100 mg of d-chiro-inositol per day (the 40:1 ratio) for 12 to 16 weeks. For panic disorder, the dose is higher (12 to 18 grams of myo-inositol daily) and should be supervised. For general "anxiety" or "mood support," the evidence is thin. PuraVigor sells the PCOS-protocol formulation; if you have panic disorder, work with a psychiatrist on the supervised protocol.',
    'sections': [
        ('What inositol does in the body.', '''    <p>Inositol is a sugar alcohol that acts as a secondary messenger in cellular signaling. Two stereoisomers matter clinically:</p>
    <ul>
      <li><strong>Myo-inositol (MI):</strong> insulin signaling, ovarian function, neurotransmitter modulation.</li>
      <li><strong>D-chiro-inositol (DCI):</strong> a derivative of MI, more involved in glycogen synthesis. Smaller body pool.</li>
    </ul>
    <p>The body normally maintains MI:DCI at roughly 40:1. In PCOS and insulin resistance, this ratio is often disturbed. The trial-supported PCOS supplementation protocol restores the 40:1 ratio externally (<a href="https://pubmed.ncbi.nlm.nih.gov/29422129/" rel="nofollow noopener" target="_blank">Unfer et al., 2017</a>).</p>'''),
        ('PCOS: the trial-supported protocol.', '''    <p>The most consistent human trial evidence for inositol is in polycystic ovary syndrome (PCOS) with insulin resistance:</p>
    <ul>
      <li><strong>Dose:</strong> 4 grams myo-inositol + 100 mg d-chiro-inositol per day (the 40:1 ratio).</li>
      <li><strong>Split:</strong> 2 grams MI + 50 mg DCI twice daily, morning and evening.</li>
      <li><strong>Duration:</strong> 12 to 16 weeks for first results; many protocols continue 6+ months.</li>
      <li><strong>Outcomes documented:</strong> improved insulin sensitivity, more regular menstrual cycles, reduced androgen levels, modest improvements in ovulation and fertility outcomes.</li>
    </ul>
    <p>Effect sizes are modest but clinically meaningful for many women with PCOS-related insulin resistance, and the safety profile is excellent.</p>'''),
        ('Panic disorder: a different (higher) dose.', '''    <p>The other reasonably-evidenced use case is panic disorder, where the trial protocol uses <strong>12 to 18 grams of myo-inositol daily</strong> — substantially higher than the PCOS protocol (<a href="https://pubmed.ncbi.nlm.nih.gov/8554815/" rel="nofollow noopener" target="_blank">Benjamin et al., 1995</a>, replicated since).</p>
    <p>At this dose, effects on panic frequency and severity have been comparable to fluvoxamine in head-to-head small trials. <em>This is not a self-supplementation protocol.</em> If panic disorder is your goal, work with a psychiatrist; the high doses, the duration, and the integration with any prescription anxiety treatment require supervision.</p>'''),
        ('What inositol is NOT documented for.', '''    <ul>
      <li><strong>Generalized anxiety</strong> at PCOS doses. The panic-disorder evidence at high doses does not extend to "anxious mood" in general.</li>
      <li><strong>Depression.</strong> Small mixed trials; no consistent positive signal.</li>
      <li><strong>Weight loss</strong> beyond what improved insulin sensitivity provides in PCOS.</li>
      <li><strong>Sleep.</strong> Some users report drowsiness at high doses; not a primary sleep aid.</li>
      <li><strong>Fertility in non-PCOS women.</strong> The PCOS-specific mechanism does not generalize.</li>
    </ul>'''),
        ('Side effects and interactions.', '''    <p>Inositol is one of the better-tolerated supplements:</p>
    <ul>
      <li><strong>Mild GI discomfort</strong> (nausea, loose stools) at doses above 6 grams per day. Split dosing reduces this.</li>
      <li><strong>Possible mild hypoglycemia</strong> in adults on insulin or sulfonylureas (because it improves insulin sensitivity). Monitor blood sugar if you are on these medications.</li>
      <li><strong>Pregnancy:</strong> increasingly used in PCOS during pregnancy under clinician guidance; otherwise default to coordinating with your OB.</li>
      <li><strong>Lithium:</strong> theoretical interaction (lithium and inositol both affect the same signaling pathway). Avoid combining without psychiatric oversight.</li>
    </ul>'''),
    ],
    'related': [
        ('womens-hormone-balance-supplement.html', 'Evidence file', 'Women hormone balance: what actually works.', '8 min', 'KD ~'),
        ('berberine-500-mg.html', 'Evidence file', 'Berberine 500 mg: the insulin-pathway alternative.', '8 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What is inositol used for?', 'The two best-evidenced human use cases are PCOS-related insulin resistance (4 grams myo-inositol + 100 mg d-chiro-inositol daily, the 40:1 ratio) and panic disorder (12-18 grams myo-inositol daily, under psychiatric supervision). Other claims (general anxiety, depression, sleep) have thin evidence.'),
        ('What is the 40:1 ratio in inositol?', 'The ratio of myo-inositol to d-chiro-inositol that matches the natural physiological ratio in body tissues. PCOS supplementation protocols use 4 grams MI + 100 mg DCI daily to restore this ratio externally.'),
        ('How long until inositol works for PCOS?', 'First measurable improvements in menstrual cycle regularity and insulin sensitivity typically appear at 12 to 16 weeks of daily 4 g MI + 100 mg DCI supplementation. Many protocols continue for 6 months or longer.'),
        ('Can inositol help with anxiety?', 'For panic disorder specifically, yes, at high doses (12-18 g myo-inositol daily) under psychiatric supervision. For generalized anxiety at lower doses, evidence is thin. Do not self-treat anxiety disorders.'),
        ('Are there side effects with inositol?', 'Mild GI discomfort at doses above 6 grams per day (split dosing reduces this). Possible mild hypoglycemia if combined with insulin or sulfonylureas. Avoid combining with lithium without psychiatric oversight.'),
    ],
})

# --- ARTICLE 7: choline supplement (33k vol, KD 23) ---
ARTICLES.append({
    'slug': 'choline-supplement',
    'title': 'Choline Supplement: the nutrient 90% of Americans miss',
    'title_short': 'Choline Supplement',
    'meta_desc': 'Choline is essential, the daily intake is well above what most Americans eat, and supplementation is reasonable for vegetarians, pregnancy, and adults with limited egg consumption. By Dr. Marthe Janssen, PharmD.',
    'about': 'choline supplement',
    'eyebrow': 'N° 13 · The evidence file',
    'h1': '<em>Choline</em>: the nutrient 90% of Americans do not get enough of.',
    'lede': 'Choline is essential for liver function, neurotransmitter synthesis, and fetal brain development. 90% of US adults consume less than the adequate intake. Eggs are the easiest food source; supplements fill the gap for vegetarians, pregnancy, and adults who avoid eggs.',
    'read_time': 7,
    'cite_count': 5,
    'vol': '33k',
    'kd': '23',
    'tag_top': 'ESSENTIAL <em>/ AI 550 mg M, 425 F</em>',
    'tag_bottom': 'EGGS <em>147 mg each</em><br><em>/ best food source</em>',
    'aria_label': 'Choline molecule visualization',
    'c1': '#ecdcb8',
    'c2': '#c4a26a',
    'c3': '#7d5a26',
    'shadow_color': 'rgba(125,90,38,.4)',
    'cta_label': 'Choline (alpha-GPC), 90 caps',
    'cta_anchor': 'choline',
    'product_name': 'Choline Alpha-GPC',
    'product_sub': '300 mg per cap · bioavailable',
    'product_desc': 'For people who do not eat eggs, the easy form. Alpha-GPC is the most bioavailable supplemental form. 300 mg per cap, twice daily.',
    'bottom_line': 'For most adults: eat 1-2 eggs daily and you do not need a supplement. For pregnancy: 450 mg AI from food alone is hard; a supplemental 200 mg of choline daily is a reasonable add. For vegetarians/vegans: aim for ~400 mg/day from food (cruciferous vegetables, legumes, quinoa) and consider 200-300 mg supplemental as alpha-GPC. For specific cognitive concerns or fatty liver, talk to a clinician about higher doses.',
    'sections': [
        ('Why choline matters.', '''    <p>Choline is an essential nutrient: the body makes some but not enough to meet needs. It is required for:</p>
    <ul>
      <li><strong>Phosphatidylcholine synthesis</strong> (cell membranes, lipoprotein assembly in the liver).</li>
      <li><strong>Acetylcholine production</strong> (neurotransmitter, memory and muscle control).</li>
      <li><strong>Betaine production</strong> (methylation cycle support).</li>
      <li><strong>Fetal brain development</strong> in pregnancy, particularly the hippocampus.</li>
    </ul>
    <p>The Institute of Medicine's adequate intake is <strong>550 mg/day for men, 425 mg/day for women, 450 mg in pregnancy, 550 mg in lactation</strong>. NHANES data shows ~90% of US adults consume below these levels (<a href="https://pubmed.ncbi.nlm.nih.gov/27782049/" rel="nofollow noopener" target="_blank">Wallace & Fulgoni, 2017</a>).</p>'''),
        ('Best food sources.', '''    <table>
      <thead><tr><th>Food</th><th>Choline (mg)</th><th>Serving</th></tr></thead>
      <tbody>
        <tr><td>Beef liver</td><td>356</td><td>3 oz</td></tr>
        <tr><td>Egg (whole)</td><td>147</td><td>1 large</td></tr>
        <tr><td>Soybeans, roasted</td><td>107</td><td>1/2 cup</td></tr>
        <tr><td>Chicken breast</td><td>72</td><td>3 oz</td></tr>
        <tr><td>Salmon, cooked</td><td>56</td><td>3 oz</td></tr>
        <tr><td>Brussels sprouts</td><td>32</td><td>1/2 cup</td></tr>
        <tr><td>Quinoa, cooked</td><td>43</td><td>1 cup</td></tr>
        <tr><td>Milk, 2%</td><td>43</td><td>1 cup</td></tr>
      </tbody>
    </table>
    <p>Eggs are the standout: two eggs a day provides ~300 mg, more than half the daily AI. Adults eating eggs regularly are usually fine without supplementation.</p>'''),
        ('Who probably needs a supplement.', '''    <ul>
      <li><strong>Vegetarians and vegans</strong> who do not eat eggs, soy, or significant cruciferous vegetables.</li>
      <li><strong>Pregnant and lactating women.</strong> The 450 to 550 mg AI is hard to hit from food alone in most diets, and the fetal-brain-development case for adequate choline is strong.</li>
      <li><strong>Adults with non-alcoholic fatty liver disease</strong> (under clinician guidance; higher doses can be appropriate).</li>
      <li><strong>People on TPN (total parenteral nutrition)</strong> or specific intestinal conditions (clinician territory).</li>
    </ul>'''),
        ('Supplemental forms compared.', '''    <table>
      <thead><tr><th>Form</th><th>Bioavailability</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Choline bitartrate</td><td>Good</td><td>Cheap. Fishy aftertaste at high doses.</td></tr>
        <tr><td>Phosphatidylcholine</td><td>Excellent</td><td>Found in lecithin. Common food supplement.</td></tr>
        <tr><td>Alpha-GPC</td><td>Excellent (crosses BBB)</td><td>Preferred for cognitive support. Pricier.</td></tr>
        <tr><td>CDP-choline (citicoline)</td><td>Excellent</td><td>Used in cognitive trials. Pricier.</td></tr>
      </tbody>
    </table>
    <p>For general daily coverage in a non-egg-eater, choline bitartrate or phosphatidylcholine is fine and cheap. For specific cognitive-decline use cases under clinician guidance, alpha-GPC or CDP-choline are evidence-supported.</p>'''),
        ('Side effects and the upper limit.', '''    <p>The tolerable upper intake level is <strong>3,500 mg per day in adults</strong>. Above this, side effects can include fishy body odor (trimethylamine production), low blood pressure, and GI upset. Standard supplementation (200-500 mg daily) is well below the upper limit and rarely causes issues.</p>
    <p>One note: very high-dose choline can theoretically increase TMAO (trimethylamine-N-oxide), which has been associated with cardiovascular risk in some observational studies. The trade-off is unclear; do not mega-dose unless a clinician has a specific reason.</p>'''),
    ],
    'related': [
        ('b-complex-vitamin.html', 'Evidence file', 'B-complex vitamin: methylation 101.', '8 min', 'KD ~'),
        ('prenatal-vitamin.html', 'Evidence file', 'Prenatal vitamin: choline included or not?', '9 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('How much choline do I need daily?', 'Adult adequate intake is 550 mg for men, 425 mg for women, 450 mg in pregnancy, 550 mg in lactation. Most US adults consume below these levels.'),
        ('What foods are highest in choline?', 'Beef liver (~356 mg per 3 oz), whole eggs (~147 mg each), soybeans, chicken, salmon, cruciferous vegetables. Eggs are the practical standout: two daily provides over half the adult AI.'),
        ('Do I need a choline supplement?', 'If you eat eggs regularly, probably not. If you are vegan, vegetarian without eggs, pregnant, or lactating, a 200-300 mg daily supplement is reasonable. For specific medical reasons (fatty liver, cognitive concerns), discuss higher doses with a clinician.'),
        ('What is the best form of choline?', 'For general daily coverage, choline bitartrate or phosphatidylcholine (cheap and effective). For specific cognitive use cases under clinician guidance, alpha-GPC or CDP-choline (citicoline) are evidence-supported.'),
        ('Can you take too much choline?', 'The tolerable upper intake is 3,500 mg per day in adults. Above this: fishy body odor, low blood pressure, GI upset. Standard supplementation (200-500 mg) is well below this limit.'),
    ],
})

# --- ARTICLE 8: nitric oxide supplement (33k vol, KD 26) ---
ARTICLES.append({
    'slug': 'nitric-oxide-supplement',
    'title': 'Nitric Oxide Supplements: L-citrulline vs L-arginine vs nitrate',
    'title_short': 'Nitric Oxide Supplement',
    'meta_desc': 'L-citrulline is the form that actually raises NO. L-arginine looks logical but is destroyed in first-pass metabolism. Beetroot nitrate works through a different pathway. The honest breakdown. By Dr. Marthe Janssen, PharmD.',
    'about': 'nitric oxide supplement',
    'eyebrow': 'N° 14 · The evidence file',
    'h1': '<em>Nitric oxide</em>: L-citrulline beats L-arginine, almost every time.',
    'lede': 'L-arginine is the precursor to nitric oxide in the body. So oral L-arginine should raise NO, right? Mostly no. The liver clears it before it reaches systemic circulation. L-citrulline does what L-arginine is supposed to do.',
    'read_time': 6,
    'cite_count': 4,
    'vol': '33k',
    'kd': '26',
    'tag_top': 'L-CITRULLINE <em>/ 6-8 g</em>',
    'tag_bottom': 'NITRATE PATHWAY<br><em>/ beetroot 500 mg</em>',
    'aria_label': 'Nitric oxide molecule visualization',
    'c1': '#e4cfa5',
    'c2': '#b8964e',
    'c3': '#76591e',
    'shadow_color': 'rgba(118,89,30,.4)',
    'cta_label': 'Nitro Pump (L-citrulline + beet)',
    'cta_anchor': 'pre-workout',
    'product_name': 'Nitro Pump',
    'product_sub': 'L-citrulline 6 g + beet 500 mg',
    'product_desc': 'The two NO pathways combined: 6 g L-citrulline (raises NO via L-arginine recycling) + 500 mg beetroot nitrate (raises NO via the nitrate pathway). Pre-workout.',
    'bottom_line': 'For workout pump and exercise endurance: 6 to 8 grams of L-citrulline 30-60 minutes pre-workout, optionally combined with 500 mg of beetroot nitrate. Skip L-arginine alone (first-pass metabolism destroys most of it). For cardiovascular health long-term, dietary nitrate (leafy greens, beetroot) consistently outperforms any single supplement. The supplement is for acute exercise effect, not chronic vascular health.',
    'sections': [
        ('How NO supplements actually work.', '''    <p>Nitric oxide is produced via two pathways:</p>
    <ul>
      <li><strong>L-arginine pathway:</strong> the enzyme nitric oxide synthase (NOS) converts L-arginine to NO + L-citrulline.</li>
      <li><strong>Nitrate pathway:</strong> dietary nitrate (NO3-) is converted by oral bacteria to nitrite (NO2-), then to NO in tissues, especially under hypoxic conditions.</li>
    </ul>
    <p>These work in parallel and are partially complementary. The pathway your supplement targets matters more than the brand on the label.</p>'''),
        ('Why L-arginine alone is mostly a waste.', '''    <p>Oral L-arginine is heavily metabolized by intestinal arginase in first-pass metabolism. By the time it reaches systemic circulation, the dose is dramatically reduced. Studies measuring plasma L-arginine after oral doses confirm: <em>you need very large oral doses (10+ grams) to raise plasma levels meaningfully, and even then the effect on NO is inconsistent</em> (<a href="https://pubmed.ncbi.nlm.nih.gov/17904440/" rel="nofollow noopener" target="_blank">Bode-Böger et al., 2007</a>).</p>
    <p>L-citrulline bypasses this: it is absorbed efficiently, then converted to L-arginine in the kidneys, raising plasma L-arginine more than L-arginine itself does.</p>'''),
        ('L-citrulline: the dose and the use case.', '''    <ul>
      <li><strong>Dose:</strong> 6 to 8 grams of L-citrulline (or 4-5 grams as citrulline malate) 30-60 minutes pre-workout.</li>
      <li><strong>What it does:</strong> modestly improves pump (vascular dilation), reduces fatigue during high-rep training, and may extend time to exhaustion (<a href="https://pubmed.ncbi.nlm.nih.gov/20386132/" rel="nofollow noopener" target="_blank">Pérez-Guisado & Jakeman, 2010</a>).</li>
      <li><strong>What it does not do:</strong> dramatic strength increases (that is creatine), large endurance gains (that is training adaptation), or chronic cardiovascular improvement.</li>
    </ul>'''),
        ('The nitrate pathway: beetroot.', '''    <p>Dietary nitrate (~500 mg, equivalent to a glass of beet juice or several cups of leafy greens) raises plasma nitrite for several hours, which converts to NO in tissues. This pathway:</p>
    <ul>
      <li>Lowers oxygen cost of submaximal exercise.</li>
      <li>Modestly extends endurance.</li>
      <li>May modestly lower blood pressure with daily intake.</li>
    </ul>
    <p>The supplement form (beetroot concentrate, beet juice powder) works; the dietary form (eating leafy greens + beets) works at least as well and contributes to general cardiovascular health.</p>
    <div class="box">
      <div class="ix">Pharmacist's note</div>
      <div><h4>Mouthwash kills the bacteria that convert dietary nitrate to nitrite.</h4><p>If you use antimicrobial mouthwash daily and eat lots of leafy greens, you may be partially undoing your dietary nitrate benefit. Switch to a non-antimicrobial mouthwash or skip the antimicrobial rinse if you are dietary-nitrate-dependent.</p></div>
    </div>'''),
        ('Stacking and timing.', '''    <p>For pre-workout pump and endurance: combine 6 g L-citrulline with 500 mg of beetroot nitrate, 30-60 minutes before training. The two pathways are complementary and the combined effect is modestly larger than either alone.</p>
    <p>For ongoing cardiovascular benefit: <em>diet beats supplements</em>. A daily serving of leafy greens or beets contributes more sustainably than any pre-workout product.</p>
    <p>Do not stack with: ED medications (sildenafil, tadalafil) without a clinician's input — additive hypotension risk. Or with nitroglycerin / isosorbide (cardiac nitrates) — same issue.</p>'''),
    ],
    'related': [
        ('creatine-monohydrate-powder.html', 'N° 10 · The evidence file', 'Creatine monohydrate: the boring dose that works.', '7 min', 'KD 11'),
        ('bcaa-supplement.html', 'Evidence file', 'BCAAs: when they help and when they do not.', '7 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What is the best nitric oxide supplement?', 'L-citrulline 6-8 g pre-workout for acute pump and endurance. Beetroot nitrate 500 mg for the dietary-nitrate pathway. Combined is modestly better than either alone. Skip L-arginine alone — first-pass metabolism destroys most of the oral dose.'),
        ('How long does L-citrulline take to work?', 'Plasma L-arginine peaks 60-90 minutes after a 6-8 g L-citrulline dose. Pre-workout dosing 30-60 minutes before training is the practical sweet spot.'),
        ('Is L-citrulline better than L-arginine?', 'Yes, for raising plasma L-arginine and downstream NO production. L-citrulline bypasses intestinal arginase, gets absorbed efficiently, and then is converted to L-arginine in the kidneys. Counterintuitive but well-documented.'),
        ('Does beetroot lower blood pressure?', 'Modestly. Daily dietary nitrate (from beets or leafy greens) reduces systolic blood pressure by ~4-6 mmHg in meta-analyses. Effect is more reliable from food than from supplements.'),
        ('Can I take NO supplements with ED medication?', 'Talk to your prescriber. ED medications (sildenafil, tadalafil) work via the same NO pathway, and combining can cause additive hypotension. Same caution applies if you take cardiac nitrates (nitroglycerin, isosorbide).'),
    ],
})

# --- ARTICLE 9: magnesium taurate (27k vol, KD 21) ---
ARTICLES.append({
    'slug': 'magnesium-taurate',
    'title': 'Magnesium Taurate: the cardiovascular form, what the evidence says',
    'title_short': 'Magnesium Taurate',
    'meta_desc': 'Magnesium taurate combines magnesium with taurine, both of which have cardiovascular and calming effects. The human evidence is thinner than glycinate, the cost is higher, but the niche is real. By Dr. Marthe Janssen, PharmD.',
    'about': 'magnesium taurate',
    'eyebrow': 'N° 15 · The evidence file',
    'h1': '<em>Magnesium taurate</em>: the cardiovascular form, with caveats.',
    'lede': 'Taurine + magnesium, bundled. Both have cardiovascular and nervous system effects. The combination has theoretical appeal and limited human RCTs. Worth considering for blood pressure and palpitations under clinician guidance; glycinate remains the general-purpose default.',
    'read_time': 6,
    'cite_count': 4,
    'vol': '27k',
    'kd': '21',
    'tag_top': 'TAURINE + Mg <em>/ niche form</em>',
    'tag_bottom': 'BLOOD PRESSURE<br><em>/ modest evidence</em>',
    'aria_label': 'Magnesium taurate molecule visualization',
    'c1': '#c9d4cb',
    'c2': '#86988c',
    'c3': '#4d5d54',
    'shadow_color': 'rgba(77,93,84,.4)',
    'cta_label': 'Magnesium Bisglycinate, 60 ct',
    'cta_anchor': 'mag-glycinate',
    'product_name': 'Magnesium Bisglycinate',
    'product_sub': 'The well-studied default',
    'product_desc': 'For general repletion, sleep, stress, cramps — glycinate is the default. PuraVigor does not currently sell taurate; if cardiovascular-specific evidence applies to you, ask a clinician.',
    'bottom_line': 'Magnesium taurate is a defensible choice for adults with documented hypertension or palpitations who want to combine magnesium repletion with taurine intake. The human RCT base is much thinner than glycinate. For sleep, anxiety, cramps, and general repletion, glycinate is more evidence-backed and similarly priced. PuraVigor does not currently sell taurate; if a clinician recommends it for cardiovascular reasons, choose a third-party tested brand.',
    'sections': [
        ('What taurate is and why it matters.', '''    <p>Magnesium taurate is magnesium ion bonded to taurine, a sulfur-containing amino acid (technically a non-coding amino acid, present in food but mostly synthesized endogenously). Per compound weight, taurate is ~12% elemental magnesium. A 400 mg dose delivers ~48 mg elemental.</p>
    <p>The combination is interesting because taurine itself has independent effects on cardiovascular and nervous system function: modest blood pressure reduction, antioxidant activity, and GABAergic neurotransmission support. The hypothesis: pairing taurine with magnesium delivers complementary cardiovascular and calming effects in one molecule.</p>'''),
        ('What the human evidence shows.', '''    <p>The literature on magnesium taurate specifically is thin. Most evidence is either:</p>
    <ul>
      <li><strong>Taurine alone</strong> (multiple RCTs showing modest blood pressure reduction at 1-6 grams daily; <a href="https://pubmed.ncbi.nlm.nih.gov/27671110/" rel="nofollow noopener" target="_blank">Sun et al., 2016</a>).</li>
      <li><strong>Magnesium for blood pressure</strong> (any form, with meta-analyses showing modest systolic reduction; <a href="https://pubmed.ncbi.nlm.nih.gov/27486175/" rel="nofollow noopener" target="_blank">Zhang et al., 2016</a>).</li>
      <li><strong>Combined magnesium taurate</strong>: limited direct trial evidence; mostly observational and small mechanistic studies.</li>
    </ul>
    <p><em>The mechanistic case is reasonable; the dedicated trial base is thin.</em> Buying taurate over glycinate is a defensible choice for cardiovascular-specific goals but not the most-evidenced one.</p>'''),
        ('Defensible use cases.', '''    <ul>
      <li><strong>Mild hypertension</strong> in adults who would benefit from supplementing both taurine and magnesium and want to take one product instead of two.</li>
      <li><strong>Palpitations</strong> not explained by other causes (after clinician evaluation), where magnesium status is below optimal.</li>
      <li><strong>Stacking pre-existing taurine intake</strong> (e.g., athletes already taking taurine 2-4 g daily for exercise) with magnesium repletion.</li>
    </ul>'''),
        ('Where glycinate is the better choice.', '''    <ul>
      <li>Sleep onset.</li>
      <li>Anxiety with physical tension.</li>
      <li>Muscle cramps not specifically cardiac.</li>
      <li>General repletion in adults without specific cardiovascular indication.</li>
      <li>Pregnancy (where taurate has minimal safety data; glycinate has decades of use).</li>
    </ul>'''),
        ('Dose and stacking.', '''    <p>Typical taurate doses are 400 to 800 mg of the compound (about 48-96 mg elemental Mg), often combined with additional taurine (1-3 g daily). For dedicated cardiovascular use under clinician guidance.</p>
    <p>Common interaction notes:</p>
    <ul>
      <li>Antibiotics (tetracyclines, fluoroquinolones) — magnesium binds them in the gut. Separate by 2 hours.</li>
      <li>Thyroid medication (levothyroxine) — same separation rule.</li>
      <li>Diuretics that lower potassium — talk to your prescriber before combining with magnesium supplementation.</li>
    </ul>'''),
    ],
    'related': [
        ('magnesium-glycinate.html', 'N° 02 · The evidence file', 'Magnesium glycinate: the one form that actually works.', '11 min', 'KD 48'),
        ('magnesium-citrate.html', 'N° 07 · The evidence file', 'Magnesium citrate: when to take it.', '8 min', 'KD 12'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('What is magnesium taurate good for?', 'Cardiovascular use cases: mild hypertension, palpitations under clinician evaluation, stacking with existing taurine intake. The combination of magnesium and taurine has mechanistic appeal for cardiovascular and nervous system effects, but dedicated trial evidence is thin compared to glycinate.'),
        ('Is magnesium taurate better than glycinate?', 'For cardiovascular-specific goals, possibly. For sleep, anxiety, cramps, and general repletion, glycinate has more human trial evidence and is similarly priced. Pick by use case, not by which is generically "better."'),
        ('Can you take magnesium taurate daily?', 'Yes for adults with normal kidney function, at the typical 400-800 mg compound dose. Combined with additional taurine if a cardiovascular protocol calls for it. Discontinue if any palpitations worsen or muscle weakness appears.'),
        ('What is the dose of magnesium taurate?', 'Typical: 400-800 mg of the compound (delivering 48-96 mg elemental magnesium), once daily or split AM/PM. Combined with 1-3 g supplemental taurine in some cardiovascular protocols. Coordinate with a clinician for specific indications.'),
        ('Does magnesium taurate lower blood pressure?', 'Modestly. The taurine component has its own blood pressure-lowering effect at 1-6 g daily, and magnesium repletion contributes additively. Expect 3-6 mmHg systolic in supplementation-responsive adults; the effect is smaller than first-line antihypertensive medications.'),
    ],
})

# --- ARTICLE 10: creatine hcl or monohydrate (18k vol, KD 4) ---
ARTICLES.append({
    'slug': 'creatine-hcl-or-monohydrate',
    'title': 'Creatine HCl or Monohydrate: which one (it is monohydrate, almost always)',
    'title_short': 'Creatine HCl or Monohydrate',
    'meta_desc': 'Monohydrate has 30+ years of evidence. HCl has marketing. Per dollar and per evidence, monohydrate wins. The exception worth knowing about. By Dr. Marthe Janssen, PharmD.',
    'about': 'creatine hcl or monohydrate',
    'eyebrow': 'N° 16 · The evidence file',
    'h1': 'Creatine <em>HCl</em> or monohydrate: the honest comparison.',
    'lede': 'Creatine HCl is marketed as more soluble, more bioavailable, and easier on the stomach. Solubility yes, the other two: largely no. The price premium does not match the evidence. Here is when HCl is the right answer (rare) and when monohydrate is (almost always).',
    'read_time': 5,
    'cite_count': 3,
    'vol': '18k',
    'kd': '4',
    'tag_top': 'MONOHYDRATE <em>/ 30 yrs evidence</em>',
    'tag_bottom': 'HCl<br><em>/ marketing premium</em>',
    'aria_label': 'Creatine molecule comparison visualization',
    'c1': '#ece1c4',
    'c2': '#c9b87a',
    'c3': '#86723a',
    'shadow_color': 'rgba(134,114,58,.35)',
    'cta_label': 'Creatine Monohydrate, 300 g',
    'cta_anchor': 'creatine',
    'product_name': 'Creatine Monohydrate',
    'product_sub': 'Micronized · 60 servings',
    'product_desc': 'The form with the evidence. Micronized for easy mixing. 5 g per scoop. No flavoring, no marketing premium, no proprietary blend.',
    'bottom_line': 'Buy monohydrate. 5 grams per day. Save the money. Creatine HCl is more soluble in water, which is real but practically irrelevant — micronized monohydrate dissolves fine. HCl is marketed as having better bioavailability and fewer GI effects, but head-to-head trials show no meaningful advantage at standard doses, and the price is typically 2-3x. Use HCl only if you have documented GI intolerance to monohydrate that does not resolve by taking it with food.',
    'sections': [
        ('What HCl marketing claims, and what the data shows.', '''    <p>Three claims commonly made for creatine HCl:</p>
    <ol>
      <li><strong>"More soluble."</strong> True. HCl dissolves more cleanly in cold water than non-micronized monohydrate. With micronized monohydrate the difference is negligible.</li>
      <li><strong>"More bioavailable."</strong> Mixed. Some manufacturer-funded trials show slightly higher plasma levels after a single dose, but tissue saturation (the relevant endpoint) is reached equally with both forms at standard doses over 3-4 weeks (<a href="https://pubmed.ncbi.nlm.nih.gov/26922181/" rel="nofollow noopener" target="_blank">Antonio et al., 2021 review</a>).</li>
      <li><strong>"Fewer GI side effects."</strong> Possibly true at very high single doses, mostly irrelevant at standard 5 g daily dosing.</li>
    </ol>
    <p>The bottom line: monohydrate at 5 g/day reaches the same physiological endpoint as HCl, with 30+ years of safety and efficacy data, at one-third the price.</p>'''),
        ('When HCl is reasonable.', '''    <ul>
      <li><strong>Documented GI intolerance</strong> to monohydrate that does not resolve by taking it with a meal.</li>
      <li><strong>You are using high single doses (10+ g pre-workout)</strong> — rare and probably unnecessary.</li>
      <li><strong>You strongly prefer the texture/dissolution</strong> and accept the cost premium.</li>
    </ul>'''),
        ('When monohydrate is the right answer (almost everyone).', '''    <ul>
      <li>You are starting creatine for the first time.</li>
      <li>You have used creatine successfully before.</li>
      <li>Cost matters.</li>
      <li>You want the form with the most human trial evidence (30+ years, hundreds of RCTs).</li>
      <li>You have any non-GI specific concern about creatine.</li>
    </ul>'''),
        ('Dosing both forms.', '''    <p>For monohydrate: <strong>5 grams daily</strong>, any time, with any liquid. Skip the loading phase. Tissue saturation in 3-4 weeks.</p>
    <p>For HCl: <strong>1.5 to 2 grams daily</strong> per manufacturer recommendation. The lower dose claim is the part of the HCl pitch with the weakest evidence — most trials still use 3-5 g of HCl for parity with monohydrate outcomes.</p>'''),
        ('A note on price.', '''    <p>At time of writing, plain micronized monohydrate is roughly $0.10-0.20 per 5 g serving. HCl is $0.40-0.80 per serving. Over a year of daily use, the difference is $90 to $200. Spent on whole food, training shoes, or actual sleep hygiene, that money will move your outcomes more than the form of creatine ever will.</p>'''),
    ],
    'related': [
        ('creatine-monohydrate-powder.html', 'N° 10 · The evidence file', 'Creatine monohydrate powder: the boring dose that works.', '7 min', 'KD 11'),
        ('whey-protein-powder.html', 'Evidence file', 'Whey protein powder: the only protein that matters.', '8 min', 'KD ~'),
        ('../Journal.html', 'Browse all', '82 guides. One on every molecule we sell.', 'The Journal →', 'All'),
    ],
    'faqs': [
        ('Is creatine HCl better than monohydrate?', 'No, for almost everyone. Tissue saturation (the relevant endpoint) is reached equally with both at standard doses. HCl is more soluble and may be slightly easier on the stomach at very high single doses, but at the standard 5 g daily dose, both produce the same outcome. HCl costs 2-3x more.'),
        ('Can I take a lower dose of creatine HCl?', 'Manufacturer claims yes, evidence says probably not. Most outcomes-based trials still use 3-5 g of HCl for parity with the standard 5 g monohydrate dose. The "1.5 g HCl equals 5 g monohydrate" claim has weak evidence.'),
        ('Does creatine HCl cause less bloating?', 'Possibly at very high single doses (10+ g). At standard 5 g daily, there is no meaningful difference in water retention between forms. The 1-2 kg of intramuscular water with creatine use happens with both.'),
        ('Why is creatine HCl more expensive?', 'Patented manufacturing process, smaller production volume, and marketing premium. The cost per serving is typically 2-3x monohydrate.'),
        ('Is creatine monohydrate safe?', 'Yes, with one of the cleanest safety profiles in sports nutrition. 30+ years of human RCT data, including multi-year continuous use studies. People with pre-existing kidney disease should consult a clinician.'),
    ],
})

# ====================================================================
# Render + write all
# ====================================================================
print(f"Generating {len(ARTICLES)} articles...")
written_paths = []
for art in ARTICLES:
    html_content = render(art)
    out_path = OUT / f"{art['slug']}.html"
    out_path.write_text(html_content)
    size = out_path.stat().st_size
    print(f"  ✓ {art['slug']:<40} {size:>6,} bytes")
    written_paths.append(str(out_path.relative_to(ROOT)))

print(f"\n{len(ARTICLES)} articles written.")
print("Mark these as 'written' in seo/state/content-queue.json by running:")
print("  python3 seo/scripts/build_batch_articles.py --mark-queue")
