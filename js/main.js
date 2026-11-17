/* =========================================================
   Amul Vidya — main interactions
   ========================================================= */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const isTouch = window.matchMedia("(hover: none)").matches;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  $("#year").textContent = new Date().getFullYear();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- SMOOTH SCROLL (Lenis) ---------------- */
  let lenis = null;
  if (typeof Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    lenis.stop(); // locked during the intro
    window.AVLenis = lenis;
  }
  function scrollToEl(target) {
    const el = typeof target === "string" ? (target === "#top" ? 0 : $(target)) : target;
    if (el === null || el === undefined) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: el === 0 ? 0 : -10 });
    else if (el === 0) scrollTo({ top: 0, behavior: "smooth" });
    else el.scrollIntoView({ behavior: "smooth" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    e.preventDefault();
    scrollToEl(a.getAttribute("href"));
  });

  /* ---------------- DEMO VIDEOS ----------------
     Put your .mp4 files in /videos and set `src` below. */
  const DEMOS = [
    { title: "Quadratic Equations in 3D", teacher: "Prof. R. Mehta", cat: "maths", dur: "12:40", free: true, sym: "x²", c1: "#f5b942", c2: "#ff7a3d", bg: "linear-gradient(135deg,#2a1f5c,#0d1030)", src: "videos/maths-quadratic.mp4" },
    { title: "Newton's Laws, Visualised", teacher: "Dr. S. Iyer", cat: "science", dur: "15:05", free: true, sym: "F=ma", c1: "#3de0c5", c2: "#1d5fb8", bg: "linear-gradient(135deg,#0d3a44,#0b0f24)", src: "videos/physics-newton.mp4" },
    { title: "Hindi Vyakaran: Sandhi", teacher: "Smt. K. Verma", cat: "language", dur: "09:30", free: true, sym: "अ+आ", c1: "#ff5c8a", c2: "#f5b942", bg: "linear-gradient(135deg,#4a1838,#120b24)", src: "videos/hindi-sandhi.mp4" },
    { title: "Cell Structure Deep Dive", teacher: "Dr. A. Khan", cat: "science", dur: "18:12", free: false, sym: "🧬", c1: "#7ee07a", c2: "#3de0c5", bg: "linear-gradient(135deg,#123d2a,#0b0f24)", src: "videos/bio-cell.mp4" },
    { title: "JEE Mains: Calculus Tricks", teacher: "Er. V. Rao", cat: "exam", dur: "22:48", free: false, sym: "∫dx", c1: "#9b8cff", c2: "#ff7a3d", bg: "linear-gradient(135deg,#2b1f63,#0b0f24)", src: "videos/jee-calculus.mp4" },
    { title: "English Grammar: Tenses", teacher: "Ms. P. D'Souza", cat: "language", dur: "11:20", free: true, sym: "Aa", c1: "#ffd27a", c2: "#9b8cff", bg: "linear-gradient(135deg,#3d2b12,#0b0f24)", src: "videos/english-tenses.mp4" },
  ];

  const grid = $("#demoGrid");
  grid.innerHTML = DEMOS.map((d, i) => `
    <article class="demo" data-cat="${d.cat}" data-i="${i}" tabindex="0" role="button" aria-label="Play ${d.title}">
      <div class="demo-thumb" style="--thumb:${d.bg};--c1:${d.c1};--c2:${d.c2}">
        <span class="shape s1"></span><span class="shape s2"></span>
        <span class="sym">${d.sym}</span>
        <span class="demo-tag ${d.free ? "free" : "pro"}">${d.free ? "FREE" : "🔒 PRO"}</span>
        <span class="demo-play">▶</span>
        <span class="demo-dur">${d.dur}</span>
      </div>
      <div class="demo-info"><h4>${d.title}</h4><p>${d.teacher}</p></div>
    </article>`).join("");

  $$("#demoFilters .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#demoFilters .chip").forEach((x) => x.classList.toggle("active", x === c));
    const f = c.dataset.filter;
    $$(".demo").forEach((d) => d.classList.toggle("hide", f !== "all" && d.dataset.cat !== f));
    if (hasGSAP) gsap.fromTo(".demo:not(.hide)", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" });
  }));

  /* ---------------- MODALS ---------------- */
  function openModal(m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); if (lenis) lenis.stop(); }
  function closeModal(m) {
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    if (!$(".modal.open")) { document.body.classList.remove("locked"); if (lenis && introDone) lenis.start(); }
    if (m.id === "videoModal") { const v = $("#demoVideo"); v.pause(); v.removeAttribute("src"); v.load(); }
  }
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal.open").forEach(closeModal); });

  /* ---------------- VIDEO PLAYER ---------------- */
  const vModal = $("#videoModal"), video = $("#demoVideo"), vFall = $("#videoFallback");
  function playDemo(i) {
    const d = DEMOS[i];
    if (!d.free && !hasAccess()) {
      toast("🔒 Premium demo. Start your free trial (no signup) to unlock it.");
      scrollToEl("#pricing");
      return;
    }
    $("#videoTitle").textContent = d.title;
    $("#videoTeacher").textContent = d.teacher;
    $("#vfTitle").textContent = d.title;
    $("#vfPath").textContent = d.src;
    vFall.hidden = true;
    video.hidden = false;
    video.src = d.src;
    video.onerror = () => { video.hidden = true; vFall.hidden = false; };
    openModal(vModal);
    video.play().catch(() => {});
  }
  grid.addEventListener("click", (e) => { const c = e.target.closest(".demo"); if (c) playDemo(+c.dataset.i); });
  grid.addEventListener("keydown", (e) => { const c = e.target.closest(".demo"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); playDemo(+c.dataset.i); } });

  /* ---------------- AUTH (front-end demo) ----------------
     NOTE: this stores the user in the browser only.
     Connect to a real backend (Firebase / Supabase / your API) before launch. */
  const aModal = $("#authModal"), aTabs = $(".auth-tabs");
  function showAuth(tab) {
    aTabs.classList.toggle("signup", tab === "signup");
    $$(".atab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    $$(".auth-form").forEach((f) => (f.hidden = f.dataset.form !== tab));
    $$(".form-err").forEach((e) => (e.textContent = ""));
    openModal(aModal);
    closeMenu();
    setTimeout(() => { const i = $(`.auth-form[data-form="${tab}"] input`); if (i && !isTouch) i.focus(); }, 350);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-auth]");
    if (a) { e.preventDefault(); showAuth(a.dataset.auth); }
    const s = e.target.closest("[data-switch]");
    if (s) { e.preventDefault(); showAuth(s.dataset.switch); }
  });
  $$(".atab").forEach((t) => t.addEventListener("click", () => showAuth(t.dataset.tab)));

  const validId = (v) => /^\S+@\S+\.\S+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/\D/g, ""));
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, err = $(".form-err", f), id = f.id.value.trim(), pw = f.pw.value;
    if (!validId(id)) return (err.textContent = "Enter a valid email or 10-digit mobile number.");
    if (pw.length < 6) return (err.textContent = "Password must be at least 6 characters.");
    const users = store.get("av_users") || {};
    const u = users[id.toLowerCase()];
    if (!u || u.pw !== btoa(pw)) return (err.textContent = "Account not found or wrong password. Try signing up.");
    login(u);
  });
  $("#signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, err = $(".form-err", f);
    const name = f.name.value.trim(), id = f.id.value.trim(), pw = f.pw.value, grade = f.grade.value;
    if (name.length < 2) return (err.textContent = "Please enter your name.");
    if (!validId(id)) return (err.textContent = "Enter a valid email or 10-digit mobile number.");
    if (pw.length < 6) return (err.textContent = "Password must be at least 6 characters.");
    const users = store.get("av_users") || {};
    if (users[id.toLowerCase()]) return (err.textContent = "An account already exists. Please log in.");
    const u = { name, id, grade, pw: btoa(pw) };
    users[id.toLowerCase()] = u;
    store.set("av_users", users);
    login(u, true);
  });
  function login(u, isNew) {
    store.set("av_session", { name: u.name, id: u.id, grade: u.grade });
    closeModal(aModal);
    renderUser();
    toast(isNew ? `🎉 Welcome to Amul Vidya, ${u.name.split(" ")[0]}!` : `👋 Welcome back, ${u.name.split(" ")[0]}!`);
  }
  $("#logoutBtn").addEventListener("click", () => { store.del("av_session"); renderUser(); toast("Logged out. See you soon!"); });
  function renderUser() {
    const s = store.get("av_session");
    $("#navActions").hidden = !!s;
    $("#navUser").hidden = !s;
    $$(".nav-mobile-actions").forEach((m) => (m.hidden = !!s));
    if (s) { $("#userName").textContent = s.name.split(" ")[0]; $("#userAvatar").textContent = s.name[0].toUpperCase(); }
  }

  /* ---------------- FREE TRIAL (no signup) ---------------- */
  const TRIAL_DAYS = 7;
  function trialActive() { const t = store.get("av_trial"); return t && Date.now() < t.until; }
  function hasAccess() { return trialActive() || !!store.get("av_session"); }
  function renderTrial() { $("#trialBadge").hidden = !trialActive(); }
  function startTrial() {
    closeMenu();
    $$(".modal.open").forEach(closeModal);
    if (!trialActive()) store.set("av_trial", { until: Date.now() + TRIAL_DAYS * 864e5 });
    renderTrial();
    if (window.AVScene) window.AVScene.burst();
    $$(".demo-tag.pro").forEach((t) => { t.textContent = "UNLOCKED"; t.classList.replace("pro", "free"); });
    toast(`✨ Free trial unlocked for ${TRIAL_DAYS} days. No signup needed! Enjoy all demos & quizzes.`);
    setTimeout(() => scrollToEl("#demos"), 500);
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-trial]")) { e.preventDefault(); startTrial(); } });
  if (trialActive()) $$(".demo-tag.pro").forEach((t) => { t.textContent = "UNLOCKED"; t.classList.replace("pro", "free"); });

  /* ---------------- PRICING ---------------- */
  let yearly = false;
  const sw = $("#billSwitch");
  function setBilling(y) {
    yearly = y;
    sw.classList.toggle("on", y);
    $$(".bt-label").forEach((l) => l.classList.toggle("active", (l.dataset.bill === "yearly") === y));
    $$(".price b[data-monthly]").forEach((b) => {
      const to = +(y ? b.dataset.yearly : b.dataset.monthly);
      if (hasGSAP) { const o = { v: +b.textContent }; gsap.to(o, { v: to, duration: 0.6, ease: "power2.out", onUpdate: () => (b.textContent = Math.round(o.v)) }); }
      else b.textContent = to;
    });
  }
  sw.addEventListener("click", () => setBilling(!yearly));
  $$(".bt-label").forEach((l) => l.addEventListener("click", () => setBilling(l.dataset.bill === "yearly")));
  $$("[data-plan]").forEach((b) => b.addEventListener("click", () => {
    if (!store.get("av_session")) { toast(`Create a free account to subscribe to ${b.dataset.plan}.`); showAuth("signup"); return; }
    toast(`💳 Checkout for ${b.dataset.plan} (${yearly ? "yearly" : "monthly"}): connect Razorpay/Stripe here.`);
  }));

  /* ---------------- NAV ---------------- */
  const nav = $("#nav");
  const burger = $("#burger");
  function closeMenu() { nav.classList.remove("open"); }
  burger.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", closeMenu));
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    $("#scroll-progress").style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- TOAST ---------------- */
  let tt;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove("show"), 3800);
  }

  /* ---------------- CURSOR GLOW / TILT / MAGNETIC ---------------- */
  if (!isTouch) {
    const glow = $("#cursor-glow");
    addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg) translateZ(0)`;
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------------- BOOK FLIP ---------------- */
  const book = $("#flipBook");
  const pages = $$(".page", book);
  const N = pages.length;
  function setBook(p) {
    // p: 0..N  (number of pages turned, fractional)
    pages.forEach((pg, i) => {
      const t = Math.min(Math.max(p - i, 0), 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const lift = Math.sin(e * Math.PI) * 30;
      pg.style.transform = `translateZ(${lift + (t > 0.5 ? i : N - i) * 0.6}px) rotateY(${-180 * e}deg)`;
      pg.style.zIndex = t > 0.5 ? i + 1 : N - i;
    });
    // closed cover centred → open spread centred → back cover centred
    let shift;
    if (p <= 1) shift = -0.5 + 0.5 * p;
    else if (p >= N - 1) shift = 0.5 * (p - (N - 1));
    else shift = 0;
    book.style.transform = `rotateX(14deg) translateX(calc(var(--pw) * ${shift}))`;
    const bp = $("#bookProgress");
    if (bp) bp.style.width = (p / N) * 100 + "%";
  }
  setBook(0);

  // Click fallback when GSAP isn't available
  let manual = 0;
  if (!hasGSAP) book.addEventListener("click", () => { manual = (manual + 1) % (N + 1); setBook(manual); });

  /* ---------------- COUNTERS ---------------- */
  function runCounters() {
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count, dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
      const fmt = (v) => (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-IN")) + suf;
      if (!hasGSAP) return (el.textContent = fmt(to));
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 2.2, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)) });
    });
  }

  /* ---------------- CINEMATIC INTRO ---------------- */
  let introDone = false;
  function runIntro() {
    const loader = $("#loader");
    const finish = () => { loader.classList.add("done"); };
    if (!hasGSAP || reduceMotion) { finish(); afterIntro(); return; }

    const countEl = $("#introCount"), lineEl = $("#introLine"), status = $("#introStatus");
    const statuses = ["Preparing knowledge", "Loading 3D library", "Sharpening pencils", "Opening the book"];
    let loaded = document.readyState === "complete";
    addEventListener("load", () => (loaded = true), { once: true });
    const prog = { v: 0 };

    const tl = gsap.timeline();
    tl.from(".intro-grid", { opacity: 0, scale: 1.25, duration: 1.8, ease: "power2.out" }, 0)
      .from(".intro-top > *", { y: -24, opacity: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.1)
      .to(".il-draw", { strokeDashoffset: 0, duration: 1.4, stagger: 0.25, ease: "power2.inOut" }, 0.1)
      .from(".intro-logo", { scale: 0.5, rotate: -40, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.1)
      .from(".intro-word .iw", { yPercent: 120, rotate: 10, opacity: 0, filter: "blur(14px)", duration: 1.2, stagger: 0.055, ease: "expo.out" }, 0.45)
      .from(".intro-tag > *", { yPercent: 120, opacity: 0, duration: 1, stagger: 0.12, ease: "expo.out" }, 1.05)
      .from(".intro-bottom", { opacity: 0, y: 30, duration: 0.9, ease: "power3.out" }, 0.3)
      .to(prog, {
        v: 100, duration: 2.7, ease: "power2.inOut",
        onUpdate() {
          countEl.textContent = String(Math.round(prog.v)).padStart(3, "0");
          lineEl.style.transform = `scaleX(${prog.v / 100})`;
          status.textContent = statuses[Math.min(3, Math.floor(prog.v / 26))];
        },
      }, 0.35)
      // hold here until the page (fonts, 3D libs) has really loaded
      .add(() => {
        if (loaded) return;
        tl.pause();
        const go = () => tl.resume();
        addEventListener("load", go, { once: true });
        setTimeout(go, 4000);
      })
      // ---- exit ----
      .to(".intro-logo", { scale: 1.6, opacity: 0, duration: 0.7, ease: "power3.in" }, "+=0.2")
      .to(".intro-word .iw", { yPercent: -120, rotate: -8, opacity: 0, filter: "blur(10px)", duration: 0.8, stagger: 0.03, ease: "expo.in" }, "<")
      .to(".intro-tag > *, .intro-top > *, .intro-bottom", { y: -24, opacity: 0, duration: 0.6, stagger: 0.03, ease: "power3.in" }, "<")
      .add(() => window.AVScene && window.AVScene.intro(), "-=0.35")
      .to(".intro-grid", { opacity: 0, duration: 0.6 }, "-=0.3")
      .to(".intro-cols i", { yPercent: -101, duration: 1.15, stagger: { each: 0.07, from: "center" }, ease: "expo.inOut" }, "-=0.35")
      .add(afterIntro, "-=0.8")
      .add(finish);

    setTimeout(() => { if (!introDone) { tl.kill(); finish(); afterIntro(); } }, 12000); // safety net
  }
  runIntro();

  function afterIntro() {
    if (introDone) return;
    introDone = true;
    renderUser();
    renderTrial();
    if (lenis) lenis.start();
    if (!hasGSAP) { runCounters(); return; }

    // split hero title into chars
    $$(".hero-title .split").forEach((s) => {
      s.innerHTML = s.textContent.split("").map((c) => `<span class="char">${c}</span>`).join("");
    });
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".nav", { y: -70, opacity: 0, duration: 1.4 }, 0.1)
      .from(".hero-title .char", { yPercent: 115, rotate: 14, opacity: 0, filter: "blur(10px)", duration: 1.5, stagger: 0.045, clearProps: "filter,transform" }, 0.15)
      .from(".hero .reveal", { y: 40, opacity: 0, filter: "blur(8px)", duration: 1.3, stagger: 0.08, clearProps: "filter" }, 0.55)
      .add(runCounters, 0.9)
      .from(".scroll-hint", { opacity: 0, y: 20, duration: 1 }, 1.3);
    setupScroll();
  }

  /* ---------------- TEXT SPLITTING ---------------- */
  function splitWords(el, cls) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            if (cls) { w.className = cls; w.textContent = p; }
            else { w.className = "w"; const i = document.createElement("span"); i.className = "wi"; i.textContent = p; w.appendChild(i); }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          if (n.tagName === "EM" && !cls) n.classList.add("has-split");
          walk(n);
        }
      });
    };
    walk(el);
    return $$(cls ? "." + cls : ".wi", el);
  }

  /* ---------------- SCROLL ANIMATIONS ---------------- */
  function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // ---- HERO: lines drift apart, content parallaxes out ----
    gsap.to(".hero-title .line:nth-child(1)", { xPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    gsap.to(".hero-title .line:nth-child(2)", { xPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    gsap.to(".hero-inner", { yPercent: -18, opacity: 0, filter: "blur(6px)", ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });
    gsap.to(".hero-stats", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "30% top", end: "bottom top", scrub: true } });

    // ---- MARQUEE: GSAP-driven, reverses with scroll direction + velocity skew ----
    const track = $(".marquee-track");
    track.style.animation = "none";
    const mq = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    mq.totalTime(38 * 500);
    const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
    let dir = 1;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const v = self.getVelocity();
        if (self.direction !== dir) dir = self.direction;
        gsap.to(mq, { timeScale: dir * (1 + Math.min(Math.abs(v) / 600, 5)), duration: 0.3, overwrite: true });
        skewTo(gsap.utils.clamp(-10, 10, v / -300));
      },
    });
    ScrollTrigger.addEventListener("scrollEnd", () => { gsap.to(mq, { timeScale: dir, duration: 1 }); skewTo(0); });

    // ---- MANIFESTO: words light up as you read ----
    const mWords = splitWords($("#manifestoText"), "mw");
    gsap.from("#manifesto .kicker", { y: 30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: "#manifesto", start: "top 80%" } });
    gsap.to(mWords, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: "#manifestoText", start: "top 78%", end: "bottom 45%", scrub: 0.8 } });

    // ---- SECTION HEADS: masked word-rise titles ----
    $$(".big-title").forEach((t) => {
      if (t.closest("#loader")) return;
      const words = splitWords(t);
      gsap.from(words, { yPercent: 115, rotate: 5, duration: 1.3, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 86%" } });
    });
    $$(".section-head .kicker, .book-copy .kicker").forEach((k) => {
      gsap.from(k, { x: -30, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: k, start: "top 90%" } });
    });
    $$(".section-head .lead, .book-copy > p, .billing-toggle, .demo-filters").forEach((p) => {
      gsap.from(p, { y: 30, opacity: 0, filter: "blur(6px)", duration: 1.2, ease: "expo.out", clearProps: "filter", scrollTrigger: { trigger: p, start: "top 90%" } });
    });

    // ---- FEATURES: 3D cascade ----
    gsap.from(".feature", { y: 120, rotateX: -40, opacity: 0, duration: 1.3, stagger: { each: 0.09, grid: "auto", from: "start" }, ease: "expo.out", transformPerspective: 900, transformOrigin: "50% 0%", scrollTrigger: { trigger: ".feature-grid", start: "top 82%" }, clearProps: "transform" });
    gsap.from(".f-ico", { scale: 0, rotate: -90, duration: 1.2, stagger: 0.09, ease: "back.out(2)", scrollTrigger: { trigger: ".feature-grid", start: "top 75%" } });

    // ---- BOOK: pinned, pages turn with scroll ----
    ScrollTrigger.create({
      trigger: "#book", start: "top top", end: () => "+=" + innerHeight * (N + 0.5),
      pin: true, scrub: 0.8, anticipatePin: 1,
      onUpdate: (self) => setBook(self.progress * N),
    });
    gsap.from(".book-wrap", { y: 160, rotateX: 50, scale: 0.85, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: "#book", start: "top 90%", end: "top top", scrub: 1 } });

    // ---- DEVICES ----
    gsap.fromTo(".laptop-lid", { rotateX: -88 }, { rotateX: 0, ease: "power2.out", scrollTrigger: { trigger: ".device-stage", start: "top 85%", end: "center 55%", scrub: 1 } });
    gsap.from(".laptop", { rotateY: -18, y: 80, scale: 0.9, ease: "none", scrollTrigger: { trigger: ".device-stage", start: "top bottom", end: "center center", scrub: 1 } });
    gsap.from(".phone", { x: 200, y: 80, rotateY: -50, rotateZ: 12, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: ".device-stage", start: "top 70%", end: "center 50%", scrub: 1 } });
    gsap.from(".float-chip", { scale: 0, opacity: 0, duration: 0.9, stagger: 0.15, ease: "back.out(2)", scrollTrigger: { trigger: ".device-stage", start: "center 70%" } });
    $$(".float-chip").forEach((c, i) => gsap.to(c, { y: i % 2 ? 14 : -14, duration: 2.4 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    gsap.to(".ps-bar i", { width: "100%", ease: "none", scrollTrigger: { trigger: ".device-stage", start: "top 60%", end: "bottom 40%", scrub: true } });

    // ---- DEMOS: curtain reveal + inner parallax ----
    gsap.from(".demo", { clipPath: "inset(100% 0% 0% 0% round 22px)", y: 60, duration: 1.4, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "#demoGrid", start: "top 85%" }, clearProps: "clipPath" });
    $$(".demo-thumb .sym").forEach((s) => gsap.fromTo(s, { y: 30 }, { y: -30, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true } }));

    // ---- QUIZ ----
    gsap.from(".qtab", { y: 40, opacity: 0, scale: 0.9, duration: 1, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: "#quizTabs", start: "top 90%" } });
    gsap.from("#quizCard", { y: 100, rotateX: 25, opacity: 0, duration: 1.4, ease: "expo.out", transformPerspective: 1000, scrollTrigger: { trigger: "#quizCard", start: "top 90%" } });

    // ---- PRICING: cards fan in ----
    mm.add("(min-width: 1081px)", () => {
      gsap.from(".price-card", { y: 140, opacity: 0, rotateY: (i) => (i - 1) * 30, rotateZ: (i) => (i - 1) * 4, duration: 1.4, stagger: 0.12, ease: "expo.out", transformPerspective: 1200, scrollTrigger: { trigger: ".price-grid", start: "top 82%" }, clearProps: "transform" });
    });
    mm.add("(max-width: 1080px)", () => {
      $$(".price-card").forEach((c) => gsap.from(c, { y: 80, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%" }, clearProps: "transform" }));
    });

    // ---- TESTIMONIALS: horizontal drift ----
    const vt = $("#voiceTrack");
    gsap.fromTo(vt, { x: () => innerWidth * 0.1 }, { x: () => -(vt.scrollWidth - innerWidth * 0.9), ease: "none", scrollTrigger: { trigger: "#voices", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });

    // ---- FINAL CTA: scale-up window ----
    gsap.fromTo(".cta-box", { scale: 0.82, borderRadius: 60, opacity: 0.3 }, { scale: 1, borderRadius: 22, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cta-box", start: "top bottom", end: "center center", scrub: 1 } });

    // ---- FOOTER: giant wordmark rises letter by letter ----
    const mega = $(".f-mega");
    if (mega) {
      [...mega.childNodes].forEach((n) => {
        const html = n.textContent.split("").map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");
        if (n.nodeType === 3) { const s = document.createElement("span"); s.innerHTML = html; n.replaceWith(s); }
        else n.innerHTML = html;
      });
      gsap.from(".f-mega .ch", { yPercent: 100, ease: "none", stagger: 0.05, scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 1 } });
    }

    addEventListener("resize", () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener("load", () => ScrollTrigger.refresh());
  }
})();
