/* Synergy Engineering – stopka: duży napis SYNERGY z kropek rastra. Kropki rozstępują się przed kursorem
   i jaśnieją, gdy zejdą ze swojego miejsca, a kliknięcie puszcza przez litery falę.

   Na podstawie komponentu Halftone Wordmark Footer (Kedhareswer Naidu,
   https://21st.dev/@kedhareswer/components/halftone-wordmark-footer), przeniesionego z Reacta do zwykłego JS.
   Zmiany: kolory i krój z tokenów strony, bez kolumn linków, odstęp kropek zależny od szerokości ekranu,
   ziarno nakładane w klatce spoczynkowej, na ekranie dotykowym fala dopiero po stuknięciu,
   przy ograniczeniu ruchu napis stoi.

   Licencja oryginału (MIT):
   Copyright (c) Kedhareswer Naidu
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
   documentation files (the "Software"), to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
   to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all copies or substantial portions
   of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
   THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
   CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
   DEALINGS IN THE SOFTWARE. */
(function () {
  'use strict';
  const root = document.querySelector('.footer');
  const canvas = root && root.querySelector('.hwf-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const WORD = 'SYNERGY';
  const CROP = 0.2;    // część wysokości liter schowana pod dolną krawędzią strony
  const GRAIN = 0.5;   // ziarno druku, 0–1
  const FACE = '"Archivo", system-ui, sans-serif';

  /* ---------- czyste funkcje z komponentu, bez zmian ---------- */
  function hwfHex(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim());
    if (!m) return null;
    const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  // promień kropki z pokrycia komórki literą: pole kropki rośnie z pokryciem, więc ton jest równy
  function hwfRadius(coverage, gap) {
    const c = coverage < 0 ? 0 : coverage > 1 ? 1 : coverage;
    return Math.sqrt(c) * gap * 0.56;
  }
  // jeden krok sprężyny z powrotem na miejsce plus odpychanie od wskaźnika w promieniu r
  function hwfStep(x, y, vx, vy, hx, hy, px, py, r) {
    const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
    if (r > 0 && d2 < r * r) {
      const d = Math.sqrt(d2) + 0.001;
      const f = (1 - d / r) * 2.6;
      vx += (dx / d) * f;
      vy += (dy / d) * f;
    }
    vx = (vx + (hx - x) * 0.05) * 0.84;
    vy = (vy + (hy - y) * 0.05) * 0.84;
    return [x + vx, y + vy, vx, vy];
  }
  // 0 na miejscu, 1 po odsunięciu o span px lub więcej
  function hwfWarmth(x, y, hx, hy, span) {
    const d = Math.hypot(x - hx, y - hy);
    return span > 0 ? Math.min(1, d / span) : 0;
  }
  // rozmiar fontu, przy którym napis zmierzony w 100 px wypełnia szerokość
  function hwfFitSize(measured, width) {
    return measured > 0 ? (width / measured) * 100 : 0;
  }

  let bg = '#0A0A0B', inkHex = '#7E6532', ink = [126, 101, 50], warm = [226, 193, 126];
  let w = 0, h = 0, dpr = 1, gap = 6, radius = 80;
  let px = -1e5, py = -1e5, raf = 0, visible = true, awake = true;
  let ring = { x: 0, y: 0, t: -1 };
  let dots = new Float32Array(0), count = 0;   // na kropkę: x, y, vx, vy, x domowe, y domowe, promień
  let grainTile = null, grain = null;

  const token = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  // ta sama szeroka odmiana Archivo co w logo (font-stretch 125%)
  function setFont(m, size) {
    m.font = `800 expanded ${size}px ${FACE}`;
    if ('fontStretch' in m) m.fontStretch = 'expanded';
  }

  function layout() {
    bg = token('--void', bg);
    inkHex = token('--gold-lo', inkHex);
    ink = hwfHex(inkHex) || ink;
    warm = hwfHex(token('--gold-hi', '')) || warm;

    w = Math.max(1, Math.round(root.getBoundingClientRect().width));
    // odstęp kropek rośnie z szerokością (6 px przy 1440 jak w oryginale), więc litera ma wszędzie podobną liczbę kropek;
    // na telefonie najmniej 4 px, żeby kropki nie zlały się w pełny kolor
    gap = Math.max(4, Math.min(8, w / 240));
    radius = w < 700 ? 48 : 80;

    // napis wypełnia szerokość, więc wysokość pasa pod niego w stopce zależy tylko od szerokości
    const mask = document.createElement('canvas');
    const m = mask.getContext('2d', { willReadFrequently: true });
    if (!m) return;
    setFont(m, 100);
    const fit = hwfFitSize(m.measureText(WORD).width, w * 1.02);
    setFont(m, fit);
    const box = m.measureText(WORD);
    const cap = box.actualBoundingBoxAscent || fit * 0.7;
    root.style.setProperty('--hwf-word', Math.round(cap * (1 - CROP) + Math.min(44, Math.max(28, w * 0.03))) + 'px');
    h = Math.max(1, Math.round(root.getBoundingClientRect().height));

    // maska napisu w skali 1:1; zmiana rozmiaru płótna kasuje ustawienia kontekstu, więc font jeszcze raz
    mask.width = w;
    mask.height = h;
    setFont(m, fit);
    m.fillStyle = '#000';
    m.textBaseline = 'alphabetic';
    m.fillText(WORD, (w - box.width) / 2, h + cap * CROP);
    const img = m.getImageData(0, 0, w, h).data;

    const cols = Math.ceil(w / gap), rows = Math.ceil(h / gap);
    const tmp = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        // pokrycie: średnia krycia z 3×3 próbek komórki
        let sum = 0;
        for (let sy = 0; sy < 3; sy++) {
          for (let sx = 0; sx < 3; sx++) {
            const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
            const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
            sum += img[(y * w + x) * 4 + 3];
          }
        }
        const cov = sum / (9 * 255);
        if (cov < 0.06) continue;
        const hx = gx * gap + gap / 2, hy = gy * gap + gap / 2;
        tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap));
      }
    }
    dots = new Float32Array(tmp);
    count = tmp.length / 7;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    // stała płytka ziarna druku, rysowana raz i kładziona na każdą klatkę
    if (!grainTile) {
      grainTile = document.createElement('canvas');
      grainTile.width = grainTile.height = 256;
      const g = grainTile.getContext('2d');
      if (g) {
        const id = g.createImageData(256, 256);
        for (let i = 0; i < id.data.length; i += 4) {
          const v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }
    }
    awake = true;
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const still = reduced.matches;
    const r = still ? 0 : radius;
    const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
    const ringR = ringAge * 0.9;
    let moving = false;
    // każda kropka osobno, jak w oryginale: osobne koła rysują się szybciej niż jedna ścieżka z tysięcy kół
    for (let i = 0; i < count; i++) {
      const j = i * 7;
      let x = dots[j], y = dots[j + 1], vx = dots[j + 2], vy = dots[j + 3];
      const hx = dots[j + 4], hy = dots[j + 5];
      if (!still) {
        if (ringAge < 900) {
          const dx = hx - ring.x, dy = hy - ring.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
          if (band > 0) {
            const f = band * 3.2 * (1 - ringAge / 900);
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
        }
        [x, y, vx, vy] = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
        if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true;
        else { x = hx; y = hy; vx = 0; vy = 0; }
        dots[j] = x; dots[j + 1] = y; dots[j + 2] = vx; dots[j + 3] = vy;
      }
      const k = hwfWarmth(x, y, hx, hy, 28);
      ctx.fillStyle = k > 0.02
        ? 'rgb(' +
          Math.round(ink[0] + (warm[0] - ink[0]) * k) + ',' +
          Math.round(ink[1] + (warm[1] - ink[1]) * k) + ',' +
          Math.round(ink[2] + (warm[2] - ink[2]) * k) + ')'
        : inkHex;
      ctx.beginPath();
      ctx.arc(x, y, dots[j + 6], 0, 6.2832);
      ctx.fill();
    }

    // pętla zasypia, gdy wszystko wróciło na miejsce i nic nie pcha
    awake = moving || ringAge < 900 || (px > -1e4 && !still);
    // ziarno kładziemy na klatkę spoczynkową: w ruchu go nie widać, a bez karty graficznej kosztuje tyle co kropki
    if (!awake && grainTile && GRAIN > 0) {
      grain = grain || ctx.createPattern(grainTile, 'repeat');
      if (grain) {
        ctx.globalAlpha = Math.min(1, GRAIN) * 0.09;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  function loop(now) {
    raf = 0;
    if (!visible) return;
    draw(now);
    if (awake) raf = requestAnimationFrame(loop);
  }
  function wake() {
    awake = true;
    if (!raf && visible) raf = requestAnimationFrame(loop);
  }

  const local = (e) => { const b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const release = () => { px = py = -1e5; wake(); };
  function shock(e) {
    if (reduced.matches || e.target.closest('a,button')) return;
    const p = local(e);
    ring = { x: p[0], y: p[1], t: performance.now() };
    wake();
  }

  layout();
  draw(performance.now());
  wake();

  root.addEventListener('pointermove', (e) => {
    if (reduced.matches) return;
    [px, py] = local(e);
    wake();
  });
  root.addEventListener('pointerleave', release);
  root.addEventListener('pointercancel', release);   // palec przejął przewijanie strony
  // mysz: fala od razu; palec: dopiero po stuknięciu, żeby przewijanie po napisie nie puszczało fal
  root.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') shock(e); });
  root.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') shock(e); });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const r = root.getBoundingClientRect();
      if (Math.round(r.width) !== w || Math.round(r.height) !== h) { layout(); wake(); }
    }).observe(root);
  } else {
    window.addEventListener('resize', () => { layout(); wake(); });
  }
  if ('IntersectionObserver' in window) {
    // z zapasem 200 px: napis jest narysowany, zanim stopka wjedzie na ekran (także po skoku na koniec strony)
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) wake(); }, { rootMargin: '200px 0px' }).observe(root);
  }
  // font strony może dojść później: wtedy składamy napis jeszcze raz już właściwym krojem.
  // Samo fonts.ready nie wystarcza: bywa spełnione, zanim przeglądarka w ogóle zacznie ładować Archivo
  if (document.fonts && document.fonts.load) {
    document.fonts.load(`800 expanded 100px ${FACE}`).catch(() => {}).then(() => { layout(); wake(); });
  }
  reduced.addEventListener('change', () => { layout(); wake(); });
})();
