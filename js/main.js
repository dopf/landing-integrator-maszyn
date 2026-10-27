/* Synergy Engineering – przewijanie, karty, etykiety, tabliczka rysunkowa i menedżer warstw. */
(function () {
  'use strict';
  const S = window.SynergyScene;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  const section = $('.line');
  const sticky = $('.sticky');
  const stage = $('.stage');
  const canvas = $('#scene');
  const cards = $$('.card', $('#cards'));
  const labelsEl = $('#labels');
  const leaders = $('#leaders');
  const layersNav = $('#layers');
  const layerBtns = $$('button', layersNav);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search);

  const SHEETS = [
    { p: 0, n: '00', layer: 'Hala' },
    { p: 0.06, n: '01', layer: 'Hala' },
    { p: 0.15, n: '02', layer: 'Mechanika' },
    { p: 0.345, n: '03', layer: 'Automatyka' },
    { p: 0.545, n: '04', layer: 'Bezpieczeństwo' },
    { p: 0.76, n: '05', layer: 'Sieć OT' },
    { p: 0.885, n: '06', layer: 'Wszystkie' }
  ];
  const LAYER_START = { hala: 0, mechanika: 0.15, automatyka: 0.35, bezpieczenstwo: 0.545, siec: 0.785 };
  const LAYER_OF_SHEET = ['hala', 'hala', 'mechanika', 'automatyka', 'bezpieczenstwo', 'siec', null];
  const FALLBACK = [[0, 'p00'], [0.15, 'p30'], [0.345, 'p40'], [0.42, 'p48'], [0.545, 'p57'], [0.59, 'p64'], [0.665, 'p73'], [0.76, 'p84'], [0.885, 'p100']];
  const REST = cards.map((c) => parseFloat(c.dataset.p));
  // początek animacji, którą opisuje karta (karta otwarcia: 0)
  const START = cards.map((c) => parseFloat(c.dataset.s || 0));

  let vw = 0, vh = 0, mobile = false, scrollLen = 1, sectionTop = 0, stageH = 0;
  let blocks = [];   // prostokąty (we współrzędnych sceny), które etykiety omijają
  let marks = [{ y: 0, p: 0 }, { y: 1, p: 1 }];   // przewinięcie w sekcji → postęp sceny (odcinkami liniowo)
  let views = [];    // dla każdej karty: przedział przewinięcia, w którym linki do arkuszy ją pokazują
  let ok = false;
  let ps = 0, target = 0, last = performance.now(), dirty = true, inView = true;
  const layerOn = { hala: true, mechanika: true, automatyka: true, bezpieczenstwo: true, siec: true };

  /* ---------- scena ---------- */
  try { ok = !!(S && S.init(canvas)); } catch (e) { ok = false; console.error(e); }
  if (!ok) document.documentElement.classList.add('no-webgl');

  /* ---------- układ ---------- */
  // Każda karta jedzie we własnym torze i w jego granicach przykleja się do ekranu (position: sticky).
  const tracks = cards.map((c) => {
    const t = document.createElement('div');
    t.className = c.classList.contains('card-hero') ? 'track track-hero' : 'track';
    c.before(t); t.appendChild(c);
    return t;
  });

  // Animacja karty rusza dopiero, gdy jej nagłówek jest na ekranie (góra karty na linii czytania).
  // Odcinek przewijania karty: nie krótszy niż dotychczasowe tempo sceny i niż czas potrzebny na przeczytanie karty.
  function layout() {
    vw = window.innerWidth;
    vh = sticky.clientHeight || window.innerHeight;   // 100svh: na telefonie nie zmienia się z paskiem adresu
    mobile = vw <= 900;
    const bar = mobile ? 56 : 64;
    stageH = stage.clientHeight || vh;
    const winTop = mobile ? stageH : bar;            // górna krawędź pola na karty (na telefonie pod sceną)
    const mb = mobile ? 14 : 24, gap = mobile ? 24 : 40;
    const read = mobile ? winTop + 24 : vh * 0.64;   // linia czytania: tu jest góra karty, gdy rusza jej animacja
    const dwell = (vh - winTop) * 0.35;              // tyle przewijania karta stoi przypięta, zanim przyjdzie następna
    const pace = vh * (mobile ? 10.5 : 9);            // tempo sceny sprzed zmiany: pikseli na cały postęp
    const n = cards.length;
    const hs = cards.map((c) => c.offsetHeight);
    const heroTop = mobile ? Math.max(vh - hs[0] - 16, 120) : Math.max(84, (vh - hs[0]) / 2 + 20);
    const y = [0];   // y[k]: przewinięcie, przy którym rusza animacja karty k
    for (let k = 1; k < n; k++) {
      // karta otwarcia na telefonie leży na scenie, więc arkusz 01 rusza dopiero, gdy ona zjedzie
      const need = k > 1 ? hs[k - 1] + gap + dwell
        : Math.max(heroTop + hs[0] + gap - read, mobile ? heroTop + hs[0] - bar : 0);
      y.push(y[k - 1] + Math.max((START[k] - START[k - 1]) * pace, need));
    }
    scrollLen = y[n - 1] + Math.max((1 - START[n - 1]) * pace, hs[n - 1] + dwell);
    section.style.height = Math.round(scrollLen + vh) + 'px';
    marks = y.map((v, k) => ({ y: v, p: START[k] })).concat({ y: scrollLen, p: 1 });
    // przypięcie: na komputerze karta na środku pola, na telefonie przy dolnej krawędzi
    const pin = (h) => (mobile ? vh - h - mb : Math.max(bar + 12, Math.min(bar + (vh - bar - h) / 2, vh - h - mb)));
    tracks.forEach((t, k) => {
      const h = hs[k];
      let top = heroTop, len = h, stick = 0;
      if (k > 0) {
        top = y[k] + read; stick = pin(h);
        len = k < n - 1 ? y[k + 1] + read - gap - top : scrollLen + stick + h - top;
      }
      t.style.top = Math.round(top) + 'px';
      t.style.height = Math.round(Math.max(h, len)) + 'px';
      cards[k].style.top = Math.round(stick) + 'px';
      // komputer: karta przypięta w całości; telefon: nagłówek karty tuż pod sceną
      views[k] = k === 0 ? null : mobile ? [y[k], y[k] + (read - winTop) / 2] : [top - stick, top + Math.max(h, len) - h - stick];
    });
    sectionTop = section.getBoundingClientRect().top + window.scrollY;
    if (ok) {
      const lay = mobile
        ? { offX: 0, offY: 0.12, fitW: 60, fitH: 60 }
        : { offX: -0.16, offY: 0.02, fitW: 96, fitH: 54 };
      S.resize(vw, stageH, lay);
    }
    leaders.setAttribute('viewBox', `0 0 ${vw} ${stageH}`);
    const sr = stage.getBoundingClientRect();
    const rel = (el, pad) => { const r = el.getBoundingClientRect(); return { x: r.left - sr.left - pad, y: r.top - sr.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad }; };
    blocks = [rel(layersNav, 8)];
    if (!mobile) blocks.push(rel($('#titleblock'), 8), { x: 0, y: 0, w: cards[1].getBoundingClientRect().right + 12, h: vh });
    lblEls.forEach((o) => { o.pick = undefined; o.w = 0; });
    dirty = true;
  }

  function toProgress(y) {
    for (let i = 1; i < marks.length; i++) {
      const a = marks[i - 1], b = marks[i];
      if (y <= b.y) return clamp(a.p + (b.p - a.p) * (y - a.y) / Math.max(1, b.y - a.y));
    }
    return 1;
  }
  function toScroll(p) {
    for (let i = 1; i < marks.length; i++) {
      const a = marks[i - 1], b = marks[i];
      if (p <= b.p) return a.y + (b.y - a.y) * (p - a.p) / Math.max(1e-6, b.p - a.p);
    }
    return scrollLen;
  }
  function readProgress() {
    return toProgress(window.scrollY - sectionTop);
  }
  function quantize(p) {
    // bez animacji: scena przeskakuje do stanu karty, gdy karta wchodzi na linię czytania
    let q = 0;
    START.forEach((s, k) => { if (p >= s - 0.004) q = REST[k]; });
    return q;
  }
  function goTo(p) {
    // stan sceny jak najbliżej p, ale zawsze z widoczną kartą tego arkusza
    let y = toScroll(p);
    const k = START.reduce((m, s, i) => (p >= s ? i : m), 0);
    if (views[k]) y = clamp(y, views[k][0], views[k][1]);
    window.scrollTo({ top: sectionTop + y + 2, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  /* ---------- etykiety ---------- */
  const lblEls = new Map();
  const NS = 'http://www.w3.org/2000/svg';
  function buildLabels() {
    if (!ok) return;
    S.labels.forEach((l) => {
      const el = document.createElement('div');
      el.className = 'lbl lbl-' + l.kind + (l.alert ? ' is-alert' : '') + (l.gold ? ' is-gold' : '');
      el.textContent = l.text;
      labelsEl.appendChild(el);
      let line = null, dot = null;
      if (l.kind !== 'zone') {
        line = document.createElementNS(NS, 'line');
        dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '2.2');
        if (l.alert) { line.classList.add('alert'); dot.classList.add('alert'); }
        leaders.appendChild(line); leaders.appendChild(dot);
      }
      lblEls.set(l, { el, line, dot, w: 0, h: 0 });
    });
  }
  const pt = { x: 0, y: 0, ok: true }, ct = { x: 0, y: 0 }, cb = { x: 0, y: 0 };
  // Etykiety opisowe omijają panel warstw, tabliczkę, kolumnę kart i siebie nawzajem.
  // Kolejne próby: kierunek domyślny, lustrzany, potem przesunięte w pionie; poprzedni wybór ma pierwszeństwo, żeby etykieta nie skakała.
  const SIDES = [[1, 1], [-1, 1], [1, 0.4], [-1, 0.4], [1, 1.8], [-1, 1.8], [1, -1], [-1, -1], [1, 2.6], [-1, 2.6], [1, -1.8], [-1, -1.8]];
  const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  function updateLabels(p) {
    if (!ok) return;
    const k = mobile ? 0.6 : 1;
    const top = (mobile ? 56 : 64) + 4;
    const placed = [];
    S.labels.forEach((l) => {
      const o = lblEls.get(l);
      const [r0, r1] = l.range;
      let a = smooth(r0, r0 + 0.012, p) * (1 - smooth(r1 - 0.012, r1, p));
      if (mobile && l.col) a = 0;
      if (a < 0.01) {
        if (o.vis !== false) { o.el.style.opacity = 0; if (o.line) { o.line.style.opacity = 0; o.dot.style.opacity = 0; } o.vis = false; }
        return;
      }
      o.vis = true;
      S.project(l, pt);
      if (!o.w) { o.w = o.el.offsetWidth; o.h = o.el.offsetHeight; }
      let x, y, side = l.dx < 0 ? -1 : 1;
      if (l.kind === 'zone') {
        x = pt.x - o.w / 2; y = pt.y - o.h / 2;
      } else if (l.kind === 'num') {
        x = pt.x + l.dx * k - o.w / 2; y = pt.y + l.dy * k - o.h / 2;
        o.line.setAttribute('x1', pt.x); o.line.setAttribute('y1', pt.y);
        const dx = l.dx * k, dy = l.dy * k, d = Math.hypot(dx, dy) || 1;
        o.line.setAttribute('x2', pt.x + dx - dx / d * 12); o.line.setAttribute('y2', pt.y + dy - dy / d * 12);
      } else if (l.col) {
        // kolumna opisów obok obiektu: równe odstępy między górą a dołem kolumny (kolumna zaczyna się pod panelem warstw)
        S.projectPoint(l.colTop, ct); S.projectPoint(l.colBot, cb);
        const colX = l.col === 'r' ? ct.x + 18 : ct.x - 278;
        let t0 = ct.y;
        blocks.forEach((b) => { if (colX < b.x + b.w && colX + 260 > b.x && b.y <= t0 && t0 < b.y + b.h && b.y + b.h < cb.y - 60) t0 = b.y + b.h + 4; });
        const ly = t0 + (cb.y - t0) * (l.slot + 0.5) / l.of;
        x = l.col === 'r' ? ct.x + 18 : ct.x - 18 - o.w; y = ly - o.h / 2;
        o.line.setAttribute('x1', pt.x); o.line.setAttribute('y1', pt.y);
        o.line.setAttribute('x2', l.col === 'r' ? x : x + o.w); o.line.setAttribute('y2', ly);
      } else {
        const order = o.pick !== undefined ? [o.pick].concat(SIDES.map((_, i) => i)) : SIDES.map((_, i) => i);
        let best = null;
        for (const i of order) {
          const [sx, sy] = SIDES[i];
          const lx = pt.x + l.dx * k * sx, ly = pt.y + l.dy * k * sy;
          const r = { x: l.dx * sx < 0 ? lx - o.w : lx, y: ly - o.h / 2, w: o.w, h: o.h };
          let cost = r.x < 8 || r.x + r.w > vw - 8 || r.y < top || r.y + r.h > stageH - 4 ? 1e7 : 0;
          blocks.forEach((b) => { cost += area(r, b) * 4; });
          placed.forEach((b) => { cost += area(r, b) * 2; });
          if (!best || cost < best.cost) best = { i, lx, ly, r, cost, side: l.dx * sx < 0 ? -1 : 1 };
          if (cost === 0) break;
        }
        o.pick = best.i; side = best.side;
        x = best.r.x; y = best.r.y;
        o.line.setAttribute('x1', pt.x); o.line.setAttribute('y1', pt.y);
        o.line.setAttribute('x2', best.lx); o.line.setAttribute('y2', best.ly);
      }
      if (mobile && l.kind !== 'zone') {
        // na wąskim ekranie etykieta nie może wyjść poza krawędź
        const cx = Math.min(Math.max(8, x), vw - o.w - 8);
        if (cx !== x && o.line) { o.line.setAttribute('x2', cx + (side < 0 ? o.w : 0)); }
        x = cx;
      }
      placed.push({ x, y, w: o.w, h: o.h });
      if (o.dot) { o.dot.setAttribute('cx', pt.x); o.dot.setAttribute('cy', pt.y); o.dot.style.opacity = a; o.line.style.opacity = a; }
      o.el.style.opacity = a;
      o.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    });
  }

  /* ---------- tabliczka i warstwy ---------- */
  const tbSheet = $('#tb-sheet'), tbLayer = $('#tb-layer'), tbStatus = $('#tb-status');
  let lastHud = '';
  function sheetAt(p) { let s = SHEETS[0], i = 0; SHEETS.forEach((x, k) => { if (p >= x.p) { s = x; i = k; } }); return { s, i }; }
  function updateHud(p) {
    const { s, i } = sheetAt(p);
    const status = ok ? S.state.status : '—';
    const finale = p >= 0.885;
    const partial = finale && Object.values(layerOn).some((v) => !v);
    const key = s.n + status + finale + partial;
    if (key !== lastHud) {
      lastHud = key;
      tbSheet.textContent = `${s.n} / 06`;
      tbLayer.textContent = partial ? 'Wybrane' : s.layer;
      tbStatus.textContent = status;
      tbStatus.classList.toggle('is-stop', status === 'STOP');
      tbStatus.classList.toggle('is-run', status === 'PRACA');
      layersNav.classList.toggle('is-toggles', finale);
      $('#layers-title').textContent = finale ? 'Warstwy · przełącz' : 'Warstwy';
    }
    const cur = LAYER_OF_SHEET[i];
    layerBtns.forEach((b) => {
      const name = b.dataset.layer;
      if (finale) {
        b.setAttribute('aria-pressed', layerOn[name] ? 'true' : 'false');
        b.dataset.state = layerOn[name] ? 'on' : 'off';
      } else {
        b.removeAttribute('aria-pressed');
        b.dataset.state = name === cur ? 'current' : p >= LAYER_START[name] ? 'on' : 'off';
      }
    });
    if (!ok) {
      let f = 'p00'; FALLBACK.forEach(([q, n]) => { if (p >= q) f = n; });
      const img = $('#fallback');
      if (!img.src.endsWith(f + '.jpg')) img.src = `assets/fallback/${f}.jpg`;
    }
  }
  function setAllLayers(on) {
    Object.keys(layerOn).forEach((k) => { layerOn[k] = on; if (ok) S.setLayerVisible(k, on); });
  }
  layerBtns.forEach((b) => b.addEventListener('click', () => {
    const name = b.dataset.layer;
    if (target >= 0.885) {
      layerOn[name] = !layerOn[name];
      if (ok) S.setLayerVisible(name, layerOn[name]);
      dirty = true;
    } else {
      goTo(parseFloat(b.dataset.goto));
    }
  }));

  /* ---------- linki do arkuszy ---------- */
  $$('[data-goto]').forEach((a) => {
    if (a.closest('#layers')) return;
    a.addEventListener('click', (e) => { e.preventDefault(); goTo(parseFloat(a.dataset.goto)); });
  });

  /* ---------- pętla klatek ---------- */
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    target = readProgress();
    if (target < 0.885 && Object.values(layerOn).some((v) => !v)) setAllLayers(true);
    let changed = dirty;
    const goal = reduced.matches ? quantize(target) : target;
    if (Math.abs(goal - ps) > 0.00002) {
      ps = reduced.matches ? goal : ps + (goal - ps) * (1 - Math.exp(-dt * 9));
      if (Math.abs(goal - ps) < 0.0002) ps = goal;
      changed = true;
    }
    const live = ok && S.state.looping && !reduced.matches;
    if (inView && (changed || live)) {
      if (ok) {
        if (live) S.tick(dt);
        S.setProgress(ps);
        S.render();
        updateLabels(ps);
      }
      updateHud(ps);
      dirty = false;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- start ---------- */
  buildLabels();
  layout();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((en) => { inView = en[0].isIntersecting; if (inView) dirty = true; }, { rootMargin: '100px' }).observe(section);
  }
  window.addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lblEls.forEach((o) => { o.w = 0; }); layout(); });
  // wysokość kart decyduje o odcinkach przewijania, więc po każdej zmianie wysokości liczymy układ od nowa
  if ('ResizeObserver' in window) {
    let queued = false;
    const ro = new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; layout(); });
    });
    cards.forEach((c) => ro.observe(c));
  }
  reduced.addEventListener && reduced.addEventListener('change', () => { dirty = true; });

  const qp = params.get('p');
  if (qp !== null) {
    const p = clamp(parseFloat(qp) || 0);
    if (params.has('t') && ok) S.state.time = parseFloat(params.get('t')) || 0;
    const jump = () => { layout(); window.scrollTo(0, sectionTop + toScroll(p) + 1); ps = p; dirty = true; };
    jump();
    window.addEventListener('load', jump);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(jump);
  } else {
    ps = readProgress();
  }
  requestAnimationFrame(frame);
})();
