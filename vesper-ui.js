/* ===== VESPER — UI interactions ==================================== */

(() => {
  // FAQ accordion
  document.querySelectorAll('.faq .item').forEach(item=>{
    item.addEventListener('click', ()=>{
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq .item').forEach(i=>i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Selector — switch palette based on variant
  const palettes = ['terracotta','ochre','sage','plum'];
  document.querySelectorAll('#picker .opt').forEach(opt=>{
    opt.addEventListener('mouseenter', ()=>{
      const i = parseInt(opt.dataset.variant,10);
      document.querySelectorAll('#picker .opt').forEach(o=>o.classList.remove('active'));
      opt.classList.add('active');
      if (window.__vesper) window.__vesper.setPalette(palettes[i]);
    });
  });

  // Progress rail clicks
  document.querySelectorAll('.progress-rail .tick').forEach((t,i)=>{
    t.addEventListener('click', ()=>{
      const sec = document.querySelectorAll('[data-sec]')[i];
      if (sec) window.scrollTo({top: sec.offsetTop, behavior:'smooth'});
    });
  });

  // Smooth anchor scroll in top nav
  document.querySelectorAll('nav.top a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (el){ e.preventDefault(); window.scrollTo({top: el.offsetTop, behavior:'smooth'}); }
    });
  });

  /* ===== Tweaks protocol ===== */
  const panel = document.getElementById('tweaks');

  function applyDefaults(d){
    if (window.__vesper){
      window.__vesper.setPalette(d.palette);
      window.__vesper.setSurface(d.surface);
      window.__vesper.setParticles(d.particles);
      window.__vesper.setGrain(d.grain);
      window.__vesper.setDark(d.dark);
    }
    // sync UI
    document.querySelectorAll('#sw .sw').forEach(s=>s.classList.toggle('on', s.dataset.p===d.palette));
    document.getElementById('surface').value = d.surface;
    document.getElementById('particles').value = d.particles;
    document.getElementById('grain').value = d.grain;
    document.getElementById('darkmode').checked = !!d.dark;
  }

  // apply initial defaults
  const defaults = (typeof TWEAK_DEFAULTS !== 'undefined') ? TWEAK_DEFAULTS : {};
  // small delay to ensure __vesper exists
  requestAnimationFrame(()=> applyDefaults(defaults));

  function pushEdit(k,v){
    try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[k]:v}}, '*'); }catch(e){}
  }

  // Register listener BEFORE announcing availability
  window.addEventListener('message', (e)=>{
    const d = e.data || {};
    if (d.type === '__activate_edit_mode') panel.classList.add('show');
    else if (d.type === '__deactivate_edit_mode') panel.classList.remove('show');
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'}, '*'); }catch(e){}

  // Wire tweak controls
  document.querySelectorAll('#sw .sw').forEach(s=>{
    s.addEventListener('click', ()=>{
      document.querySelectorAll('#sw .sw').forEach(x=>x.classList.remove('on'));
      s.classList.add('on');
      const p = s.dataset.p;
      window.__vesper.setPalette(p);
      pushEdit('palette', p);
    });
  });
  document.getElementById('surface').addEventListener('change', (e)=>{
    window.__vesper.setSurface(e.target.value);
    pushEdit('surface', e.target.value);
  });
  document.getElementById('particles').addEventListener('input', (e)=>{
    // debounce rebuild
    clearTimeout(window.__pt);
    window.__pt = setTimeout(()=>{
      window.__vesper.setParticles(e.target.value);
      pushEdit('particles', parseInt(e.target.value,10));
    }, 120);
  });
  document.getElementById('grain').addEventListener('input', (e)=>{
    window.__vesper.setGrain(e.target.value);
    pushEdit('grain', parseInt(e.target.value,10));
  });
  document.getElementById('darkmode').addEventListener('change', (e)=>{
    window.__vesper.setDark(e.target.checked);
    pushEdit('dark', e.target.checked);
  });

})();
