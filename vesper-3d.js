/* ===== VESPER — 3D scene ===========================================
   One persistent scene with a cinematic camera that flies between
   section "anchors" driven by scroll. Hero capsule uses a custom
   liquid shader; particle field drifts and reacts to pointer.
==================================================================== */

(() => {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe9dfd0, 8, 28);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  /* ---- Lights — warm key, cool fill ---- */
  const key = new THREE.DirectionalLight(0xffe7c4, 2.3);
  key.position.set(3, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9bb0c7, 0.9);
  fill.position.set(-4, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xc4622d, 1.4);
  rim.position.set(-2,-3,-4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  /* ================================================================
     LIQUID SHADER — a sphere with animated internal "plasma"
  ================================================================ */
  const liquidUniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#f3c27a') }, // warm light
    uColorB: { value: new THREE.Color('#c4622d') }, // terracotta
    uColorC: { value: new THREE.Color('#6b2a10') }, // deep
    uMix:   { value: 0.5 },
    uScroll:{ value: 0 },
  };

  const liquidVertex = /* glsl */`
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScroll;
    // simplex-like noise (cheap)
    float hash(vec3 p){ return fract(sin(dot(p,vec3(17.13,31.77,7.91)))*43758.55); }
    float noise(vec3 p){
      vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                     mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                     mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    void main(){
      vUv = uv;
      vec3 p = position;
      float t = uTime*0.35;
      float n = noise(p*1.6 + vec3(t, t*0.7, -t*0.5));
      float n2= noise(p*3.2 + vec3(-t*0.8, t*0.3, t));
      float displace = (n-0.5)*0.18 + (n2-0.5)*0.06;
      displace *= (1.0 + uScroll*0.6);
      p += normal * displace;
      vPos = p;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
  `;

  const liquidFragment = /* glsl */`
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uMix;
    float hash(vec3 p){ return fract(sin(dot(p,vec3(17.13,31.77,7.91)))*43758.55); }
    float noise(vec3 p){
      vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                     mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                     mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    void main(){
      float t = uTime*0.22;
      float n = noise(vPos*1.8 + vec3(t, -t*0.5, t*0.7));
      float n2= noise(vPos*4.0 + vec3(-t, t*1.3, -t*0.4));
      float veins = smoothstep(0.45, 0.62, n*0.7 + n2*0.3);
      vec3 col = mix(uColorC, uColorB, n);
      col = mix(col, uColorA, veins);
      // fresnel rim
      vec3 V = normalize(-vPos);
      float fres = pow(1.0 - max(dot(normalize(vNormal), V),0.0), 2.2);
      col += fres * uColorA * 0.9;
      // subtle glow core
      float core = smoothstep(0.9, 0.0, length(vPos));
      col += core * uColorA * 0.15;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  /* ---- Hero capsule — a pill made from two hemispheres + cylinder ---- */
  const capsuleGroup = new THREE.Group();
  scene.add(capsuleGroup);

  // Outer glass shell
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xe9dfd0, transmission: 0.92, thickness: 0.45,
    roughness: 0.12, metalness: 0.0, ior: 1.42, attenuationDistance: 1.5,
    attenuationColor: new THREE.Color('#f0cfa0'), clearcoat: 1, clearcoatRoughness: 0.2,
    transparent:true, opacity: 0.95
  });
  const shellGeom = new THREE.CapsuleGeometry(0.55, 1.1, 24, 48);
  const shell = new THREE.Mesh(shellGeom, shellMat);
  capsuleGroup.add(shell);

  // Inner liquid — slightly smaller capsule with shader
  const liquidMat = new THREE.ShaderMaterial({
    uniforms: liquidUniforms, vertexShader: liquidVertex, fragmentShader: liquidFragment,
  });
  const liquidGeom = new THREE.CapsuleGeometry(0.48, 1.05, 28, 56);
  const liquid = new THREE.Mesh(liquidGeom, liquidMat);
  capsuleGroup.add(liquid);

  // Seam line (two-tone pill)
  const seamMat = new THREE.MeshStandardMaterial({ color:0x2a1f16, roughness:0.3, metalness:0.1 });
  const seamGeom = new THREE.TorusGeometry(0.551, 0.008, 8, 64);
  const seam = new THREE.Mesh(seamGeom, seamMat);
  seam.rotation.x = Math.PI/2;
  capsuleGroup.add(seam);

  // Halo disc behind capsule
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xc4622d, transparent:true, opacity:0.08, side:THREE.DoubleSide
  });
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.9, 64), haloMat);
  halo.position.z = -1.2;
  capsuleGroup.add(halo);

  capsuleGroup.rotation.z = 0.18;
  capsuleGroup.position.set(0, 0, 0);

  /* ================================================================
     ORBIT CLUSTER — four small capsules around a center (variant picker)
  ================================================================ */
  const orbitGroup = new THREE.Group();
  orbitGroup.visible = false;
  scene.add(orbitGroup);

  const variantColors = [
    ['#c4622d','#f3c27a','#6b2a10'], // For Her — terracotta
    ['#4a6a7a','#a8c4d2','#1f3240'], // For Him — slate blue
    ['#c89b4a','#f1d58c','#6b4a14'], // Later Years — ochre
    ['#7a8a63','#d5e3a8','#2f3a22'], // Prenatal — sage
  ];
  const orbitItems = [];
  for (let i=0;i<4;i++){
    const u = {
      uTime:{value:0},
      uColorA:{value:new THREE.Color(variantColors[i][1])},
      uColorB:{value:new THREE.Color(variantColors[i][0])},
      uColorC:{value:new THREE.Color(variantColors[i][2])},
      uMix:{value:0.5}, uScroll:{value:0}
    };
    const mat = new THREE.ShaderMaterial({ uniforms:u, vertexShader:liquidVertex, fragmentShader:liquidFragment });
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 16, 32), mat);
    const g = new THREE.Group();
    g.add(m);
    const angle = (i/4)*Math.PI*2;
    g.userData = { baseAngle: angle, mesh:m, uniforms:u };
    g.position.set(Math.cos(angle)*1.6, Math.sin(angle)*1.0, 0);
    orbitGroup.add(g);
    orbitItems.push(g);
  }

  /* ================================================================
     INGREDIENT GRID — 12 small spheres tiled in a wide plane behind grid
  ================================================================ */
  const ingredientGroup = new THREE.Group();
  ingredientGroup.visible = false;
  scene.add(ingredientGroup);

  const ingredientColors = [
    ['#f3c27a','#c4622d'], ['#d5e3a8','#7a8a63'], ['#f1d58c','#c89b4a'],
    ['#e8b4a0','#a0543d'], ['#f0c9a0','#b67a45'], ['#ded3b8','#8c7a55'],
    ['#e6c3c3','#9a4a4a'], ['#c9d9c0','#5a7a55'], ['#f0d09a','#b6864a'],
    ['#dcc2e0','#7a5a8a'], ['#f5dcae','#c99455'], ['#b8c8d9','#3f5a7a'],
  ];
  const ingredientItems = [];
  for (let i=0;i<12;i++){
    const row = Math.floor(i/4), col = i%4;
    const u = {
      uTime:{value:i*0.7},
      uColorA:{value:new THREE.Color(ingredientColors[i][0])},
      uColorB:{value:new THREE.Color(ingredientColors[i][1])},
      uColorC:{value:new THREE.Color('#2a1f16')},
      uMix:{value:0.5}, uScroll:{value:0}
    };
    const mat = new THREE.ShaderMaterial({ uniforms:u, vertexShader:liquidVertex, fragmentShader:liquidFragment });
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 48, 48), mat);
    m.position.set((col-1.5)*1.3, (1-row)*1.3, 0);
    m.userData = { uniforms:u, baseY: m.position.y };
    ingredientGroup.add(m);
    ingredientItems.push(m);
  }

  /* ================================================================
     PARTICLE FIELD — drifting, reactive to pointer
  ================================================================ */
  let particleCount = 1400;
  let particles, particleGeom, particleMat;
  function buildParticles(count){
    if (particles){ scene.remove(particles); particleGeom.dispose(); particleMat.dispose(); }
    particleCount = count;
    particleGeom = new THREE.BufferGeometry();
    const pos = new Float32Array(count*3);
    const seed = new Float32Array(count);
    for (let i=0;i<count;i++){
      const r = 3 + Math.random()*6;
      const t = Math.random()*Math.PI*2;
      const p = (Math.random()-0.5)*Math.PI*0.9;
      pos[i*3+0] = Math.cos(t)*Math.cos(p)*r;
      pos[i*3+1] = Math.sin(p)*r*0.7;
      pos[i*3+2] = Math.sin(t)*Math.cos(p)*r - 2;
      seed[i] = Math.random();
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particleGeom.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    particleMat = new THREE.ShaderMaterial({
      uniforms:{
        uTime:{value:0},
        uPointer:{value:new THREE.Vector2()},
        uColor:{value:new THREE.Color('#c4622d')},
        uSize:{value: renderer.getPixelRatio() * 1.4 }
      },
      transparent:true, depthWrite:false,
      blending: THREE.NormalBlending,
      vertexShader:`
        attribute float seed;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uSize;
        varying float vSeed;
        varying float vAlpha;
        void main(){
          vSeed = seed;
          vec3 p = position;
          float t = uTime*0.15;
          p.x += sin(t + seed*6.28)*0.4;
          p.y += cos(t*1.1 + seed*6.28)*0.3;
          p.z += sin(t*0.8 + seed*12.0)*0.3;
          // parallax to pointer
          p.xy += uPointer*0.6*(0.3+seed*0.7);
          vec4 mv = modelViewMatrix * vec4(p,1.0);
          gl_PointSize = uSize * (40.0/ -mv.z) * (0.5 + seed*1.2);
          gl_Position = projectionMatrix * mv;
          vAlpha = smoothstep(0.0, 1.0, 1.0 - length(mv.xyz)/18.0);
        }
      `,
      fragmentShader:`
        varying float vSeed;
        varying float vAlpha;
        uniform vec3 uColor;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d) * vAlpha * (0.25 + vSeed*0.6);
          vec3 c = mix(vec3(0.78,0.54,0.32), uColor, vSeed);
          gl_FragColor = vec4(c, a);
        }
      `
    });
    particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);
  }
  buildParticles(particleCount);

  /* ================================================================
     SCROLL-DRIVEN CAMERA — section anchors
  ================================================================ */
  // Anchors: [x, y, z, lookAtX, lookAtY, lookAtZ, capsuleX, capsuleY, capsuleZ, capsuleScale, rotX, rotY]
  const anchors = [
    { cam:[0,0,5.2],   look:[0,0,0],   cap:[1.1, 0.05,0],   rot:[0.1, 0.35, 0.18], scale:1.0, halo:0.08 }, // 0 hero — capsule right
    { cam:[0,0,5.0],   look:[0,0,0],   cap:[-1.4,0.0,0],    rot:[0.1, -0.4, 0.18], scale:0.9, halo:0.05, orbit:true }, // 1 selector — capsule left, orbit ON
    { cam:[0,0,4.2],   look:[0,0,0],   cap:[0,3.5,0],       rot:[0.2, 0.6, 0.18],  scale:0.4, halo:0, ingredients:true, ingY:0 }, // 2 ingredients — grid center
    { cam:[0,0,3.6],   look:[0,0,0],   cap:[2.2,-0.2,-1],   rot:[0.3, -0.6, 0.3],  scale:1.4, halo:0.15 }, // 3 science
    { cam:[0.6,0,5.0], look:[0,0,0],   cap:[-1.8,0.3,-0.5], rot:[0.1, 0.9, -0.2],  scale:0.8, halo:0.05 }, // 4 voices
    { cam:[0,0,4.6],   look:[0,0,0],   cap:[1.5,0.4,0.2],   rot:[-0.1, -0.3, 0.25],scale:1.1, halo:0.1 }, // 5 price
    { cam:[0,0,5.5],   look:[0,0,0],   cap:[-2.2,-0.5,-1],  rot:[0.4, 1.2, 0.18],  scale:0.7, halo:0.03 }, // 6 faq
  ];

  const state = {
    scroll:0, targetScroll:0,
    pointer: new THREE.Vector2(),
    pointerTarget: new THREE.Vector2(),
    currentSec:0,
  };

  // Lerp helpers
  const lerp = (a,b,t)=>a+(b-a)*t;
  function lerpA(arrA, arrB, t){ return arrA.map((v,i)=>lerp(v, arrB[i], t)); }

  function getSectionProgress(){
    // Returns { idx, t } where idx is the current section and t is 0..1 within it
    const sections = document.querySelectorAll('main > section, main > footer');
    const secs = Array.from(document.querySelectorAll('[data-sec]'));
    const y = window.scrollY;
    const vh = window.innerHeight;
    for (let i=0;i<secs.length;i++){
      const el = secs[i];
      const top = el.offsetTop;
      const h = el.offsetHeight;
      if (y + vh*0.3 < top + h){
        const local = (y - top + vh*0.5) / h;
        return { idx: i, t: Math.max(0, Math.min(1, local)) };
      }
    }
    return { idx: anchors.length-1, t: 1 };
  }

  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();

  function updateCamera(){
    const { idx, t } = getSectionProgress();
    const a = anchors[Math.min(idx, anchors.length-1)];
    const b = anchors[Math.min(idx+1, anchors.length-1)];
    const cam = lerpA(a.cam, b.cam, t);
    const look = lerpA(a.look, b.look, t);
    const cap = lerpA(a.cap, b.cap, t);
    const rot = lerpA(a.rot, b.rot, t);
    const scale = lerp(a.scale, b.scale, t);
    const haloOp = lerp(a.halo, b.halo, t);

    // Pointer parallax on camera
    const parX = state.pointer.x * 0.35;
    const parY = state.pointer.y * 0.2;
    camera.position.set(cam[0]+parX, cam[1]+parY, cam[2]);
    camera.lookAt(look[0], look[1], look[2]);

    // Capsule position + rotation
    capsuleGroup.position.set(cap[0], cap[1], cap[2]);
    capsuleGroup.scale.setScalar(scale);
    capsuleGroup.rotation.x = rot[0] + performance.now()*0.00015;
    capsuleGroup.rotation.y = rot[1] + performance.now()*0.00025;
    capsuleGroup.rotation.z = rot[2];
    haloMat.opacity = haloOp;

    // Orbit visible only in selector zone
    orbitGroup.visible = !!(a.orbit || b.orbit);
    if (orbitGroup.visible){
      const orbitOp = (a.orbit?1:0)*(1-t) + (b.orbit?1:0)*t;
      orbitGroup.position.set(1.7, 0, 0);
      orbitGroup.scale.setScalar(orbitOp);
    }

    // Ingredients visible only in ingredient zone
    ingredientGroup.visible = !!(a.ingredients || b.ingredients);
    if (ingredientGroup.visible){
      const ingOp = (a.ingredients?1:0)*(1-t) + (b.ingredients?1:0)*t;
      ingredientGroup.position.set(0, 0, 0);
      ingredientGroup.scale.setScalar(ingOp*0.8);
    }

    // Update UI progress rail
    document.querySelectorAll('.progress-rail .tick').forEach((el,i)=>{
      el.classList.toggle('active', i===idx);
    });
    state.currentSec = idx;

    // Scroll-driven shader displacement
    liquidUniforms.uScroll.value = t;
  }

  /* ================================================================
     EXPLODE — click on capsule to pop it open
  ================================================================ */
  const raycaster = new THREE.Raycaster();
  const mouseN = new THREE.Vector2();
  let exploding = 0;
  window.addEventListener('click', (e)=>{
    mouseN.x = (e.clientX/window.innerWidth)*2-1;
    mouseN.y = -(e.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(mouseN, camera);
    const hits = raycaster.intersectObjects([shell, liquid]);
    if (hits.length){ exploding = 1; }
  });

  /* ================================================================
     INPUTS
  ================================================================ */
  window.addEventListener('pointermove', (e)=>{
    state.pointerTarget.x = (e.clientX/window.innerWidth)*2-1;
    state.pointerTarget.y = -(e.clientY/window.innerHeight)*2+1;
  });

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  /* ================================================================
     API for UI / Tweaks
  ================================================================ */
  window.__vesper = {
    setPalette(name){
      const sets = {
        terracotta:['#f3c27a','#c4622d','#6b2a10','#c4622d'],
        sage:      ['#d5e3a8','#7a8a63','#2f3a22','#7a8a63'],
        ochre:     ['#f1d58c','#c89b4a','#6b4a14','#c89b4a'],
        plum:      ['#e4c0dc','#7a4a6a','#2a1430','#7a4a6a'],
      };
      const s = sets[name] || sets.terracotta;
      liquidUniforms.uColorA.value = new THREE.Color(s[0]);
      liquidUniforms.uColorB.value = new THREE.Color(s[1]);
      liquidUniforms.uColorC.value = new THREE.Color(s[2]);
      particleMat.uniforms.uColor.value = new THREE.Color(s[3]);
      rim.color = new THREE.Color(s[1]);
      haloMat.color = new THREE.Color(s[1]);
      document.documentElement.style.setProperty('--accent', s[1]);
    },
    setSurface(kind){
      if (kind==='glass'){
        shell.material = new THREE.MeshPhysicalMaterial({
          color:0xffffff, transmission:1, thickness:0.5, roughness:0.35,
          metalness:0, ior:1.5, transparent:true, opacity:0.8, clearcoat:1
        });
        liquid.visible = false;
      } else if (kind==='chrome'){
        shell.material = new THREE.MeshPhysicalMaterial({
          color:0xcfc3b0, metalness:1, roughness:0.15, clearcoat:1, envMapIntensity:1.3
        });
        liquid.visible = false;
      } else {
        shell.material = shellMat;
        liquid.visible = true;
      }
    },
    setParticles(n){ buildParticles(parseInt(n,10)); },
    setGrain(v){ document.body.style.setProperty('--grain', v); document.querySelector('body').style.setProperty('opacity-grain', v/100); document.styleSheets[0]; const grainEl = document.querySelector('body'); grainEl.dataset.grain=v; document.styleSheets; /* just update CSS var */ document.documentElement.style.setProperty('--grain-op', v/100); const s = document.createElement('style'); s.id='__grain'; document.getElementById('__grain')?.remove(); s.innerHTML = `body::before{opacity:${v/100}}`; s.id='__grain'; document.head.appendChild(s); },
    setDark(on){
      if (on){
        document.documentElement.style.setProperty('--bg', '#1a140e');
        document.documentElement.style.setProperty('--bg-deep','#2a1f16');
        document.documentElement.style.setProperty('--ink', '#e9dfd0');
        document.documentElement.style.setProperty('--ink-2','#c9b89f');
        document.documentElement.style.setProperty('--muted','#8a7a63');
        document.documentElement.style.setProperty('--line','rgba(233,223,208,.14)');
        scene.fog = new THREE.Fog(0x1a140e, 8, 28);
        renderer.setClearColor(0x1a140e, 0);
      } else {
        document.documentElement.style.setProperty('--bg','#e9dfd0');
        document.documentElement.style.setProperty('--bg-deep','#d9c9b3');
        document.documentElement.style.setProperty('--ink','#2a1f16');
        document.documentElement.style.setProperty('--ink-2','#4a382a');
        document.documentElement.style.setProperty('--muted','#7a6553');
        document.documentElement.style.setProperty('--line','rgba(42,31,22,.18)');
        scene.fog = new THREE.Fog(0xe9dfd0, 8, 28);
        renderer.setClearColor(0xe9dfd0, 0);
      }
    }
  };

  /* ================================================================
     ANIMATE
  ================================================================ */
  const clock = new THREE.Clock();
  function tick(){
    const dt = clock.getDelta();
    const elapsed = clock.elapsedTime;

    // pointer smooth
    state.pointer.x = lerp(state.pointer.x, state.pointerTarget.x, 0.06);
    state.pointer.y = lerp(state.pointer.y, state.pointerTarget.y, 0.06);

    // explode envelope
    if (exploding > 0){
      exploding += dt * 1.6;
      if (exploding > 2.2) exploding = 0;
      const pulse = Math.sin(Math.min(exploding,2.2)*Math.PI*0.5);
      capsuleGroup.scale.multiplyScalar(1 + pulse*0.02);
    }

    // shader time
    liquidUniforms.uTime.value = elapsed;
    orbitItems.forEach((g,i)=>{
      g.userData.uniforms.uTime.value = elapsed + i*0.5;
      const a = g.userData.baseAngle + elapsed*0.2;
      g.position.set(Math.cos(a)*1.4, Math.sin(a)*0.8, Math.cos(a*0.5)*0.3);
      g.rotation.z = a*0.7;
    });
    ingredientItems.forEach((m,i)=>{
      m.userData.uniforms.uTime.value = elapsed + i*0.3;
      m.position.y = m.userData.baseY + Math.sin(elapsed*0.8 + i)*0.08;
      m.rotation.y = elapsed*0.2 + i;
    });

    // particles
    particleMat.uniforms.uTime.value = elapsed;
    particleMat.uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);

    updateCamera();

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

})();
