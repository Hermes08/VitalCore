/* Vesper catalog — product data inspired by a full nutraceutical A-Z range.
   Each product: id, name, category, dose, form, blurb, benefits, facts, price, colors */

window.VESPER_CATEGORIES = [
  { id:'all',         label:'All Formulas' },
  { id:'essentials',  label:'Daily Essentials' },
  { id:'vitamins',    label:'Vitamins' },
  { id:'minerals',    label:'Minerals' },
  { id:'herbs',       label:'Herbs & Botanicals' },
  { id:'adaptogens',  label:'Adaptogens' },
  { id:'sleep',       label:'Sleep & Calm' },
  { id:'energy',      label:'Energy & Focus' },
  { id:'immune',      label:'Immune' },
  { id:'digestive',   label:'Digestive & Cleanse' },
  { id:'joint',       label:'Joint & Bone' },
  { id:'heart',       label:'Heart & Circulation' },
  { id:'beauty',      label:'Hair, Skin & Nails' },
  { id:'weight',      label:'Metabolic & Weight' },
  { id:'mens',        label:"Men's" },
  { id:'womens',      label:"Women's" },
  { id:'sport',       label:'Sport & Protein' },
  { id:'gummies',     label:'Gummies' },
  { id:'kids',        label:'Kids' },
];

// Warm organic palettes — index cycled per product
const P = [
  ['#f3c27a','#c4622d','#6b2a10','#e8a865'], // terracotta
  ['#d5e3a8','#7a8a63','#2f3a22','#a8bb85'], // sage
  ['#f1d58c','#c89b4a','#6b4a14','#e0b875'], // ochre
  ['#e8b4a0','#a0543d','#3a1b10','#d08a75'], // clay
  ['#f0c9a0','#b67a45','#4a2a10','#d4a275'], // amber
  ['#ded3b8','#8c7a55','#3e2f18','#b8a580'], // oat
  ['#e6c3c3','#9a4a4a','#3a1818','#c88585'], // rose
  ['#c9d9c0','#5a7a55','#1f2f20','#95b085'], // moss
  ['#dcc2e0','#7a5a8a','#2a1a33','#a788b8'], // plum
  ['#b8c8d9','#3f5a7a','#0f1e33','#7a95b5'], // slate blue
];

function mk(id, name, category, dose, form, blurb, benefits, facts, price, colorIdx, tag){
  return {
    id, name, category, dose, form, blurb, benefits, facts, price,
    c1: P[colorIdx][0], c2: P[colorIdx][1], c3: P[colorIdx][2], c4: P[colorIdx][3],
    tag: tag || null,
  };
}

