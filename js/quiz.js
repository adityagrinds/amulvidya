/* =========================================================
   Amul Vidya — Quiz Arena (5 formats)
   Edit the QUESTION BANK below to add your own content.
   ========================================================= */
(function () {
  const card = document.getElementById("quizCard");
  const tabs = document.querySelectorAll(".qtab");
  if (!card) return;

  // ---------------- QUESTION BANK ----------------
  const BANK = {
    mcq: [
      { q: "What is the value of √144?", o: ["10", "12", "14", "16"], a: 1, e: "12 × 12 = 144" },
      { q: "Which gas do plants absorb during photosynthesis?", o: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], a: 2, e: "Plants take in CO₂ and release O₂." },
      { q: "Who wrote the national anthem ‘Jana Gana Mana’?", o: ["Bankim Chandra", "Rabindranath Tagore", "Sarojini Naidu", "Premchand"], a: 1, e: "Rabindranath Tagore wrote it in 1911." },
      { q: "SI unit of force is…", o: ["Joule", "Watt", "Newton", "Pascal"], a: 2, e: "1 N = 1 kg·m/s²" },
      { q: "The powerhouse of the cell is the…", o: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], a: 1, e: "Mitochondria produce ATP." },
    ],
    tf: [
      { q: "The Sun is a star.", a: true, e: "It is a G-type main-sequence star." },
      { q: "Water boils at 50 °C at sea level.", a: false, e: "It boils at 100 °C at sea level." },
      { q: "‘संज्ञा’ means noun in Hindi grammar.", a: true, e: "संज्ञा = noun." },
      { q: "A triangle can have two right angles.", a: false, e: "The angles must add up to 180°." },
      { q: "Light travels faster than sound.", a: true, e: "About 3 × 10⁸ m/s vs about 343 m/s." },
    ],
    fill: [
      { pre: "The chemical formula of water is", post: ".", a: ["h2o"], hint: "Two hydrogens, one oxygen" },
      { pre: "The capital of India is New", post: ".", a: ["delhi"], hint: "Home of India Gate" },
      { pre: "7 × 8 =", post: "", a: ["56"], hint: "Think 7 × 7 + 7" },
      { pre: "The largest planet in our solar system is", post: ".", a: ["jupiter"], hint: "A gas giant with a Great Red Spot" },
      { pre: "The opposite of ‘ancient’ is", post: ".", a: ["modern", "new"], hint: "Starts with m…" },
    ],
    match: [
      { l: "Newton", r: "Laws of Motion" },
      { l: "Einstein", r: "Relativity" },
      { l: "C. V. Raman", r: "Scattering of light" },
      { l: "Aryabhata", r: "Zero & astronomy" },
      { l: "Darwin", r: "Evolution" },
    ],
  };

  const META = {
    mcq: { title: "Multiple Choice", icon: "🎯" },
    tf: { title: "True / False", icon: "⚖️" },
    fill: { title: "Fill in the Blank", icon: "✍️" },
    match: { title: "Match the Following", icon: "🔗" },
    rapid: { title: "Rapid Fire", icon: "⚡" },
  };

  let state = {};
  let rapidTimer = null;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function animateIn() {
    if (window.gsap) gsap.fromTo(card.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" });
  }

  function head(i, total) {
    return `<div class="q-head">
      <span>${META[state.type].icon} ${META[state.type].title} · ${i + 1}/${total}</span>
      <div class="q-progress"><i style="width:${(i / total) * 100}%"></i></div>
      <span class="q-score">★ ${state.score}</span>
    </div>`;
  }

  function start(type) {
    clearInterval(rapidTimer);
    state = { type, i: 0, score: 0 };
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.type === type));
    ({ mcq: renderMCQ, tf: renderTF, fill: renderFill, match: renderMatch, rapid: renderRapidIntro })[type]();
  }

  function next() {
    state.i++;
    ({ mcq: renderMCQ, tf: renderTF, fill: renderFill })[state.type]();
  }

  function nextBtn() {
    const isLast = state.i >= BANK[state.type].length - 1;
    return `<div class="q-actions"><button class="btn btn-primary" data-next>${isLast ? "See result" : "Next →"}</button></div>`;
  }

  function bindNext() {
    const b = card.querySelector("[data-next]");
    if (b) b.onclick = () => (state.i >= BANK[state.type].length - 1 ? result(state.score, BANK[state.type].length) : next());
  }

  // ---------- MCQ ----------
  function renderMCQ() {
    const list = BANK.mcq, it = list[state.i];
    card.innerHTML = `${head(state.i, list.length)}
      <h3 class="q-text">${esc(it.q)}</h3>
      <div class="q-opts">${it.o.map((o, k) => `<button class="q-opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span>${esc(o)}</button>`).join("")}</div>
      <p class="q-feedback"></p><div class="q-slot"></div>`;
    animateIn();
    card.querySelectorAll(".q-opt").forEach((b) => (b.onclick = () => {
      const k = +b.dataset.k, ok = k === it.a;
      card.querySelectorAll(".q-opt").forEach((x) => (x.disabled = true));
      b.classList.add(ok ? "correct" : "wrong");
      card.querySelector(`.q-opt[data-k="${it.a}"]`).classList.add("correct");
      if (ok) state.score++;
      feedback(ok, it.e);
      card.querySelector(".q-slot").innerHTML = nextBtn();
      bindNext();
    }));
  }

  // ---------- True / False ----------
  function renderTF() {
    const list = BANK.tf, it = list[state.i];
    card.innerHTML = `${head(state.i, list.length)}
      <h3 class="q-text">${esc(it.q)}</h3>
      <div class="tf-row"><button class="tf-btn t" data-v="1">✓ True</button><button class="tf-btn f" data-v="0">✕ False</button></div>
      <p class="q-feedback"></p><div class="q-slot"></div>`;
    animateIn();
    card.querySelectorAll(".tf-btn").forEach((b) => (b.onclick = () => {
      const v = b.dataset.v === "1", ok = v === it.a;
      card.querySelectorAll(".tf-btn").forEach((x) => (x.disabled = true));
      b.classList.add(ok ? "correct" : "wrong");
      if (!ok) card.querySelector(`.tf-btn[data-v="${it.a ? 1 : 0}"]`).classList.add("correct");
      if (ok) state.score++;
      feedback(ok, it.e);
      card.querySelector(".q-slot").innerHTML = nextBtn();
      bindNext();
    }));
  }

  // ---------- Fill in the blank ----------
  function renderFill() {
    const list = BANK.fill, it = list[state.i];
    card.innerHTML = `${head(state.i, list.length)}
      <form class="fill-form">
        <p class="fill-sentence">${esc(it.pre)} <input class="fill-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" /> ${esc(it.post)}</p>
        <p class="fill-hint">💡 Hint: ${esc(it.hint)}</p>
        <p class="q-feedback"></p>
        <div class="q-slot"><div class="q-actions"><button class="btn btn-primary" type="submit">Check</button></div></div>
      </form>`;
    animateIn();
    const input = card.querySelector(".fill-input");
    setTimeout(() => input.focus({ preventScroll: true }), 300);
    card.querySelector(".fill-form").onsubmit = (e) => {
      e.preventDefault();
      if (input.disabled) return;
      const v = input.value.trim().toLowerCase().replace(/\s+/g, "");
      if (!v) { input.classList.add("wrong"); setTimeout(() => input.classList.remove("wrong"), 400); return; }
      const ok = it.a.includes(v);
      input.disabled = true;
      input.classList.add(ok ? "correct" : "wrong");
      if (!ok) input.value = `${input.value} → ${it.a[0].toUpperCase()}`;
      if (ok) state.score++;
      feedback(ok, ok ? "Spot on!" : `Correct answer: ${it.a[0].toUpperCase()}`);
      card.querySelector(".q-slot").innerHTML = nextBtn();
      bindNext();
    };
  }

  // ---------- Match ----------
  function renderMatch() {
    const pairs = BANK.match;
    const left = shuffle(pairs.map((p, i) => ({ t: p.l, id: i })));
    const right = shuffle(pairs.map((p, i) => ({ t: p.r, id: i })));
    let sel = null, done = 0, tries = 0;
    state.score = 0;
    card.innerHTML = `<div class="q-head"><span>${META.match.icon} Tap a name, then its discovery</span><div class="q-progress"><i style="width:0%"></i></div><span class="q-score">★ 0</span></div>
      <div class="match-grid">
        <div class="match-col">${left.map((x) => `<button class="m-item" data-side="l" data-id="${x.id}">${esc(x.t)}</button>`).join("")}</div>
        <div class="match-col">${right.map((x) => `<button class="m-item" data-side="r" data-id="${x.id}">${esc(x.t)}</button>`).join("")}</div>
      </div><p class="q-feedback"></p>`;
    animateIn();
    card.querySelectorAll(".m-item").forEach((b) => (b.onclick = () => {
      if (b.classList.contains("done")) return;
      if (!sel || sel.dataset.side === b.dataset.side) {
        card.querySelectorAll(`.m-item[data-side="${b.dataset.side}"]`).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        sel = b;
        return;
      }
      tries++;
      if (sel.dataset.id === b.dataset.id) {
        [sel, b].forEach((x) => { x.classList.remove("sel"); x.classList.add("done"); x.disabled = true; });
        done++;
        state.score = Math.max(0, done * 2 - (tries - done));
        card.querySelector(".q-progress i").style.width = (done / pairs.length) * 100 + "%";
        card.querySelector(".q-score").textContent = "★ " + done;
        feedback(true, "Perfect match!");
        if (done === pairs.length) setTimeout(() => result(pairs.length, tries, `All ${pairs.length} matched in ${tries} tries`), 600);
      } else {
        const a = sel;
        [a, b].forEach((x) => x.classList.add("wrong"));
        feedback(false, "Not a match, try again.");
        setTimeout(() => [a, b].forEach((x) => x.classList.remove("wrong", "sel")), 450);
      }
      sel = null;
    }));
  }

  // ---------- Rapid fire ----------
  function renderRapidIntro() {
    card.innerHTML = `<div class="result">
      <div class="trophy">⚡</div>
      <h3>Rapid Fire Maths</h3>
      <p>30 seconds. As many sums as you can. Ready?</p>
      <div class="btns"><button class="btn btn-primary btn-lg" data-go>Start ⚡</button></div></div>`;
    animateIn();
    card.querySelector("[data-go]").onclick = runRapid;
  }

  function runRapid() {
    let time = 30, score = 0, total = 0;
    card.innerHTML = `<div class="rapid-wrap">
      <div class="rapid-timer"><svg viewBox="0 0 120 120"><defs><linearGradient id="rgrad"><stop offset="0" stop-color="#f5b942"/><stop offset="1" stop-color="#ff5c8a"/></linearGradient></defs><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" cx="60" cy="60" r="54"/></svg><b>30</b></div>
      <div class="q-head" style="justify-content:center"><span class="q-score">★ 0</span></div>
      <div class="rapid-q"></div>
      <div class="rapid-opts"></div></div>`;
    const fg = card.querySelector(".fg"), tb = card.querySelector(".rapid-timer b");
    const qEl = card.querySelector(".rapid-q"), opts = card.querySelector(".rapid-opts"), sc = card.querySelector(".q-score");
    let locked = false;

    function gen() {
      const ops = ["+", "−", "×"];
      const op = ops[Math.floor(Math.random() * 3)];
      let a = Math.floor(Math.random() * 12) + 2, b = Math.floor(Math.random() * 12) + 2;
      if (op === "−" && b > a) [a, b] = [b, a];
      const ans = op === "+" ? a + b : op === "−" ? a - b : a * b;
      const set = new Set([ans]);
      while (set.size < 4) set.add(Math.max(0, ans + Math.floor(Math.random() * 11) - 5));
      qEl.textContent = `${a} ${op} ${b}`;
      opts.innerHTML = shuffle([...set]).map((v) => `<button data-v="${v}">${v}</button>`).join("");
      locked = false;
      opts.querySelectorAll("button").forEach((btn) => (btn.onclick = () => {
        if (locked) return;
        locked = true; total++;
        const ok = +btn.dataset.v === ans;
        btn.classList.add(ok ? "correct" : "wrong");
        if (ok) { score++; sc.textContent = "★ " + score; }
        setTimeout(gen, 260);
      }));
      if (window.gsap) gsap.fromTo(qEl, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
    }
    gen();
    rapidTimer = setInterval(() => {
      time--;
      tb.textContent = time;
      fg.style.strokeDashoffset = 339.3 * (1 - time / 30);
      if (time <= 0) { clearInterval(rapidTimer); result(score, Math.max(total, 1), `${score} correct out of ${total} attempted`); }
    }, 1000);
  }

  // ---------- Helpers ----------
  function feedback(ok, msg) {
    const f = card.querySelector(".q-feedback");
    if (!f) return;
    f.className = "q-feedback " + (ok ? "ok" : "bad");
    f.textContent = (ok ? "✓ Correct! " : "✕ Oops. ") + (msg || "");
    const s = card.querySelector(".q-score");
    if (s && state.type !== "match" && state.type !== "rapid") s.textContent = "★ " + state.score;
  }

  function result(score, total, extra) {
    const pct = Math.round((score / total) * 100);
    const [emoji, title] = pct >= 80 ? ["🏆", "Topper level!"] : pct >= 50 ? ["🌟", "Great going!"] : ["📘", "Keep practising!"];
    card.innerHTML = `<div class="result">
      <div class="trophy">${emoji}</div>
      <h3>${title}</h3>
      <p>${extra || `You scored ${score} / ${total}`} · ${pct}%</p>
      <div class="btns">
        <button class="btn btn-primary" data-again>Play again</button>
        <button class="btn btn-ghost" data-other>Try another format</button>
      </div></div>`;
    animateIn();
    if (pct >= 50) confetti();
    card.querySelector("[data-again]").onclick = () => start(state.type);
    card.querySelector("[data-other]").onclick = () => {
      const order = ["mcq", "tf", "fill", "match", "rapid"];
      start(order[(order.indexOf(state.type) + 1) % order.length]);
    };
  }

  function confetti() {
    const colors = ["#f5b942", "#ff7a3d", "#3de0c5", "#9b8cff", "#ff5c8a"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      card.appendChild(c);
      setTimeout(() => c.remove(), 3800);
    }
  }

  tabs.forEach((t) => (t.onclick = () => start(t.dataset.type)));
  start("mcq");
})();
