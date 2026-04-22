/* Vesper unified navbar
   Drop-in: <script src="nav-unified.js" defer></script> (or "../nav-unified.js" from /es/)
   The script:
   - Detects language from <html lang="..."> (en|es)
   - Detects current page from body[data-page] (home|shop|quiz|journal|founder)
   - Injects the announcement bar + unified nav (same markup EN+ES, only labels swap)
   - Provides a small EN·ES toggle button at the right of the nav
   - Replaces any existing <nav class="top"> or .ann elements if present
*/
(function(){
  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  const page = (document.body.getAttribute('data-page') || '').toLowerCase();
  const isES = lang === 'es';
  const base = isES ? '' : ''; // links are relative to current dir

  // Paths — from EN root and from /es/
  const P = isES ? {
    home:'Home.html', shop:'Catalog.html', quiz:'Quiz.html', journal:'Journal.html', founder:'Founder.html',
    toEN:'../Home.html', toES:'Home.html'
  } : {
    home:'Home.html', shop:'Catalog.html', quiz:'Quiz.html', journal:'Journal.html', founder:'Founder.html',
    toEN:'Home.html', toES:'es/Home.html'
  };
  // page-specific ES/EN equivalents for the toggle to land on the same page
  const pageMap = {
    home:   {en:'Home.html',    es:'Home.html'},
    shop:   {en:'Catalog.html', es:'Catalog.html'},
    quiz:   {en:'Quiz.html',    es:'Quiz.html'},
    journal:{en:'Journal.html', es:'Journal.html'},
    founder:{en:'Founder.html', es:'Founder.html'},
  };
  let toEN = 'Home.html', toES = 'es/Home.html';
  if(pageMap[page]){
    if(isES){ toEN = '../' + pageMap[page].en; toES = pageMap[page].es; }
    else    { toES = 'es/' + pageMap[page].es; toEN = pageMap[page].en; }
  } else {
    if(isES){ toEN = '../Home.html'; toES = 'Home.html'; }
  }

  const L = isES ? {
    ann1:'Lote N° 031 · 488 botellas disponibles',
    ann2:'Envío gratis desde $40',
    shop:'Tienda', quiz:'Mi fórmula', journal:'Diario', founder:'Fundadora',
    shopCta:'Comprar', menu:'Menú', close:'Cerrar',
  } : {
    ann1:'Batch N° 031 · 488 bottles left',
    ann2:'Free US shipping over $40',
    shop:'Shop', quiz:'Find mine', journal:'Journal', founder:'Founder',
    shopCta:'Shop', menu:'Menu', close:'Close',
  };

  const active = p => page===p ? ' class="active"' : '';

  const CSS = `
  .v-ann{background:#1a120b;color:#efe6d7;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;padding:9px 16px;text-align:center;display:flex;justify-content:center;align-items:center;gap:14px;flex-wrap:wrap;position:relative;z-index:60}
  .v-ann em{color:#b48232;font-style:normal}
  .v-ann .sep{opacity:.35}
  @media(max-width:640px){.v-ann{font-size:9.5px;letter-spacing:.12em;padding:8px 10px;gap:8px}.v-ann .sep,.v-ann .hide-mob{display:none}}

  nav.v-top{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:16px 32px;background:rgba(239,230,215,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(26,18,11,.12);font-family:"Fraunces",Georgia,serif}
  nav.v-top .v-brand{font-family:"Fraunces",Georgia,serif;font-weight:400;font-size:22px;font-style:italic;text-decoration:none;color:#1a120b;letter-spacing:-.01em;display:inline-flex;align-items:baseline;gap:6px}
  nav.v-top .v-brand sup{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:9px;vertical-align:top;letter-spacing:.2em;opacity:.55;font-style:normal}
  nav.v-top .v-links{display:flex;gap:26px;justify-content:center;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase}
  nav.v-top .v-links a{color:#1a120b;text-decoration:none;opacity:.7;transition:opacity .2s,color .2s;padding-bottom:3px;border-bottom:1px solid transparent}
  nav.v-top .v-links a:hover{opacity:1;color:#b4501e}
  nav.v-top .v-links a.active{opacity:1;color:#b4501e;border-bottom-color:#b4501e}
  nav.v-top .v-right{justify-self:end;display:flex;gap:10px;align-items:center}
  nav.v-top .v-lang{display:inline-flex;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;border:1px solid rgba(26,18,11,.22);overflow:hidden}
  nav.v-top .v-lang a{padding:8px 10px;color:#6a5644;text-decoration:none;transition:background .2s,color .2s}
  nav.v-top .v-lang a.on{background:#1a120b;color:#efe6d7}
  nav.v-top .v-lang a:hover:not(.on){color:#1a120b}
  nav.v-top .v-cta{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;background:#b4501e;color:#efe6d7;padding:10px 16px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:background .2s}
  nav.v-top .v-cta:hover{background:#8a3c12}
  nav.v-top .v-menu{display:none;background:transparent;border:1px solid rgba(26,18,11,.22);padding:8px 12px;color:#1a120b;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.15em;cursor:pointer}
  @media(max-width:960px){
    nav.v-top{grid-template-columns:auto 1fr auto;padding:12px 18px;gap:10px}
    nav.v-top .v-links{display:none}
    nav.v-top .v-menu{display:inline-flex}
    nav.v-top .v-cta{padding:9px 12px;font-size:10px;letter-spacing:.15em}
    nav.v-top .v-lang a{padding:7px 8px;font-size:9.5px}
  }
  .v-drawer{position:fixed;inset:0;z-index:300;background:#1a120b;color:#efe6d7;padding:24px;transform:translateX(100%);transition:transform .35s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;gap:4px;overflow-y:auto;font-family:"Fraunces",Georgia,serif}
  .v-drawer.open{transform:translateX(0)}
  .v-drawer .v-x{align-self:flex-end;background:transparent;border:1px solid rgba(239,230,215,.3);color:#efe6d7;padding:11px 14px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:24px;cursor:pointer}
  .v-drawer a{color:#efe6d7;text-decoration:none;padding:18px 4px;border-bottom:1px solid rgba(239,230,215,.12);font-size:26px;font-style:italic;display:flex;justify-content:space-between;align-items:center;letter-spacing:-.01em}
  .v-drawer a.active{color:#b48232}
  .v-drawer a .tag{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;font-style:normal}
  .v-drawer .v-drawer-lang{margin-top:24px;display:flex;gap:2px;border:1px solid rgba(239,230,215,.2);align-self:flex-start}
  .v-drawer .v-drawer-lang a{padding:10px 16px;border:none;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;font-style:normal;opacity:.6}
  .v-drawer .v-drawer-lang a.on{background:#efe6d7;color:#1a120b;opacity:1}
  `;

  const html = `
<div class="v-ann">
  <span><em>◉</em> ${L.ann1}</span>
  <span class="sep">·</span>
  <span class="hide-mob">${L.ann2}</span>
</div>
<nav class="v-top" data-screen-label="Nav">
  <a class="v-brand" href="${P.home}">Vesper<sup>/MMXXVI</sup></a>
  <div class="v-links">
    <a href="${P.shop}"${active('shop')}>${L.shop}</a>
    <a href="${P.quiz}"${active('quiz')}>${L.quiz}</a>
    <a href="${P.journal}"${active('journal')}>${L.journal}</a>
    <a href="${P.founder}"${active('founder')}>${L.founder}</a>
  </div>
  <div class="v-right">
    <div class="v-lang" role="group" aria-label="Language">
      <a href="${toEN}" class="${isES?'':'on'}" aria-current="${isES?'false':'true'}">EN</a>
      <a href="${toES}" class="${isES?'on':''}" aria-current="${isES?'true':'false'}">ES</a>
    </div>
    <a class="v-cta" href="${P.shop}">${L.shopCta}<span>→</span></a>
    <button class="v-menu" id="vMenu" aria-label="${L.menu}">☰</button>
  </div>
</nav>
<aside class="v-drawer" id="vDrawer" aria-hidden="true">
  <button class="v-x" id="vDrawerClose">${L.close} ✕</button>
  <a href="${P.shop}"${active('shop')}>${L.shop} <span class="tag">82</span></a>
  <a href="${P.quiz}"${active('quiz')}>${L.quiz} <span class="tag">2 min</span></a>
  <a href="${P.journal}"${active('journal')}>${L.journal} <span class="tag">82</span></a>
  <a href="${P.founder}"${active('founder')}>${L.founder} <span class="tag">${isES?'Historia':'Story'}</span></a>
  <div class="v-drawer-lang">
    <a href="${toEN}" class="${isES?'':'on'}">EN</a>
    <a href="${toES}" class="${isES?'on':''}">ES</a>
  </div>
</aside>
`;

  // Inject CSS
  const style = document.createElement('style');
  style.id = 'v-nav-css';
  style.textContent = CSS;
  document.head.appendChild(style);

  // Remove legacy nav/announcement if present
  function removeLegacy(){
    document.querySelectorAll('nav.top, .ann, aside.drawer, .lang-switch, .lang:not(.v-lang)').forEach(el=>{
      // keep elements we just injected
      if(el.classList.contains('v-top') || el.classList.contains('v-ann') || el.classList.contains('v-drawer')) return;
      el.remove();
    });
  }

  // Insert at top of body
  function inject(){
    removeLegacy();
    const wrap = document.createElement('div');
    wrap.id = 'v-nav-root';
    wrap.innerHTML = html;
    document.body.insertBefore(wrap, document.body.firstChild);

    // Drawer wiring
    const drawer = document.getElementById('vDrawer');
    const menu = document.getElementById('vMenu');
    const closeBtn = document.getElementById('vDrawerClose');
    if(menu && drawer){
      menu.addEventListener('click', ()=>{drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false')});
    }
    if(closeBtn && drawer){
      closeBtn.addEventListener('click', ()=>{drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true')});
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