// 80+ products. Enough that the catalog feels "full-range" without padding.
window.VESPER_PRODUCTS = [
  // ESSENTIALS
  mk('daily-01','Vesper Daily N° 01','essentials','60 caps','capsule',
     'The house foundation — twelve essentials in two quiet capsules, taken every morning at the same hour.',
     [['For','Everyone, every day'],['Take','2 capsules, AM'],['Notice','Steadier mornings by week 3'],['Sourcing','6 countries, audited biannually']],
     [['Vitamin D₃ (lichen)','50 μg','250%'],['Methylfolate (5-MTHF)','680 μg','170%'],['B₁₂ (methyl)','8 μg','333%'],['Magnesium glycinate','200 mg','48%'],['Algal DHA','330 mg','—'],['Vitamin K₂ (MK-7)','90 μg','75%'],['Zinc bisglycinate','8 mg','73%'],['Iodine (kelp)','150 μg','100%']],
     68, 0, 'flagship'),

  mk('multi-women','Women\'s Daily Pack','essentials','30 packets','packet',
     'A complete morning ritual in one compostable sachet, tuned to a female metabolism.',
     [['For','Women, 18-45'],['Take','1 packet, AM'],['Notice','Cycle regularity, hair growth'],['Hero','Iron + folate + biotin']],
     [['Iron bisglycinate','18 mg','100%'],['Methylfolate','680 μg','170%'],['Biotin','2500 μg','8333%'],['Calcium citrate','500 mg','38%'],['Vitamin D₃','50 μg','250%'],['Magnesium','150 mg','36%']],
     54, 6, 'best-seller'),

  mk('multi-men','Men\'s Daily Pack','essentials','30 packets','packet',
     'Daily completeness, calibrated to male nutrient needs and testosterone support.',
     [['For','Men, 18-55'],['Take','1 packet, AM'],['Notice','Energy, recovery'],['Hero','Zinc + B-complex + magnesium']],
     [['Zinc picolinate','15 mg','136%'],['Magnesium glycinate','300 mg','71%'],['B-complex','full spectrum','—'],['Vitamin D₃','50 μg','250%'],['CoQ10','100 mg','—'],['Selenium','100 μg','181%']],
     54, 9),

  mk('prenatal','Prenatal Complete','essentials','60 caps','capsule',
     'Folate, choline, and iron in their active forms — built for the two of you.',
     [['For','Pregnancy & conception'],['Take','2 capsules, AM'],['Notice','Physician-recommended'],['Hero','600 μg folate + choline']],
     [['Methylfolate','600 μg','150%'],['Choline','165 mg','30%'],['Iron','18 mg','100%'],['Iodine','220 μg','147%'],['Algal DHA','300 mg','—'],['B₆ pyridoxal','5 mg','294%']],
     58, 1),

  // VITAMINS
  mk('d3-5000','Vitamin D₃ 5000 IU','vitamins','90 softgels','softgel',
     'The solar vitamin, in a therapeutic dose — for bone, mood, and the quiet architecture of immunity.',
     [['For','Low sun months'],['Take','1 softgel, with fat'],['Paired with','K₂ for calcium routing'],['Source','Sheep lanolin or lichen']],
     [['Vitamin D₃ (cholecalciferol)','125 μg','625%']],
     18, 2),

  mk('b12-5000','Vitamin B₁₂ 5000 mcg','vitamins','60 tabs','sublingual',
     'Methylcobalamin — the already-active form, dissolved under the tongue for direct uptake.',
     [['For','Vegans, over-50s, fatigue'],['Take','1 tablet, sublingually'],['Form','Methylcobalamin, not cyanoB₁₂'],['Notice','Energy within a week']],
     [['Vitamin B₁₂ (methyl)','5000 μg','208,333%']],
     16, 4),

  mk('b-complex','B-100 Complex','vitamins','60 caps','capsule',
     'The full B-spectrum, in balanced ratios — for nerves, energy, and cellular choreography.',
     [['For','Stress, fatigue, focus'],['Take','1 capsule, AM'],['Form','All methylated'],['Profile','B1-B2-B3-B5-B6-B7-B9-B12']],
     [['Thiamine (B₁)','100 mg'],['Riboflavin (B₂)','100 mg'],['Niacin (B₃)','100 mg'],['B₅','100 mg'],['B₆','100 mg'],['Biotin','100 μg'],['Folate','400 μg'],['B₁₂','100 μg']],
     22, 5),

  mk('c-1000','Buffered Vitamin C 1000 mg','vitamins','120 tabs','tablet',
     'Buffered ascorbate with rose hips and bioflavonoids — gentle on the stomach, whole-food in spirit.',
     [['For','Immune support, skin'],['Take','1 tab, anytime'],['Notice','Vitamin C + rose hips'],['Paired','With zinc in winter']],
     [['Vitamin C (buffered)','1000 mg','1111%'],['Rose hips','50 mg'],['Bioflavonoids','25 mg']],
     19, 0),

  mk('e-400','Vitamin E 400 IU','vitamins','60 softgels','softgel',
     'Full-spectrum tocopherols — not an isolated alpha — for skin, blood, and cellular longevity.',
     [['For','Skin, heart, antioxidant'],['Take','1 softgel with food'],['Form','Mixed tocopherols'],['Source','Non-GMO sunflower']],
     [['Vitamin E (mixed)','268 mg','1786%']],
     17, 2),

  mk('d3-k2-gummies','Vitamin D₃ + K₂ Gummies','vitamins','60 gummies','gummy',
     'The partnership, in a soft citrus chew — D₃ to absorb calcium, K₂ to route it.',
     [['For','Bone, heart, daily'],['Take','2 gummies'],['Flavor','Meyer lemon'],['Hero','D₃ 2000 IU + K₂ 90 μg']],
     [['Vitamin D₃','50 μg','250%'],['Vitamin K₂ (MK-7)','90 μg','75%']],
     22, 2),

  // MINERALS
  mk('mag-glycinate','Magnesium Bisglycinate 200 mg','minerals','90 caps','capsule',
     'The gentlest, most absorbable magnesium — for sleep, muscle softness, and nervous tempo.',
     [['For','Sleep, cramps, anxiety'],['Take','2 caps, PM'],['Form','Chelated bisglycinate'],['Notice','Deeper sleep by night 4']],
     [['Magnesium (bisglycinate)','200 mg','48%']],
     24, 1, 'best-seller'),

  mk('zinc-50','Zinc 50 mg','minerals','100 caps','capsule',
     'High-absorption zinc picolinate — for immunity, skin, and the body\'s thousand daily reparations.',
     [['For','Immune, skin, hormonal'],['Take','1 cap, with food'],['Form','Picolinate'],['Paired','Copper 2 mg, rotate']],
     [['Zinc (picolinate)','50 mg','455%']],
     14, 5),

  mk('iron','Gentle Iron 18 mg','minerals','90 caps','capsule',
     'Ferrous bisglycinate — iron that does not unsettle you, for oxygen and the quiet morning.',
     [['For','Women, low ferritin'],['Take','1 cap, AM, empty'],['Form','Bisglycinate, non-constipating'],['Pair with','Vitamin C']],
     [['Iron (bisglycinate)','18 mg','100%']],
     16, 6),

  mk('calcium-mag','Calcium + Magnesium','minerals','120 tabs','tablet',
     'The bone duo, in a 2:1 ratio — with Vitamin D₃ to make them stick.',
     [['For','Bone density, posture'],['Take','2 tabs, PM'],['Ratio','Ca:Mg 2:1'],['With','Vitamin D₃ 400 IU']],
     [['Calcium (citrate)','500 mg','38%'],['Magnesium','250 mg','60%'],['Vitamin D₃','10 μg','50%']],
     19, 5),

  mk('chromium','Chromium Picolinate','minerals','100 tabs','tablet',
     'A trace mineral with an outsized role in insulin sensitivity and sugar cravings.',
     [['For','Glucose balance, cravings'],['Take','1 tab with meals'],['Form','Picolinate'],['Notice','Steadier afternoons']],
     [['Chromium (picolinate)','200 μg','571%']],
     13, 9),

  mk('selenium','Selenium 200 mcg','minerals','90 caps','capsule',
     'From Brazil nuts, a single mineral with profound thyroid and antioxidant effects.',
     [['For','Thyroid, antioxidant'],['Take','1 cap daily'],['Form','Selenomethionine'],['Source','Brazil nut']],
     [['Selenium','200 μg','364%']],
     14, 2),

  mk('potassium','Potassium + Iodine','minerals','100 tabs','tablet',
     'For electrolyte balance and thyroid tempo — the small tide behind your metabolism.',
     [['For','Energy, cramps, thyroid'],['Take','1 tab daily'],['With','Iodine kelp'],['Notice','Afternoon steadiness']],
     [['Potassium','99 mg','2%'],['Iodine (kelp)','150 μg','100%']],
     15, 7),

  // HERBS
  mk('turmeric-750','Turmeric 750 mg','herbs','90 caps','capsule',
     'Curcumin with black pepper — 2000× more bioavailable than plain root.',
     [['For','Inflammation, joints'],['Take','1 cap with food'],['Form','95% curcuminoids'],['Paired','BioPerine for absorption']],
     [['Turmeric (95% curcuminoids)','750 mg'],['Black pepper (BioPerine)','5 mg']],
     22, 0),

  mk('ginkgo','Ginkgo Biloba 120 mg','herbs','60 caps','capsule',
     'A 200-million-year-old tree\'s extract — for circulation, memory, and the clarity of afternoon.',
     [['For','Memory, circulation'],['Take','1 cap AM'],['Form','24% flavones'],['Notice','Recall within 6 weeks']],
     [['Ginkgo biloba (24/6)','120 mg']],
     18, 7),

  mk('milk-thistle','Milk Thistle 450 mg','herbs','90 caps','capsule',
     'Silymarin — the plant\'s gift to the liver, studied for four decades.',
     [['For','Liver support, detox'],['Take','1 cap AM'],['Form','80% silymarin'],['With','Artichoke, dandelion']],
     [['Milk thistle (80% silymarin)','450 mg']],
     19, 5),

  mk('saw-palmetto','Saw Palmetto 500 mg','herbs','90 caps','capsule',
     'A Florida berry with profound effects on prostate health and hormonal flow.',
     [['For','Men 40+, prostate'],['Take','1 cap AM'],['Form','Standardized 45%'],['Notice','Nighttime relief']],
     [['Saw palmetto berry','500 mg']],
     21, 1),

  mk('olive-leaf','Olive Leaf Extract','herbs','60 caps','capsule',
     'From the Mediterranean olive grove, oleuropein for immune and cardiovascular support.',
     [['For','Immune, blood pressure'],['Take','1-2 caps daily'],['Form','20% oleuropein'],['With','Winter protocols']],
     [['Olive leaf (20% oleuropein)','500 mg']],
     17, 7),

  mk('elderberry','Elderberry Gummies','herbs','60 gummies','gummy',
     'Sambucus nigra in a winter-forward chew, with zinc and C for the cold months.',
     [['For','Seasonal immune'],['Take','2 gummies'],['Flavor','Dark berry'],['Hero','150 mg elderberry + zinc + C']],
     [['Elderberry','150 mg'],['Vitamin C','60 mg'],['Zinc','5 mg']],
     20, 8),

  mk('quercetin','Quercetin 500 mg + Bromelain','herbs','60 caps','capsule',
     'A flavonoid from onion skin and apple peel, with bromelain from pineapple stem.',
     [['For','Allergies, inflammation'],['Take','1-2 caps'],['With','Bromelain 100 mg'],['Season','Spring pollen']],
     [['Quercetin','500 mg'],['Bromelain','100 mg']],
     23, 5),

  mk('cranberry','Cranberry Concentrate','herbs','90 caps','capsule',
     'The bog berry, 50:1 concentrate — for urinary tract and kidney support.',
     [['For','UT support'],['Take','1 cap daily'],['Form','50:1 concentrate'],['Women','Particularly']],
     [['Cranberry (50:1)','500 mg']],
     18, 6),

  // ADAPTOGENS
  mk('ashwagandha','Organic Ashwagandha KSM-66','adaptogens','90 caps','capsule',
     'The king of adaptogens — for stress, sleep, and the quiet mastery of cortisol.',
     [['For','Stress, sleep, hormones'],['Take','2 caps AM'],['Form','KSM-66 5%'],['Notice','Calm within 2 weeks']],
     [['Ashwagandha (KSM-66)','600 mg']],
     28, 3, 'best-seller'),

  mk('rhodiola','Rhodiola Rosea 500 mg','adaptogens','60 caps','capsule',
     'An arctic root from Siberia — for mental fatigue, focus, and physical endurance.',
     [['For','Focus, stamina'],['Take','1 cap AM'],['Form','3% rosavins'],['Caffeine-free','Yes']],
     [['Rhodiola rosea','500 mg']],
     24, 2),

  mk('lions-mane','Lion\'s Mane Complex','adaptogens','90 caps','capsule',
     'A mushroom that looks like coral and acts on the brain — NGF, memory, neural growth.',
     [['For','Focus, memory, creativity'],['Take','2 caps AM'],['Form','Dual-extract 8:1'],['With','Reishi, cordyceps']],
     [['Lion\'s mane (8:1)','800 mg'],['Reishi','200 mg'],['Cordyceps','200 mg']],
     32, 7),

  mk('mushroom-7','Seven-Mushroom Complex','adaptogens','90 caps','capsule',
     'Reishi, chaga, lion\'s mane, cordyceps, turkey tail, maitake, shiitake — the full immune garden.',
     [['For','Immune, energy, longevity'],['Take','2 caps AM'],['Extract','Dual 10:1'],['Organic','Certified']],
     [['Mushroom blend (7 spp)','1500 mg']],
     36, 5, 'new'),

  mk('maca','Maca Extract 400 mg','adaptogens','90 caps','capsule',
     'A root from the Peruvian Andes — for libido, energy, and hormonal equilibrium.',
     [['For','Energy, libido'],['Take','1 cap AM'],['Form','Gelatinized, 10:1'],['Color','Red/black blend']],
     [['Maca root (10:1)','400 mg']],
     20, 6),

  mk('moringa','Moringa Complex','adaptogens','60 caps','capsule',
     '"The miracle tree" from South Asia — a green packed with vitamins, minerals, amino acids.',
     [['For','Nutrient density, energy'],['Take','2 caps'],['Form','Leaf powder + extract'],['Organic','Yes']],
     [['Moringa oleifera','1000 mg']],
     18, 1),

  // SLEEP
  mk('sleep-formula','Sleep Formula','sleep','60 caps','capsule',
     'Melatonin, magnesium, L-theanine, valerian — a considered quartet for deep, uninterrupted rest.',
     [['For','Falling + staying asleep'],['Take','2 caps, 30min before bed'],['Non-habit','Yes'],['Notice','Morning clarity']],
     [['Melatonin','3 mg'],['Magnesium glycinate','150 mg'],['L-theanine','200 mg'],['Valerian root','200 mg'],['Passionflower','100 mg']],
     26, 8, 'best-seller'),

  mk('melatonin-gummies','Melatonin Gummies 5 mg','sleep','60 gummies','gummy',
     'A soft berry chew with the body\'s own sleep hormone — gentle onset, no grogginess.',
     [['For','Jet lag, travel'],['Take','1 gummy, 30min before bed'],['Flavor','Wild berry'],['Dose','Low, 5 mg']],
     [['Melatonin','5 mg']],
     16, 8),

  mk('valerian','Valerian Root 250 mg','sleep','60 caps','capsule',
     'An ancient European herb for restlessness, tension, and the quiet approach to sleep.',
     [['For','Mild anxiety, sleep'],['Take','1 cap, PM'],['Form','Standardized root'],['Pair with','Magnesium']],
     [['Valerian root extract','250 mg']],
     15, 9),

  mk('l-theanine','L-Theanine 200 mg','sleep','60 caps','capsule',
     'From green tea — a single amino acid that produces alpha brain waves, calm without drowsiness.',
     [['For','Calm focus, stress'],['Take','1-2 caps anytime'],['Pair','With caffeine = flow'],['Non-sedating','Yes']],
     [['L-theanine','200 mg']],
     22, 7),

  // ENERGY
  mk('coq10','CoQ10 100 mg','energy','60 softgels','softgel',
     'The mitochondrial spark — energy at the cellular level, especially useful over 40.',
     [['For','Energy, heart, statin users'],['Take','1 softgel with fat'],['Form','Ubiquinone'],['Over 50','Switch to ubiquinol']],
     [['Coenzyme Q10','100 mg']],
     28, 2),

  mk('ubiquinol','Ubiquinol 50 mg','energy','60 softgels','softgel',
     'The active, reduced form of CoQ10 — for hearts over 50 who struggle to convert.',
     [['For','Heart, over 50'],['Take','1 softgel daily'],['Form','Kaneka ubiquinol'],['Fat-soluble','Yes']],
     [['Ubiquinol','50 mg']],
     36, 5),

  mk('alc','ALA / Acetyl-L-Carnitine 750 mg','energy','60 caps','capsule',
     'The pair that shuttles fat into mitochondria and protects what\'s already there.',
     [['For','Energy, brain'],['Take','1 cap AM'],['Pair','Alpha-lipoic + ALC'],['Stack','With CoQ10']],
     [['Acetyl-L-Carnitine','500 mg'],['Alpha-lipoic acid','250 mg']],
     27, 0),

  mk('cordyceps','Cordyceps 1000 mg','energy','60 caps','capsule',
     'A Himalayan fungus studied for VO2 max, endurance, and clean, non-jittery energy.',
     [['For','Endurance, stamina'],['Take','2 caps AM'],['Form','CS-4, 10:1'],['Pre-workout','Yes']],
     [['Cordyceps (10:1)','1000 mg']],
     26, 4),

  // IMMUNE
  mk('immune-defense','Immune Defense','immune','60 caps','capsule',
     'Elderberry, echinacea, zinc, vitamin C, D₃ — the full winter protocol in one bottle.',
     [['For','Seasonal support'],['Take','2 caps, first sign'],['Hero','Elderberry + zinc'],['With','Olive leaf, astragalus']],
     [['Elderberry','200 mg'],['Echinacea','150 mg'],['Zinc','15 mg'],['Vitamin C','250 mg'],['Vitamin D₃','25 μg']],
     26, 6),

  mk('probiotic-30b','30 Billion Probiotic','immune','60 caps','capsule',
     'Twelve clinically-studied strains, 30 billion CFU per capsule — for gut and, in turn, immune.',
     [['For','Gut, immune, mood'],['Take','1 cap AM'],['CFU','30 billion'],['Strains','12, guaranteed']],
     [['Probiotic blend (12 strains)','30 billion CFU']],
     32, 7),

  mk('colostrum','Colostrum 30% IgG','immune','120 caps','capsule',
     'The first milk — nature\'s immune primer, with 30% immunoglobulin G.',
     [['For','Gut, immune, athletes'],['Take','2 caps AM, empty'],['IgG','30%'],['Source','Grass-fed bovine']],
     [['Colostrum','500 mg'],['of which IgG','150 mg']],
     34, 3),

  // DIGESTIVE
  mk('digest-enzyme','Digestive Enzyme Complex','digestive','90 caps','capsule',
     'Protease, lipase, amylase, bromelain, papain — a full enzymatic staff for heavy meals.',
     [['For','Bloating, heavy meals'],['Take','1-2 caps with meals'],['Spectrum','6 enzymes'],['Vegan','Yes']],
     [['Protease','15000 HUT'],['Amylase','3500 DU'],['Lipase','500 FIP'],['Bromelain','150 mg'],['Papain','100 mg']],
     22, 5),

  mk('cleanse-15','15-Day Gentle Cleanse','digestive','30 caps','capsule',
     'A herbal reset — senna-free, fibre-forward, calibrated over two weeks.',
     [['For','Seasonal reset'],['Take','1 cap AM + 1 PM, 15 days'],['Senna-free','Yes'],['Return to baseline','Within 21 days']],
     [['Psyllium husk','500 mg'],['Cape aloe','200 mg'],['Triphala','150 mg'],['Ginger','100 mg']],
     28, 6),

  mk('psyllium','Psyllium Husk 725 mg','digestive','180 caps','capsule',
     'Soluble fibre from the husk — for regularity, cholesterol, and steady blood sugar.',
     [['For','Regularity, cholesterol'],['Take','2-4 caps with water'],['Form','Whole husk'],['Water','Lots']],
     [['Psyllium husk','725 mg']],
     16, 5),

  mk('cape-aloe','Cape Aloe Colon Care','digestive','60 caps','capsule',
     'A natural occasional-use laxative from the Cape aloe plant, with fennel and ginger.',
     [['For','Occasional constipation'],['Take','1 cap PM'],['Short-term','Use as needed'],['With','Fennel, ginger']],
     [['Cape aloe','250 mg'],['Fennel','100 mg'],['Ginger','50 mg']],
     17, 4),

  // JOINT
  mk('joint-matrix','Joint Matrix','joint','120 caps','capsule',
     'Glucosamine, chondroitin, MSM, turmeric, boswellia — the complete cartilage-and-inflammation team.',
     [['For','Joints, cartilage'],['Take','2 caps AM + 2 PM'],['Complete','Yes'],['Notice','6-8 weeks for cartilage']],
     [['Glucosamine sulfate','1500 mg'],['Chondroitin sulfate','1200 mg'],['MSM','1000 mg'],['Turmeric','200 mg'],['Boswellia','100 mg']],
     38, 1, 'best-seller'),

  mk('msm','MSM 1000 mg','joint','90 caps','capsule',
     'A bioavailable sulphur for joints, skin, and connective tissue — the mineral of elasticity.',
     [['For','Joints, skin, hair'],['Take','1 cap AM'],['Form','OptiMSM'],['With','Glucosamine']],
     [['MSM (OptiMSM)','1000 mg']],
     19, 5),

  mk('collagen-peptides','Hydrolyzed Collagen Peptides','joint','454 g','powder',
     'Grass-fed, pasture-raised type I + III collagen — for joints, skin, and hair, stirred into coffee.',
     [['For','Joints, skin, hair'],['Take','1 scoop, coffee/water'],['Source','Grass-fed bovine'],['Type','I + III']],
     [['Collagen peptides','11 g'],['of which protein','10 g']],
     42, 0),

  mk('bone-health','Bone Health Complex','joint','120 caps','capsule',
     'Calcium, magnesium, K₂, D₃, boron, silica — everything bone needs, in the right ratios.',
     [['For','Bone density, 40+'],['Take','2 caps AM + 2 PM'],['K₂','Yes, essential'],['Women','Postmenopausal esp.']],
     [['Calcium','600 mg'],['Magnesium','300 mg'],['Vitamin D₃','50 μg'],['Vitamin K₂','90 μg'],['Boron','3 mg']],
     32, 5),

  // HEART
  mk('omega-3','Mega EPA/DHA 1200 mg','heart','120 softgels','softgel',
     'Triple-strength, molecularly-distilled fish oil — for heart, brain, and the scaffolding of cells.',
     [['For','Heart, brain, skin'],['Take','2 softgels with meals'],['Form','Triglyceride TG'],['Tested','Heavy metals, PCBs']],
     [['Total omega-3','1200 mg'],['EPA','720 mg'],['DHA','480 mg']],
     34, 9, 'best-seller'),

  mk('krill-oil','Krill Oil 500 mg','heart','60 softgels','softgel',
     'Antarctic krill — phospholipid omega-3s with astaxanthin, more bioavailable than fish oil.',
     [['For','Heart, joints, eyes'],['Take','2 softgels daily'],['With','Astaxanthin natural'],['Source','Sustainably harvested']],
     [['Krill oil','500 mg'],['Astaxanthin','50 μg']],
     44, 6),

  mk('nattokinase','Nattokinase 2000 FU','heart','60 caps','capsule',
     'A fermented soybean enzyme from Japan — for circulation and healthy fibrin levels.',
     [['For','Circulation, blood flow'],['Take','1 cap AM, empty'],['Units','2000 FU'],['Source','Bacillus subtilis']],
     [['Nattokinase','100 mg (2000 FU)']],
     28, 9),

  mk('hawthorn','Hawthorn Berry Extract','heart','90 caps','capsule',
     'Traditional European cardiotonic — for heart muscle, blood pressure, and circulation.',
     [['For','Heart, circulation'],['Take','1 cap AM + PM'],['Form','Berry + leaf'],['Gentle','Long-term safe']],
     [['Hawthorn extract','500 mg']],
     19, 7),

  mk('bp-support','Blood Pressure Support','heart','90 caps','capsule',
     'Hibiscus, hawthorn, garlic, CoQ10 — herbal support for healthy pressure, gently over time.',
     [['For','Blood pressure'],['Take','1 cap AM + 1 PM'],['Herbs','4 botanicals'],['With','Dietary change']],
     [['Hibiscus','250 mg'],['Hawthorn','200 mg'],['Garlic','150 mg'],['CoQ10','30 mg']],
     26, 3),

  mk('berberine','Berberine Complex','heart','90 caps','capsule',
     'From Berberis plants — for glucose, lipids, and metabolic balance.',
     [['For','Metabolic, glucose'],['Take','1 cap with meals, 3×'],['Studied','Extensively'],['With','Milk thistle for liver']],
     [['Berberine HCl','500 mg']],
     28, 2),

  // BEAUTY
  mk('biotin-10k','Biotin 10,000 mcg','beauty','120 caps','capsule',
     'The beauty vitamin, therapeutic dose — for hair thickness, nail strength, skin clarity.',
     [['For','Hair, nails, skin'],['Take','1 cap AM'],['Dose','High therapeutic'],['Notice','3-4 months for hair']],
     [['Biotin','10000 μg','33333%']],
     16, 2),

  mk('hair-skin-nails','Hair, Skin & Nails','beauty','90 caps','capsule',
     'Biotin, collagen, hyaluronic acid, silica, MSM — the full dressing-table in one capsule.',
     [['For','Beauty complete'],['Take','2 caps AM'],['Complete','Yes'],['Works with','Collagen peptides']],
     [['Biotin','5000 μg'],['Collagen','500 mg'],['Hyaluronic acid','40 mg'],['MSM','500 mg'],['Silica','30 mg']],
     32, 6, 'best-seller'),

  mk('hyaluronic','Hyaluronic Acid 120 mg','beauty','60 caps','capsule',
     'Hydration from within — for skin plumpness, joint cushion, and elastic recovery.',
     [['For','Skin hydration, joints'],['Take','1 cap daily'],['Form','Sodium hyaluronate'],['Molecular','Low-MW']],
     [['Hyaluronic acid','120 mg']],
     28, 8),

  mk('phytoceramides','Phytoceramides Complex','beauty','30 caps','capsule',
     'Wheat-derived lipids that restore the skin\'s barrier from within — a Japanese beauty ritual.',
     [['For','Skin barrier, dryness'],['Take','1 cap AM'],['Form','Ceramide-PCD'],['With','Vitamins A, C, D, E']],
     [['Phytoceramides','350 mg'],['Vitamin A','1500 IU'],['Vitamin C','60 mg']],
     34, 6),

  // WEIGHT
  mk('green-tea','Green Tea 98% Extract','weight','90 caps','capsule',
     'Concentrated EGCG from green tea — for metabolism, focus, and antioxidant defense.',
     [['For','Metabolism, focus'],['Take','1 cap AM + PM'],['EGCG','45%'],['Caffeine','Low, 30 mg']],
     [['Green tea (98% polyphenols)','500 mg'],['of which EGCG','225 mg']],
     18, 1),

  mk('garcinia','Garcinia Cambogia 800 mg','weight','60 caps','capsule',
     'A Southeast Asian fruit with HCA — for appetite and carbohydrate metabolism.',
     [['For','Appetite'],['Take','1 cap before meals'],['HCA','60%'],['Stimulant-free','Yes']],
     [['Garcinia cambogia (60% HCA)','800 mg']],
     17, 0),

  mk('fat-burner','Super Fat Burner','weight','90 caps','capsule',
     'A focused, stimulant-aware blend — green tea, L-carnitine, CLA, cayenne, chromium.',
     [['For','Metabolic support'],['Take','1 cap AM + pre-workout'],['Stim','Moderate (green tea)'],['Pair with','Diet, movement']],
     [['Green tea','300 mg'],['L-carnitine','250 mg'],['CLA','200 mg'],['Cayenne','100 mg'],['Chromium','200 μg']],
     26, 0),

  mk('cla','CLA 1000 mg','weight','90 softgels','softgel',
     'Conjugated linoleic acid — for body composition and lean mass, from safflower oil.',
     [['For','Body composition'],['Take','1 softgel with meals, 3×'],['Source','Safflower'],['Stimulant-free','Yes']],
     [['CLA (safflower)','1000 mg']],
     19, 4),

  // MEN'S
  mk('testosterone','Infinite Male','mens','60 caps','capsule',
     'Tribulus, tongkat ali, fenugreek, zinc, D₃ — a botanical stack for vitality over 35.',
     [['For','Men 35+, vitality'],['Take','2 caps AM'],['Botanicals','5'],['With','Sleep, movement']],
     [['Tribulus','500 mg'],['Tongkat ali','200 mg'],['Fenugreek','200 mg'],['Zinc','15 mg'],['Vitamin D₃','25 μg']],
     38, 9),

  mk('prostate','Prostate Support','mens','90 caps','capsule',
     'Saw palmetto, pygeum, beta-sitosterol, zinc — the evidence-based prostate stack.',
     [['For','Men 40+, prostate'],['Take','1 cap AM + 1 PM'],['Complete','Yes'],['Studies','Decades of']],
     [['Saw palmetto','320 mg'],['Pygeum','100 mg'],['Beta-sitosterol','60 mg'],['Zinc','15 mg']],
     34, 5),

  mk('tongkat','Tongkat Ali 400 mg','mens','60 caps','capsule',
     'A Malaysian root — eurycoma — for male vitality, testosterone support, and recovery.',
     [['For','Vitality, recovery'],['Take','1 cap AM'],['Extract','200:1'],['Cycle','5 days on, 2 off']],
     [['Tongkat ali (200:1)','400 mg']],
     29, 7),

  // WOMEN'S
  mk('dim','DIM Complex','womens','60 caps','capsule',
     'Diindolylmethane, from cruciferous vegetables — for healthy estrogen metabolism.',
     [['For','Hormonal balance, skin'],['Take','1 cap AM'],['Form','DIM 200 mg'],['Women','Cycling, peri']],
     [['DIM','200 mg'],['BioPerine','5 mg']],
     26, 6),

  mk('womens-support','Women\'s Support','womens','90 caps','capsule',
     'Chaste tree, red clover, dong quai, evening primrose — a botanical support for the monthly arc.',
     [['For','Cycle, PMS, peri'],['Take','1 cap AM + PM'],['Botanicals','4'],['Form','Standardized']],
     [['Chaste tree','200 mg'],['Red clover','150 mg'],['Dong quai','100 mg'],['Evening primrose','500 mg']],
     32, 8),

  // SPORT
  mk('whey-vanilla','Whey 26 Protein — Vanilla','sport','2 lb','powder',
     'Grass-fed, cold-filtered whey — 26 g of protein, 2 g sugar, clean vanilla from Madagascar.',
     [['For','Recovery, training'],['Mix','1 scoop in water/milk'],['Protein','26 g / serving'],['Source','Grass-fed']],
     [['Protein (whey)','26 g'],['BCAAs','5.5 g'],['Sugar','2 g']],
     58, 5),

  mk('vegan-protein','Vegan Protein — Chocolate','sport','2 lb','powder',
     'Pea, pumpkin, sunflower — 22 g of plant protein, full amino profile, rich cocoa.',
     [['For','Recovery, plant-based'],['Mix','1 scoop'],['Protein','22 g'],['Source','3 plants']],
     [['Protein (plant blend)','22 g'],['BCAAs','4.5 g'],['Iron','4 mg']],
     54, 7),

  mk('creatine','Creatine Monohydrate','sport','300 g','powder',
     'Pure micronized monohydrate — the single most-studied sport supplement, for strength and power.',
     [['For','Strength, power'],['Take','5 g daily, any time'],['Form','Micronized'],['Tested','Purity 99.9%']],
     [['Creatine monohydrate','5000 mg']],
     28, 9),

  mk('bcaa','BCAA 3000 mg','sport','90 caps','capsule',
     'Leucine, isoleucine, valine in a 2:1:1 ratio — for training endurance and recovery.',
     [['For','Endurance, recovery'],['Take','3 caps pre/intra'],['Ratio','2:1:1'],['Sugar-free','Yes']],
     [['L-Leucine','1500 mg'],['L-Isoleucine','750 mg'],['L-Valine','750 mg']],
     24, 4),

  mk('pre-workout','Nitro Pump','sport','300 g','powder',
     'L-citrulline, beta-alanine, caffeine, beetroot — a clean, balanced pre with no crash.',
     [['For','Training, pump'],['Mix','1 scoop 30min prior'],['Caffeine','200 mg'],['Flavor','Blood orange']],
     [['L-citrulline','6000 mg'],['Beta-alanine','3200 mg'],['Caffeine','200 mg'],['Beetroot','500 mg']],
     38, 0),

  // GUMMIES
  mk('ashwa-gummies','Ashwagandha Gummies','gummies','60 gummies','gummy',
     'A calm, berry-forward chew with KSM-66 ashwagandha — the adaptogen in soft form.',
     [['For','Stress, sleep, calm'],['Take','2 gummies'],['Flavor','Mixed berry'],['Form','KSM-66']],
     [['Ashwagandha (KSM-66)','300 mg']],
     24, 3),

  mk('acv-gummies','Apple Cider Vinegar Gummies','gummies','60 gummies','gummy',
     'ACV with the mother, in a soft honey chew — for digestion and metabolic balance.',
     [['For','Digestion, metabolism'],['Take','2 gummies'],['Flavor','Apple-honey'],['With','Mother']],
     [['Apple cider vinegar','500 mg'],['B₁₂','100 μg'],['Folate','200 μg']],
     22, 2),

  mk('biotin-gummies','Biotin Gummies','gummies','60 gummies','gummy',
     'Blueberry-flavored biotin chews — for hair, nails, and skin, as a soft daily ritual.',
     [['For','Hair, nails'],['Take','2 gummies'],['Flavor','Blueberry'],['Dose','5000 μg']],
     [['Biotin','5000 μg']],
     18, 8),

  mk('multi-gummies','Multi-Vitamin Gummies','gummies','60 gummies','gummy',
     'A full daily multi in an assorted-berry gummy — for those who prefer their ritual soft.',
     [['For','Daily foundation'],['Take','2 gummies'],['Complete','Yes'],['Sugar','Low']],
     [['13 vitamins + minerals','—','100%']],
     24, 6),

  // KIDS
  mk('kids-multi','Kids Multivitamin Gummy Bears','kids','60 gummies','gummy',
     'The full spectrum, in a soft fruity bear — age-appropriate doses, no artificial colors.',
     [['For','Kids 4+'],['Take','1-2 gummies'],['Flavor','Mixed fruit'],['No','Artificial dyes']],
     [['13 vitamins + minerals','—','100% DV kids']],
     20, 2),

  mk('kids-melatonin','Kids Melatonin 1 mg','kids','60 gummies','gummy',
     'A low, age-appropriate melatonin dose — for occasional sleep support, with chamomile.',
     [['For','Kids 4+, sleep'],['Take','1 gummy 30min before bed'],['Low-dose','1 mg'],['Non-habit','Yes']],
     [['Melatonin','1 mg'],['Chamomile','50 mg']],
     18, 9),

  mk('kids-probiotic','Kids Probiotic Gummies','kids','60 gummies','gummy',
     'Organic probiotic gummies with 1 billion CFU — for kids\' tummies, mixed-berry flavor.',
     [['For','Kids 3+, digestion'],['Take','1-2 gummies'],['CFU','1 billion'],['Organic','Yes']],
     [['Probiotic blend','1 billion CFU']],
     22, 7),

  mk('kids-lutein','Kids Lutein Gummies','kids','60 gummies','gummy',
     'Screen-age eye support — lutein, zeaxanthin, vitamin A, in a kid-friendly chew.',
     [['For','Kids 4+, screen eyes'],['Take','1 gummy'],['With','Lutein, zeaxanthin'],['Flavor','Berry']],
     [['Lutein','5 mg'],['Zeaxanthin','1 mg'],['Vitamin A','500 IU']],
     20, 5),
];
