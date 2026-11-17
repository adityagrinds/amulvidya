/* =========================================================
   Amul Vidya — 3D background scene (Three.js r128)
   Floating books, graduation cap, atom, crystal & gold dust.
   Reacts to mouse + scroll.
   ========================================================= */
(function () {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("bg3d");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070b1a, 14, 34);
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  // ---------- Lights ----------
  scene.add(new THREE.AmbientLight(0x8890c0, 0.55));
  const key = new THREE.DirectionalLight(0xffd27a, 1.25);
  key.position.set(5, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(0x3de0c5, 1.4, 30);
  rim.position.set(-8, -3, 4);
  scene.add(rim);
  const warm = new THREE.PointLight(0xff7a3d, 1.1, 30);
  warm.position.set(6, -4, 2);
  scene.add(warm);

  const world = new THREE.Group();
  scene.add(world);

  // ---------- Book factory ----------
  function makeBook(color, w = 1.6, h = 2.2, d = 0.36) {
    const g = new THREE.Group();
    const coverMat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.38 });
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xfbf4e6, roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 0.9, roughness: 0.25, emissive: 0x3a2400 });

    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, h - 0.1, d - 0.08), pageMat);
    pages.position.x = 0.03;
    g.add(pages);

    const front = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), coverMat);
    front.position.z = d / 2;
    const back = front.clone();
    back.position.z = -d / 2;
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d + 0.05), coverMat);
    spine.position.x = -w / 2;
    g.add(front, back, spine);

    // gold emblem + bands
    const emblem = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 12, 40), goldMat);
    emblem.position.set(0.05, 0.25, d / 2 + 0.03);
    const band = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.04, 0.01), goldMat);
    band.position.set(0.05, -0.45, d / 2 + 0.03);
    const band2 = band.clone();
    band2.position.y = -0.6;
    band2.scale.x = 0.6;
    g.add(emblem, band, band2);
    return g;
  }

  const bookDefs = [
    { c: 0x2a2f8a, p: [-8.5, 3.6, -6], r: [0.3, 0.6, -0.2], s: 1.0 },
    { c: 0xc8432b, p: [5.8, 3.0, -3], r: [-0.2, -0.5, 0.3], s: 0.9 },
    { c: 0x168a78, p: [6.4, -2.4, -1], r: [0.4, -0.8, -0.4], s: 1.1 },
    { c: 0x7b3fa0, p: [-7.5, -4.2, -6], r: [-0.4, 0.9, 0.2], s: 0.85 },
    { c: 0xd88a1e, p: [1.5, 4.4, -6], r: [0.2, 0.2, 0.6], s: 0.75 },
    { c: 0x1d5fb8, p: [0.5, -5.2, -5], r: [0.6, -0.3, -0.5], s: 0.8 },
  ];
  const books = bookDefs.slice(0, isMobile ? 4 : 6).map((d, i) => {
    const b = makeBook(d.c);
    b.position.set(...d.p);
    b.rotation.set(...d.r);
    b.scale.setScalar(d.s * (isMobile ? 0.75 : 1));
    b.userData = { base: new THREE.Vector3(...d.p), rot: new THREE.Euler(...d.r), phase: i * 1.3, speed: 0.4 + Math.random() * 0.4 };
    world.add(b);
    return b;
  });
  if (isMobile) {
    books.forEach((b) => { b.userData.base.x *= 0.55; b.position.x = b.userData.base.x; });
  }

  // ---------- Open book (pages fanning) ----------
  const openBook = new THREE.Group();
  const leaf = (side) => {
    const geo = new THREE.PlaneGeometry(1.4, 1.9, 12, 1);
    // curve the page
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + 0.7;
      pos.setZ(i, Math.sin((x / 1.4) * Math.PI) * 0.18);
    }
    geo.computeVertexNormals();
    geo.translate(0.7, 0, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xfbf4e6, roughness: 0.8, side: THREE.DoubleSide }));
    if (side < 0) m.rotation.y = Math.PI;
    return m;
  };
  const coverL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, 0.05), new THREE.MeshStandardMaterial({ color: 0xc8892b, metalness: 0.5, roughness: 0.35 }));
  coverL.geometry.translate(0.75, 0, -0.03);
  const coverR = coverL.clone();
  coverR.rotation.y = Math.PI;
  openBook.add(coverL, coverR, leaf(1), leaf(-1));
  const flipLeaves = [];
  for (let i = 0; i < 4; i++) {
    const l = leaf(1);
    l.position.z = 0.01 * i;
    openBook.add(l);
    flipLeaves.push(l);
  }
  const obY = isMobile ? 4.6 : 0.4;
  openBook.position.set(isMobile ? 1.4 : 3.6, obY, isMobile ? -3 : 1);
  openBook.rotation.set(-0.5, -0.3, 0.1);
  openBook.scale.setScalar(isMobile ? 0.8 : 1.25);
  world.add(openBook);

  // ---------- Graduation cap ----------
  const cap = new THREE.Group();
  const capMat = new THREE.MeshStandardMaterial({ color: 0x15183a, metalness: 0.4, roughness: 0.4 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 2), capMat);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.55, 32), capMat);
  crown.position.y = -0.3;
  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 1, roughness: 0.2 }));
  btn.position.y = 0.07;
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0xf5b942, metalness: 0.8, roughness: 0.3 }));
  tassel.position.set(0.8, -0.35, 0.8);
  const tEnd = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 12), tassel.material);
  tEnd.position.set(0.8, -0.85, 0.8);
  cap.add(board, crown, btn, tassel, tEnd);
  cap.position.set(3.2, -3.4, 0);
  cap.rotation.set(0.35, 0.5, -0.15);
  cap.scale.setScalar(isMobile ? 0.6 : 0.9);
  if (!isMobile) world.add(cap);

  // ---------- Atom ----------
  const atom = new THREE.Group();
  const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 2), new THREE.MeshStandardMaterial({ color: 0x3de0c5, emissive: 0x0d5a4e, metalness: 0.3, roughness: 0.2 }));
  atom.add(nucleus);
  const electrons = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: 0x3de0c5, transparent: true, opacity: 0.55 }));
    ring.rotation.set(Math.PI / 2, (i * Math.PI) / 3, 0);
    const holder = new THREE.Group();
    holder.rotation.z = (i * Math.PI) / 3;
    holder.add(ring);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    holder.add(e);
    electrons.push({ e, holder, a: i * 2 });
    ring.rotation.set(Math.PI / 2, 0, 0);
    atom.add(holder);
  }
  atom.position.set(isMobile ? -1.6 : 1.4, isMobile ? -3.2 : 3.6, -2);
  atom.scale.setScalar(isMobile ? 0.8 : 1.1);
  world.add(atom);

  // ---------- Crystal (wireframe icosahedron) ----------
  const crystal = new THREE.Group();
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), new THREE.MeshBasicMaterial({ color: 0xf5b942, wireframe: true, transparent: true, opacity: 0.16 }));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), new THREE.MeshStandardMaterial({ color: 0xff7a3d, metalness: 0.6, roughness: 0.15, flatShading: true, emissive: 0x3a1200 }));
  crystal.add(ico, core);
  crystal.position.set(isMobile ? 1.5 : 7.5, isMobile ? -1 : 0.5, -8);
  world.add(crystal);

  // ---------- Torus knot ----------
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.18, 120, 16), new THREE.MeshStandardMaterial({ color: 0x9b8cff, metalness: 0.7, roughness: 0.2 }));
  knot.position.set(-9, -5, -9);
  if (!isMobile) world.add(knot);

  // ---------- Gold dust particles ----------
  const count = isMobile ? 700 : 1800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [new THREE.Color(0xf5b942), new THREE.Color(0xff7a3d), new THREE.Color(0x3de0c5), new THREE.Color(0xffffff)];
  for (let i = 0; i < count; i++) {
    const r = 6 + Math.random() * 18;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(p) - 6;
    const c = palette[Math.random() < 0.6 ? 0 : Math.floor(Math.random() * 4)];
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  // soft round sprite
  const sprite = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.3, "rgba(255,255,255,.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, map: sprite, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
  scene.add(dust);

  // ---------- Interaction ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollP = 0, scrollT = 0, heroP = 0, lastOp = "";
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollT = max > 0 ? window.scrollY / max : 0;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // pause when tab hidden
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });

  // public hook: burst when trial starts
  let burst = 0;
  // cinematic fly-in: introK goes 0 → 1 when intro() is called
  let introK = 0, introOn = false;
  window.AVScene = {
    burst() { burst = 1; },
    intro() { introOn = true; },
  };
  if (reduce) introK = 1;

  const clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    const sp = reduce ? 0.2 : 1;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    scrollP += (scrollT - scrollP) * 0.06;
    heroP += (Math.min(window.scrollY / window.innerHeight, 1) - heroP) * 0.08;
    burst *= 0.96;
    if (introOn && introK < 1) introK = Math.min(1, introK + 0.0075);
    const ie = 1 - Math.pow(1 - introK, 4); // easeOutQuart
    const away = 1 - ie;

    // camera dolly through the scene while scrolling (+ fly-in from deep space)
    camera.position.x = mouse.x * 0.8;
    camera.position.y = -mouse.y * 0.5 - scrollP * 2 + away * 3;
    camera.position.z = 14 - Math.sin(scrollP * Math.PI) * 1.5 + away * 34;
    camera.lookAt(0, -scrollP * 2, 0);
    world.scale.setScalar(0.35 + 0.65 * ie);
    dust.scale.setScalar(0.6 + 0.4 * ie);

    // gentle sway (no full spin, so back objects never swing in front of the text)
    world.rotation.y = Math.sin(scrollP * Math.PI * 2) * 0.35 + mouse.x * 0.15 + away * 2.6;
    world.rotation.x = mouse.y * 0.08;
    world.position.z = -heroP * 5;

    // dim the 3D layer once past the hero so content stays readable
    const op = (1 - heroP * 0.6).toFixed(3);
    openBook.position.z = (isMobile ? -3 : 1) - heroP * 6;
    if (op !== lastOp) { canvas.style.opacity = op; lastOp = op; }

    books.forEach((b) => {
      const u = b.userData;
      const spread = 1 + scrollP * 0.6 + burst * 0.8;
      b.position.x = u.base.x * spread;
      b.position.y = u.base.y * spread + Math.sin(t * u.speed * sp + u.phase) * 0.35;
      b.position.z = u.base.z + Math.cos(t * 0.3 * sp + u.phase) * 0.3;
      b.rotation.x = u.rot.x + Math.sin(t * 0.4 * sp + u.phase) * 0.2;
      b.rotation.y = u.rot.y + t * 0.15 * sp + burst * 4;
    });

    // fanning pages in the open book
    flipLeaves.forEach((l, i) => {
      const k = ((t * 0.35 * sp + i * 0.25) % 1);
      const e = k < 0.5 ? 0 : (k - 0.5) * 2;
      l.rotation.y = -Math.PI * (0.5 - 0.5 * Math.cos(e * Math.PI));
    });
    openBook.position.y = obY + Math.sin(t * 0.6 * sp) * 0.25;
    openBook.rotation.z = 0.1 + Math.sin(t * 0.4 * sp) * 0.05;

    cap.rotation.y = 0.5 + t * 0.3 * sp;
    cap.position.y = -3.4 + Math.sin(t * 0.8 * sp) * 0.3;

    electrons.forEach((o, i) => {
      o.a += 0.03 * sp * (1 + i * 0.3);
      o.e.position.set(Math.cos(o.a) * 0.9, 0, Math.sin(o.a) * 0.9);
    });
    atom.rotation.y = t * 0.4 * sp;
    nucleus.rotation.x = t * sp;

    crystal.rotation.x = t * 0.1 * sp;
    crystal.rotation.y = t * 0.15 * sp;
    core.rotation.y = -t * 0.4 * sp;
    knot.rotation.x = t * 0.3 * sp;
    knot.rotation.y = t * 0.2 * sp;

    dust.rotation.y = t * 0.02 * sp + scrollP * 1.5;
    dust.rotation.x = scrollP * 0.4;

    renderer.render(scene, camera);
  }
  loop();
})();
