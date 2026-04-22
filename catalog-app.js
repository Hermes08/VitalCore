(function(){
  let P = window.VESPER_PRODUCTS, C = window.VESPER_CATEGORIES;
  const $ = s => document.querySelector(s);
  const IS_ES = (document.documentElement.lang||'en').toLowerCase().startsWith('es');

  // Merge ES translations into products when lang="es"
  if(IS_ES && window.VESPER_PRODUCTS_ES){
    const TES = window.VESPER_PRODUCTS_ES, FES = window.VESPER_FORM_ES||{}, TAGES = window.VESPER_TAG_ES||{};
    P = P.map(p => {
      const t = TES[p.id];
      if(!t) return p;
      // merge benefits & facts: translate labels, keep amounts/% from EN
      const benefits = (t.benefits && t.benefits.length===p.benefits.length)
        ? t.benefits : p.benefits;
      const facts = (p.facts||[]).map((row, i) => {
        const tr = t.facts && t.facts[i];
        if(!tr) return row;
        return [tr[0]||row[0], row[1]||'', row[2]||''];
      });
      return { ...p, name: t.name||p.name, blurb: t.blurb||p.blurb, benefits, facts,
               form: FES[p.form]||p.form, _rawForm: p.form,
               tag: p.tag && TAGES[p.tag] ? TAGES[p.tag] : p.tag };
    });
    window.VESPER_PRODUCTS = P;
  }
  const T = IS_ES ? {
    formulas:'fórmulas', oneTime:'Única vez', subscribe:'Suscribirse −15%',
    addToCart:'Añadir al carrito →', subAdded:'Suscripción añadida', addedCart:'Añadido al carrito',
    nothing:'Nada aún — elige una fórmula.', remove:'Quitar', subTxt:'Suscripción', onceTxt:'Única vez',
    suppFacts:'Información nutricional', servingSize:'Porción · según indicado',
    ingredient:'Ingrediente', amount:'Cantidad', dv:'% VD',
    open:'Abrir →', formulaLbl:'Fórmula', close:'Cerrar', nothingSearch:'Nada coincide — prueba otra palabra.'
  } : {
    formulas:'formulas', oneTime:'One-time', subscribe:'Subscribe −15%',
    addToCart:'Add to cart →', subAdded:'Subscription added', addedCart:'Added to cart',
    nothing:'Nothing here yet — choose a formula.', remove:'Remove', subTxt:'Subscribe', onceTxt:'One-time',
    suppFacts:'Supplement facts', servingSize:'Serving size · as indicated',
    ingredient:'Ingredient', amount:'Amount', dv:'% DV',
    open:'Open →', formulaLbl:'Formula', close:'Close', nothingSearch:'No formulas match — try a different word.'
  };
  const $$ = s => [...document.querySelectorAll(s)];
  let activeCat = 'all', query = '', activeForm = 'all', activeSort = 'featured',
      cart = JSON.parse(localStorage.getItem('vesperCart')||'[]');

  // Category label translations (ES)
  const CAT_ES = {
    all:'Todas las f\u00f3rmulas', essentials:'Esenciales diarios', vitamins:'Vitaminas',
    minerals:'Minerales', herbs:'Hierbas y bot\u00e1nicos', adaptogens:'Adapt\u00f3genos',
    sleep:'Sue\u00f1o y calma', energy:'Energ\u00eda y enfoque', immune:'Inmunidad',
    digestive:'Digesti\u00f3n y limpieza', joint:'Articulaciones y huesos',
    heart:'Coraz\u00f3n y circulaci\u00f3n', beauty:'Cabello, piel y u\u00f1as',
    weight:'Metabolismo y peso', mens:'Hombres', womens:'Mujeres',
    sport:'Deporte y prote\u00edna', gummies:'Gomitas', kids:'Ni\u00f1os'
  };
  const catLbl = c => IS_ES && CAT_ES[c.id] ? CAT_ES[c.id] : c.label;

  // Build category chips
  const catsEl = $('#cats');
  C.forEach(c => {
    const b = document.createElement('button');
    b.textContent = catLbl(c);
    b.dataset.cat = c.id;
    if(c.id==='all') b.classList.add('on');
    b.onclick = () => { activeCat = c.id; $$('#cats button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); render(); };
    catsEl.appendChild(b);
  });

  function filtered(){
    let list = P.filter(p => {
      if(activeCat!=='all' && p.category!==activeCat) return false;
      if(activeForm!=='all' && (p._rawForm||p.form)!==activeForm) return false;
      if(query){
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q) || (p.benefits||[]).some(b=>b.join(' ').toLowerCase().includes(q));
      }
      return true;
    });
    // Sort
    if(activeSort==='price-asc'){
      list = [...list].sort((a,b)=>a.price-b.price);
    } else if(activeSort==='price-desc'){
      list = [...list].sort((a,b)=>b.price-a.price);
    } else if(activeSort==='az'){
      list = [...list].sort((a,b)=>a.name.localeCompare(b.name));
    }
    return list;
  }

  function groupByCategory(list){
    const groups = {};
    list.forEach(p => { (groups[p.category] = groups[p.category]||[]).push(p); });
    return groups;
  }

  function catLabel(id){ const c=C.find(x=>x.id===id)||{label:id}; return catLbl(c); }

  function render(){
    const list = filtered();
    $('#totalN').textContent = P.length;
    $('#shownN').textContent = list.length;
    const root = $('#catalog');
    root.innerHTML = '';
    const flatView = activeCat !== 'all' || activeSort !== 'featured' || activeForm !== 'all' || query;
    if(!flatView){
      const groups = groupByCategory(list);
      let n = 1;
      C.slice(1).forEach(c => {
        if(!groups[c.id]) return;
        const label = document.createElement('div');
        label.className = 'section-label';
        label.innerHTML = `<span class="n">§ ${String(n).padStart(2,'0')}</span><h3>${catLbl(c)}</h3><span class="line"></span><span>${groups[c.id].length} ${T.formulas}</span>`;
        root.appendChild(label);
        const grid = document.createElement('div');
        grid.className = 'grid';
        groups[c.id].forEach((p,i) => grid.appendChild(cardEl(p, i)));
        root.appendChild(grid);
        n++;
      });
      if(list.length===0) root.innerHTML = emptyState();
    } else {
      // Flat view label — combine the active category + form filter + sort in a single header
      const parts = [];
      if(activeCat !== 'all') parts.push(catLabel(activeCat));
      if(activeForm !== 'all'){
        const F = IS_ES ? (window.VESPER_FORM_ES||{})[activeForm] : activeForm;
        parts.push((F||activeForm).replace(/^./,c=>c.toUpperCase()));
      }
      if(query) parts.push(`"${query}"`);
      const headTitle = parts.length ? parts.join(' · ') : (IS_ES ? 'Todas las fórmulas' : 'All formulas');
      const label = document.createElement('div');
      label.className = 'section-label';
      label.innerHTML = `<span class="n">§ 01</span><h3>${headTitle}</h3><span class="line"></span><span>${list.length} ${T.formulas}</span>`;
      root.appendChild(label);
      if(list.length===0){ root.innerHTML += emptyState(); return; }
      const grid = document.createElement('div');
      grid.className = 'grid';
      list.forEach((p,i) => grid.appendChild(cardEl(p, i)));
      root.appendChild(grid);
    }
  }

  function emptyState(){
    return `<div style="padding:120px 36px;text-align:center;font-family:var(--serif);font-style:italic;font-size:28px;color:var(--muted)">${T.nothingSearch}</div>`;
  }

  // Form-specific visuals — each supplement form renders differently
  function formVisual(form, size){
    const s = size || 'sm'; // 'sm' | 'lg'
    switch(form){
      case 'capsule':
        return `<div class="shape-pill ${s}"><div class="half"></div><div class="half"></div><div class="seam"></div></div>`;
      case 'softgel':
        return `<div class="shape-softgel ${s}"></div>`;
      case 'tablet':
        return `<div class="shape-tablet ${s}"><div class="score"></div></div>`;
      case 'sublingual':
        return `<div class="shape-tablet ${s} thin"><div class="score"></div></div>`;
      case 'gummy':
        return `<div class="shape-gummy ${s}">
          <div class="g g1"></div><div class="g g2"></div><div class="g g3"></div>
        </div>`;
      case 'powder':
        return `<div class="shape-powder ${s}">
          <div class="scoop"></div>
          <div class="mound"></div>
        </div>`;
      case 'packet':
        return `<div class="shape-packet ${s}">
          <div class="seal"></div>
          <div class="notch"></div>
          <div class="logo">VSPR</div>
        </div>`;
      case 'tincture':
      case 'liquid':
        return `<div class="shape-tincture ${s}">
          <div class="dropper"></div>
          <div class="bottle"><div class="fill"></div><div class="label">VSPR</div></div>
        </div>`;
      default:
        return `<div class="shape-pill ${s}"><div class="half"></div><div class="half"></div><div class="seam"></div></div>`;
    }
  }

  function cardEl(p, i){
    const d = document.createElement('div');
    d.className = 'card';
    d.dataset.form = p.form;
    d.style.setProperty('--c1', p.c1); d.style.setProperty('--c2', p.c2);
    d.style.setProperty('--c3', p.c3); d.style.setProperty('--c4', p.c4);
    d.style.setProperty('--d', (i * 0.17 % 5) + 's');
    d.onclick = (e) => {
      d.classList.add('popping');
      setTimeout(()=>d.classList.remove('popping'), 900);
      setTimeout(()=>openModal(p), 260);
    };
    const tagHtml = p.tag ? `<span class="tag ${p.tag==='new'?'sage':p.tag==='flagship'?'ochre':''}">${p.tag}</span>` : '';
    d.innerHTML = `
      <div class="topline">
        <span class="idx">N° ${String(i+1).padStart(3,'0')} — ${p.form}</span>
        ${tagHtml}
      </div>
      <div class="orb-wrap">
        <div class="orb" style="background:radial-gradient(circle at 40% 40%,${p.c1} 0%,${p.c2} 45%,transparent 75%)"></div>
        <div class="halo-ring"></div>
        ${formVisual(p._rawForm||p.form, 'sm')}
      </div>
      <div>
        <div class="latin">${p.dose}</div>
        <div class="name">${p.name}</div>
      </div>
      <div class="foot">
        <span class="price"><span class="cur">$</span>${p.price}</span>
        <span class="buy">${T.open}</span>
      </div>`;
    return d;
  }

  // Modal
  const overlay = $('#overlay'), modal = $('#modal');
  let currentProduct = null, currentSub = 'once';

  function openModal(p){
    currentProduct = p; currentSub = 'once';
    modal.style.setProperty('--c1', p.c1); modal.style.setProperty('--c2', p.c2);
    modal.style.setProperty('--c3', p.c3); modal.style.setProperty('--c4', p.c4);
    const benefits = (p.benefits||[]).map(b => `<div class="b"><span class="k">${b[0]}</span><span class="v">${b[1]}</span></div>`).join('');
    const facts = (p.facts||[]).map(r => `<div class="row"><span class="a">${r[0]}</span><span class="a">${r[1]||''}</span><span class="b">${r[2]||''}</span></div>`).join('');
    modal.innerHTML = `
      <button class="close" onclick="window.__closeModal()">${T.close}</button>
      <div class="header">
        <div class="idx">${T.formulaLbl} — ${catLabel(p.category)} · ${p.form}</div>
        <h2>${p.name}</h2>
        <div class="latin">${p.dose} · ${p.form}</div>
      </div>
      <div class="vis">
        <span class="vis-label">VSPR — ${p.id.toUpperCase()}</span>
        <span class="vis-label-r">${p.dose} · ${p.form}</span>
        <div class="big-orb" style="background:radial-gradient(circle at 40% 40%,${p.c1} 0%,${p.c2} 45%,transparent 75%)"></div>
        <div class="ring-2"></div>
        <div class="ring-1"></div>
        ${formVisual(p._rawForm||p.form, 'lg')}
      </div>
      <div class="body">
        <p class="desc">${p.blurb}</p>
        <div class="benefits">${benefits}</div>
        <div class="facts">
          <div class="t">${T.suppFacts}</div>
          <div class="serving">${T.servingSize}</div>
          <div class="head"><span>${T.ingredient}</span><span>${T.amount}</span><span>${T.dv}</span></div>
          ${facts}
        </div>
      </div>
      <div class="cta-bar">
        <div class="price-block">
          <div class="price-num" id="pNum"><span class="cur">$</span>${p.price}</div>
        </div>
        <div class="sub-choose">
          <button data-sub="once" class="on">${T.oneTime}</button>
          <button data-sub="sub">${T.subscribe}</button>
        </div>
        <button class="add" onclick="window.__addToCart('${p.id}')">${T.addToCart}</button>
      </div>`;
    modal.querySelectorAll('.sub-choose button').forEach(btn=>{
      btn.onclick = () => {
        modal.querySelectorAll('.sub-choose button').forEach(x=>x.classList.remove('on'));
        btn.classList.add('on');
        currentSub = btn.dataset.sub;
        const newP = currentSub==='sub' ? (p.price*0.85).toFixed(0) : p.price;
        $('#pNum').innerHTML = `<span class="cur">$</span>${newP}`;
      };
    });
    overlay.classList.add('show');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  window.__closeModal = () => {
    overlay.classList.remove('show');
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };
  overlay.onclick = window.__closeModal;
  document.addEventListener('keydown', e => { if(e.key==='Escape'){ window.__closeModal(); closeCart(); } });

  // Cart
  window.__addToCart = (id) => {
    const p = P.find(x=>x.id===id);
    const price = currentSub==='sub' ? Math.round(p.price*0.85) : p.price;
    const existing = cart.find(x=>x.id===id && x.sub===currentSub);
    if(existing) existing.qty += 1;
    else cart.push({ id, qty:1, sub: currentSub, price });
    saveCart();
    toast(currentSub==='sub' ? T.subAdded : T.addedCart);
    window.__closeModal();
    setTimeout(openCart, 400);
  };

  function saveCart(){
    localStorage.setItem('vesperCart', JSON.stringify(cart));
    renderCart();
  }

  function renderCart(){
    $('#cartCount').textContent = cart.reduce((a,b)=>a+b.qty, 0);
    const items = $('#cartItems');
    if(cart.length===0){
      items.innerHTML = `<div class="cart-empty">${T.nothing}</div>`;
      $('#cartTotal').textContent = '$0';
      return;
    }
    items.innerHTML = cart.map((it,idx) => {
      const p = P.find(x=>x.id===it.id);
      if(!p) return '';
      return `
        <div class="cart-item" style="--c1:${p.c1};--c2:${p.c2};--c3:${p.c3};--c4:${p.c4}">
          <div class="mini-pill"><div class="half"></div><div class="half"></div></div>
          <div class="info">
            <div class="n">${p.name}</div>
            <div class="q">
              <button onclick="window.__cartQty(${idx},-1)">−</button>
              <span>${it.qty}</span>
              <button onclick="window.__cartQty(${idx},1)">+</button>
              <span style="margin-left:10px">${it.sub==='sub'?T.subTxt:T.onceTxt}</span>
              <button style="margin-left:auto" onclick="window.__cartRemove(${idx})">${T.remove}</button>
            </div>
          </div>
          <div class="amt">$${it.price * it.qty}</div>
        </div>`;
    }).join('');
    const total = cart.reduce((a,b)=>a + b.price*b.qty, 0);
    $('#cartTotal').textContent = '$' + total;
  }

  window.__cartQty = (i, delta) => {
    cart[i].qty += delta;
    if(cart[i].qty <= 0) cart.splice(i,1);
    saveCart();
  };
  window.__cartRemove = (i) => { cart.splice(i,1); saveCart(); };

  const cartEl = $('#cart');
  function openCart(){ cartEl.classList.add('show'); overlay.classList.add('show'); }
  function closeCart(){ cartEl.classList.remove('show'); overlay.classList.remove('show'); }
  if($('#openCart')) $('#openCart').onclick = openCart;
  if($('#closeCart')) $('#closeCart').onclick = closeCart;
  if($('.checkout')) $('.checkout').onclick = () => toast(IS_ES?'Redirigiendo al pago seguro…':'Redirecting to secure checkout…');

  function toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._tt);
    window._tt = setTimeout(()=>t.classList.remove('show'), 2400);
  }

  // Search
  $('#q').oninput = (e) => { query = e.target.value; render(); };

  // Form + sort dropdowns
  const formSel = $('#formSel'), sortSel = $('#sortSel');
  if(formSel){
    if(IS_ES){
      const FES = window.VESPER_FORM_ES || {};
      [...formSel.options].forEach(opt=>{
        if(opt.value==='all'){ opt.textContent = 'Cualquier forma'; return; }
        const es = FES[opt.value];
        if(es) opt.textContent = es.charAt(0).toUpperCase() + es.slice(1);
      });
      const flabel = formSel.parentElement && formSel.parentElement.querySelector('.dl');
      if(flabel) flabel.textContent = 'Forma';
    }
    formSel.onchange = e => { activeForm = e.target.value; render(); };
  }
  if(sortSel){
    if(IS_ES){
      const map = {featured:'Destacados','price-asc':'Precio ↑','price-desc':'Precio ↓','az':'A–Z'};
      [...sortSel.options].forEach(opt => { if(map[opt.value]) opt.textContent = map[opt.value]; });
      const slabel = sortSel.parentElement && sortSel.parentElement.querySelector('.dl');
      if(slabel) slabel.textContent = 'Orden';
    }
    sortSel.onchange = e => { activeSort = e.target.value; render(); };
  }

  // Translate search placeholder + count label for ES
  if(IS_ES){
    const qi = $('#q'); if(qi) qi.placeholder = 'Magnesio, sueño, ashwagandha…';
    const countEl = document.querySelector('.controls .count');
    if(countEl) countEl.lastChild.textContent = ' mostradas';
  }

  render();
  renderCart();

  // Auto-open cart drawer if arriving with ?cart=1
  if(typeof window !== 'undefined' && window.location.search.indexOf('cart=1') !== -1){
    setTimeout(openCart, 120);
  }

  // Deep-link to a specific product via #id (from quiz "View details →")
  if(window.location.hash && window.location.hash.length > 1){
    const id = window.location.hash.slice(1);
    const p = P.find(x=>x.id===id);
    if(p) setTimeout(()=>openModal(p), 200);
  }
})();
