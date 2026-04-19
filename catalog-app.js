(function(){
  const P = window.VESPER_PRODUCTS, C = window.VESPER_CATEGORIES;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let activeCat = 'all', query = '', cart = JSON.parse(localStorage.getItem('vesperCart')||'[]');

  // Build category chips
  const catsEl = $('#cats');
  C.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c.label;
    b.dataset.cat = c.id;
    if(c.id==='all') b.classList.add('on');
    b.onclick = () => { activeCat = c.id; $$('#cats button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); render(); };
    catsEl.appendChild(b);
  });

  function filtered(){
    return P.filter(p => {
      if(activeCat!=='all' && p.category!==activeCat) return false;
      if(query){
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q) || (p.benefits||[]).some(b=>b.join(' ').toLowerCase().includes(q));
      }
      return true;
    });
  }

  function groupByCategory(list){
    const groups = {};
    list.forEach(p => { (groups[p.category] = groups[p.category]||[]).push(p); });
    return groups;
  }

  function catLabel(id){ return (C.find(c=>c.id===id)||{}).label || id; }

  function render(){
    const list = filtered();
    $('#totalN').textContent = P.length;
    $('#shownN').textContent = list.length;
    const root = $('#catalog');
    root.innerHTML = '';
    if(activeCat === 'all'){
      const groups = groupByCategory(list);
      let n = 1;
      C.slice(1).forEach(c => {
        if(!groups[c.id]) return;
        const label = document.createElement('div');
        label.className = 'section-label';
        label.innerHTML = `<span class="n">§ ${String(n).padStart(2,'0')}</span><h3>${c.label}</h3><span class="line"></span><span>${groups[c.id].length} formulas</span>`;
        root.appendChild(label);
        const grid = document.createElement('div');
        grid.className = 'grid';
        groups[c.id].forEach((p,i) => grid.appendChild(cardEl(p, i)));
        root.appendChild(grid);
        n++;
      });
      if(list.length===0) root.innerHTML = emptyState();
    } else {
      const label = document.createElement('div');
      label.className = 'section-label';
      label.innerHTML = `<span class="n">§ 01</span><h3>${catLabel(activeCat)}</h3><span class="line"></span><span>${list.length} formulas</span>`;
      root.appendChild(label);
      if(list.length===0){ root.innerHTML += emptyState(); return; }
      const grid = document.createElement('div');
      grid.className = 'grid';
      list.forEach((p,i) => grid.appendChild(cardEl(p, i)));
      root.appendChild(grid);
    }
  }

  function emptyState(){
    return `<div style="padding:120px 36px;text-align:center;font-family:var(--serif);font-style:italic;font-size:28px;color:var(--muted)">No formulas match — try a different word.</div>`;
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
        ${formVisual(p.form, 'sm')}
      </div>
      <div>
        <div class="latin">${p.dose}</div>
        <div class="name">${p.name}</div>
      </div>
      <div class="foot">
        <span class="price"><span class="cur">$</span>${p.price}</span>
        <span class="buy">Open →</span>
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
      <button class="close" onclick="window.__closeModal()">Close</button>
      <div class="header">
        <div class="idx">Formula — ${catLabel(p.category)} · ${p.form}</div>
        <h2>${p.name}</h2>
        <div class="latin">${p.dose} · ${p.form}</div>
      </div>
      <div class="vis">
        <span class="vis-label">VSPR — ${p.id.toUpperCase()}</span>
        <span class="vis-label-r">${p.dose} · ${p.form}</span>
        <div class="big-orb" style="background:radial-gradient(circle at 40% 40%,${p.c1} 0%,${p.c2} 45%,transparent 75%)"></div>
        <div class="ring-2"></div>
        <div class="ring-1"></div>
        ${formVisual(p.form, 'lg')}
      </div>
      <div class="body">
        <p class="desc">${p.blurb}</p>
        <div class="benefits">${benefits}</div>
        <div class="facts">
          <div class="t">Supplement facts</div>
          <div class="serving">Serving size · as indicated</div>
          <div class="head"><span>Ingredient</span><span>Amount</span><span>% DV</span></div>
          ${facts}
        </div>
      </div>
      <div class="cta-bar">
        <div class="price-block">
          <div class="price-num" id="pNum"><span class="cur">$</span>${p.price}</div>
          <div class="sub-choose">
            <button data-sub="once" class="on">One-time</button>
            <button data-sub="sub">Subscribe −15%</button>
          </div>
        </div>
        <div></div>
        <button class="add" onclick="window.__addToCart('${p.id}')">Add to cart →</button>
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
    toast(currentSub==='sub' ? 'Subscription added' : 'Added to cart');
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
      items.innerHTML = `<div class="cart-empty">Nothing here yet — choose a formula.</div>`;
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
              <span style="margin-left:10px">${it.sub==='sub'?'Subscribe':'One-time'}</span>
              <button style="margin-left:auto" onclick="window.__cartRemove(${idx})">Remove</button>
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
  $('#openCart').onclick = openCart;
  $('#closeCart').onclick = closeCart;
  $('.checkout').onclick = () => toast('Redirecting to secure checkout…');

  function toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._tt);
    window._tt = setTimeout(()=>t.classList.remove('show'), 2400);
  }

  // Search
  $('#q').oninput = (e) => { query = e.target.value; render(); };

  render();
  renderCart();
})();
