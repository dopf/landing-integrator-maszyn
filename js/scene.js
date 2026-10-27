/* Synergy Engineering – scena hali rysowana jak rysunek złożeniowy.
   Jednostki: metry. X w prawo (kierunek przepływu), Z do widza, Y w górę.
   Scena nie zna DOM-u strony: dostaje postęp przewijania p (0–1), czas pętli i układ ekranu,
   a na zewnątrz wystawia etykiety do rzutowania i status linii do tabliczki rysunkowej. */
(function () {
  'use strict';
  const T = window.THREE;
  if (!T) return;

  const COL = {
    void: 0x0a0a0b, floor: 0x0e0e10, carbon: 0x121214, fill: 0x151518, fill2: 0x1a1a1e,
    graphite: 0x232327, graphite2: 0x34343a, ash: 0x8a8780, bone: 0xede8dd,
    gold: 0xc9a45c, goldHi: 0xe2c17e, goldLo: 0x7e6532,
    red: 0xd7362b, yellow: 0xe8b720, load: 0x1d1912, loadEdge: 0x9a7d45
  };
  const GOLD = new T.Color(COL.gold);
  const HX = 25, HZ = 14;          // połowa wymiarów hali
  const TOP = 0.55;                // wysokość górnej krawędzi rolek przenośników na posadzce
  const DECK = 4.0;                // poziom pomostu antresoli
  const WALL_H = 5.0, WALL_LOW = 0.35, INNER_X = 17, INNER_H = 4.2;
  const SL_UP = 0.6 + TOP, SL_DOWN = 0.6;   // stół w wykopie: dno wykopu 0.6 m pod posadzką

  /* ---------- narzędzia ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const V = (x, y, z) => new T.Vector3(x, y, z);

  function fillMat(color, opacity = 1) {
    return new T.MeshBasicMaterial({
      color, transparent: true, opacity, depthWrite: opacity > 0.5,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: T.DoubleSide
    });
  }
  const lineMat = (color, opacity = 1) => new T.LineBasicMaterial({ color, transparent: true, opacity });
  const dashMat = (color, opacity = 1, dash = 0.6, gap = 0.4) =>
    new T.LineDashedMaterial({ color, transparent: true, opacity, dashSize: dash, gapSize: gap });

  function solid(geo, fill, edge, o = {}) {
    const g = new T.Group();
    if (fill !== null) g.add(new T.Mesh(geo, fillMat(fill, o.fillOpacity ?? 1)));
    if (edge !== null) g.add(new T.LineSegments(new T.EdgesGeometry(geo, o.angle ?? 25), lineMat(edge, o.edgeOpacity ?? 1)));
    return g;
  }
  function boxGeo(w, h, d) { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; }
  const box = (w, h, d, fill = COL.fill, edge = COL.bone, o) => solid(boxGeo(w, h, d), fill, edge, o);
  function cyl(r, h, fill = COL.fill, edge = COL.bone, o = {}) {
    const g = new T.CylinderGeometry(r, r, h, o.seg ?? 28); g.translate(0, h / 2, 0);
    return solid(g, fill, edge, o);
  }
  function at(obj, x, y, z, ry = 0) { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; }
  function segs(pairs, color, opacity = 1) {
    const arr = []; pairs.forEach((p) => arr.push(p[0], p[1], p[2]));
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
    return new T.LineSegments(geo, lineMat(color, opacity));
  }
  function densify(points, step) {
    const out = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const n = Math.max(1, Math.round(len / step));
      for (let k = 1; k <= n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n), lerp(a[2], b[2], k / n)]);
    }
    return out;
  }
  function poly(points, mat, step = 0.25) {
    const pts = step ? densify(points, step) : points;
    const arr = []; pts.forEach((p) => arr.push(p[0], p[1], p[2]));
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
    const l = new T.Line(geo, mat);
    if (mat.isLineDashedMaterial) l.computeLineDistances();
    l.userData.count = pts.length;
    l.userData.pts = pts;
    return l;
  }
  function rectPts(x0, z0, x1, z1, y = 0.03) { return [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]]; }

  /* ---------- rejestr pojawiania się elementów (wszystko odwracalne, zależne od p) ---------- */
  const anims = [];
  function collect(obj) {
    const mats = [], edges = [];
    obj.traverse((o) => {
      if (!o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.userData.shared) return;
        mats.push({ m, base: m.opacity });
        if (m.isLineBasicMaterial && !m.isLineDashedMaterial) edges.push({ m, c: m.color.clone() });
      });
    });
    return { mats, edges };
  }
  function reveal(obj, p0, p1, kind = 'fade', extra = {}) {
    const { mats, edges } = collect(obj);
    anims.push(Object.assign({ obj, p0, p1, kind, mats, edges, baseY: obj.position.y, h: 2.6 }, extra));
    return obj;
  }
  function setOp(a, k) { for (const e of a.mats) e.m.opacity = e.base * k; }
  function applyAnims(p) {
    for (const a of anims) {
      let t = seg(p, a.p0, a.p1);
      let out = 1;
      if (a.out) out = 1 - ease(seg(p, a.out[0], a.out[1]));
      const vis = t > 0.0005 && out > 0.0005;
      a.obj.visible = vis;
      if (!vis) continue;
      switch (a.kind) {
        case 'fade': setOp(a, ease(t) * out); break;
        case 'drop': {
          const s = easeOut(t);
          a.obj.position.y = a.baseY + (1 - s) * a.h;
          setOp(a, clamp(t * 2.4) * out);
          const g = smooth(0.55, 1, t);
          for (const e of a.edges) e.m.color.copy(GOLD).lerp(e.c, g);
          break;
        }
        case 'grow': a.obj.scale.y = Math.max(0.001, ease(t)); setOp(a, clamp(t * 3) * out); break;
        case 'draw': {
          const n = a.obj.userData.count;
          a.obj.geometry.setDrawRange(0, Math.max(2, Math.floor(ease(t) * n)));
          setOp(a, out);
          break;
        }
      }
    }
  }

  /* ---------- etykiety (rzutowane do HTML przez main.js) ---------- */
  const labels = [];
  function label(id, text, pos, range, o = {}) {
    labels.push(Object.assign({ id, text, pos: pos.isVector3 ? pos : V(...pos), range, kind: 'tag', dx: 26, dy: -30 }, o));
  }

  /* ---------- scena i kamera ---------- */
  let renderer, scene, camera, root;
  const layerGroups = {};
  const state = { p: 0, time: 0, status: 'PRACA', looping: false, stop: false, w: 1, h: 1, layout: { offX: -0.12, offY: 0, fitW: 92, fitH: 54 } };
  const walls = [];
  const moving = {};      // obiekty sterowane skryptem sekwencji
  const tmp = new T.Vector3();

  function group(name) { const g = new T.Group(); g.name = name; root.add(g); layerGroups[name] = g; return g; }

  /* ---------- hala ---------- */
  function hatchTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#121214'; x.fillRect(0, 0, 64, 64);
    x.strokeStyle = '#3a3a40'; x.lineWidth = 2;
    for (let i = -64; i < 128; i += 12) { x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 64, 0); x.stroke(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t;
  }
  function wall(len, thick, height, hatch) {
    const geo = new T.BoxGeometry(len, 1, thick); geo.translate(0, 0.5, 0);
    const side = fillMat(COL.carbon);
    const topTex = hatch.clone(); topTex.needsUpdate = true; topTex.repeat.set(len / 0.9, thick / 0.9);
    const top = new T.MeshBasicMaterial({ map: topTex, transparent: true });
    const mats = [side, side, top, side, side, side];
    const g = new T.Group();
    const mesh = new T.Mesh(geo, mats); g.add(mesh);
    g.add(new T.LineSegments(new T.EdgesGeometry(geo), lineMat(COL.graphite2, 1)));
    const l = len / 2, t = thick / 2;
    g.add(segs([[-l, 1, -t], [l, 1, -t], [-l, 1, t], [l, 1, t], [-l, 1, -t], [-l, 1, t], [l, 1, -t], [l, 1, t]], COL.gold, 0.75));
    g.scale.y = height;
    return g;
  }

  function buildHall() {
    const g = group('hala');
    const floor = new T.Mesh(new T.PlaneGeometry(HX * 2, HZ * 2), fillMat(COL.floor));
    floor.rotation.x = -Math.PI / 2; g.add(floor);
    const grid = [];
    for (let x = -HX; x <= HX; x += 2) grid.push([x, 0.005, -HZ], [x, 0.005, HZ]);
    for (let z = -HZ; z <= HZ; z += 2) grid.push([-HX, 0.005, z], [HX, 0.005, z]);
    g.add(segs(grid, COL.graphite, 0.75));

    const hatch = hatchTexture();
    const t = 0.35;
    const defs = [
      { len: HX * 2 + t, x: 0, z: -HZ - t / 2, ry: 0, n: [0, -1] },
      { len: HX * 2 + t, x: 0, z: HZ + t / 2, ry: 0, n: [0, 1] },
      { len: HZ * 2, x: -HX - t / 2, z: 0, ry: Math.PI / 2, n: [-1, 0] },
      { len: HZ * 2, x: HX + t / 2, z: 0, ry: Math.PI / 2, n: [1, 0] }
    ];
    defs.forEach((d) => { const w = at(wall(d.len, t, WALL_H, hatch), d.x, 0, d.z, d.ry); w.userData.n = d.n; g.add(w); walls.push(w); });

    // ściana wewnętrzna magazynu z otworem bramy (z od -9.3 do -6.7)
    const pieces = [[-HZ, -9.3], [-6.7, HZ]];
    pieces.forEach(([z0, z1]) => g.add(at(wall(z1 - z0, 0.3, INNER_H, hatch), INNER_X, 0, (z0 + z1) / 2, Math.PI / 2)));
    const lintel = at(wall(2.6, 0.3, INNER_H - 2.75, hatch), INNER_X, 2.75, -8.0, Math.PI / 2); g.add(lintel);

    // linie wymiarowe hali (jak na rysunku), znikają przy montażu
    const dim = new T.Group(); g.add(dim);
    const dz = HZ + 2.4, dx = HX + 2.4, tk = 0.45;
    const dp = [
      [-HX, 0.02, HZ + 0.5], [-HX, 0.02, dz + 0.6], [HX, 0.02, HZ + 0.5], [HX, 0.02, dz + 0.6],
      [-HX, 0.02, dz], [HX, 0.02, dz],
      [-HX - tk, 0.02, dz + tk], [-HX + tk, 0.02, dz - tk], [HX - tk, 0.02, dz + tk], [HX + tk, 0.02, dz - tk],
      [HX + 0.5, 0.02, -HZ], [dx + 0.6, 0.02, -HZ], [HX + 0.5, 0.02, HZ], [dx + 0.6, 0.02, HZ],
      [dx, 0.02, -HZ], [dx, 0.02, HZ],
      [dx - tk, 0.02, -HZ + tk], [dx + tk, 0.02, -HZ - tk], [dx - tk, 0.02, HZ + tk], [dx + tk, 0.02, HZ - tk]
    ];
    dim.add(segs(dp, COL.gold, 0.8));
    reveal(dim, -1, 0, 'fade', { out: [0.13, 0.17] });
    label('d-x', '50 000', [0, 0.02, dz], [-1, 0.16], { kind: 'zone', gold: true });
    label('d-z', '28 000', [dx, 0.02, 0], [-1, 0.16], { kind: 'zone', gold: true });

    // osoba „Ty” w pustej hali
    const you = at(person(), -3.5, 0, 1.5); g.add(you);
    reveal(you, -1, 0, 'fade', { out: [0.15, 0.175] });

    // strefy na posadzce (arkusz 01)
    const zones = new T.Group(); g.add(zones);
    const zDash = (pts, op = 0.55) => poly(pts, dashMat(COL.bone, op, 0.5, 0.35), 0);
    zones.add(zDash(rectPts(-22.5, 3.2, -14.2, 11.2)));
    zones.add(zDash(rectPts(3.6, -10.0, 12.0, -0.6)));
    // droga wózków i pieszych pod antresolą
    zones.add(poly([[-10.5, 0.02, -HZ], [-10.5, 0.02, HZ]], dashMat(COL.bone, 0.5, 1.0, 0.6), 0));
    zones.add(poly([[-5.5, 0.02, -HZ], [-5.5, 0.02, HZ]], dashMat(COL.bone, 0.5, 1.0, 0.6), 0));
    const zebra = [];
    for (let z = -HZ + 0.6; z < HZ; z += 0.9) zebra.push([-6.6, 0.02, z], [-5.9, 0.02, z]);
    zones.add(segs(zebra, COL.ash, 0.55));
    reveal(zones, 0.06, 0.11, 'fade', { out: [0.3, 0.36] });

    // trasa ładunku: złota linia przerywana, rysowana w arkuszu 01
    const route = poly([
      [-20, 0.03, 6], [-13.5, 0.03, 6], [-1.4, 0.03, 6], [-1.4, 0.03, -2.6], [4.6, 0.03, -2.6],
      [5.6, 0.03, -8], [17, 0.03, -8], [19.8, 0.03, -8], [19.8, 0.03, 4], [23.2, 0.03, 4]
    ], dashMat(COL.gold, 0.95, 0.7, 0.35), 0.3);
    g.add(route);
    reveal(route, 0.075, 0.14, 'draw', { out: [0.17, 0.24] });

    label('z-in', 'WEJŚCIE · WÓZEK WIDŁOWY', [-18.5, 0, 10.6], [0.07, 0.17], { kind: 'zone' });
    label('z-aisle', 'DROGA WÓZKÓW I PIESZYCH', [-8, 0, 12.4], [0.07, 0.17], { kind: 'zone' });
    label('z-cell', 'CELA PRZEPALETYZOWANIA', [7.8, 0, -0.9], [0.07, 0.17], { kind: 'zone' });
    label('z-wh', 'MAGAZYN WYSYŁKOWY', [21, 0, 10], [0.07, 0.17], { kind: 'zone' });
    label('z-route', 'TRASA ŁADUNKU', [-7, 0, 6], [0.1, 0.17], { kind: 'zone', dx: -40, dy: -46 });
  }

  /* ---------- elementy maszyn ---------- */
  function rollers(len, width = 1.05, top = TOP, pitch = 0.17, base = 0, legs = true) {
    const g = new T.Group();
    const bh = 0.14, bt = 0.07;
    [-1, 1].forEach((s) => g.add(at(box(len, bh, bt, COL.fill, COL.bone, { edgeOpacity: 0.9 }), 0, top - bh, s * width / 2)));
    if (legs && top - bh - base > 0.05) {
      const n = Math.max(2, Math.round(len / 1.7) + 1);
      for (let i = 0; i < n; i++) {
        const x = -len / 2 + 0.12 + i * (len - 0.24) / (n - 1);
        [-1, 1].forEach((s) => g.add(at(box(0.06, top - bh - base, 0.06, COL.fill, COL.bone, { edgeOpacity: 0.5 }), x, base, s * width / 2)));
      }
    }
    const pairs = [];
    for (let x = -len / 2 + pitch / 2; x < len / 2; x += pitch) pairs.push([x, top, -width / 2 + 0.04], [x, top, width / 2 - 0.04]);
    g.add(segs(pairs, COL.bone, 0.45));
    return g;
  }
  function chains(len, width = 1.3, top = TOP) {
    const g = new T.Group();
    const bh = 0.16;
    [-1, 1].forEach((s) => g.add(at(box(len, bh, 0.08, COL.fill, COL.bone, { edgeOpacity: 0.9 }), 0, top - bh, s * width / 2)));
    const n = Math.max(2, Math.round(len / 1.7) + 1);
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + 0.12 + i * (len - 0.24) / (n - 1);
      [-1, 1].forEach((s) => g.add(at(box(0.07, top - bh, 0.07, COL.fill, COL.bone, { edgeOpacity: 0.5 }), x, 0, s * width / 2)));
    }
    const pairs = [];
    [-0.42, 0, 0.42].forEach((z) => {
      pairs.push([-len / 2, top, z - 0.03], [len / 2, top, z - 0.03], [-len / 2, top, z + 0.03], [len / 2, top, z + 0.03]);
      for (let x = -len / 2; x < len / 2; x += 0.2) pairs.push([x, top, z - 0.03], [x, top, z + 0.03]);
    });
    g.add(segs(pairs, COL.bone, 0.5));
    return g;
  }
  function pallet(load = 1, wrapped = false, corners = false) {
    const g = new T.Group();
    g.add(box(1.2, 0.144, 0.8, 0x18150f, COL.ash, { edgeOpacity: 0.85 }));
    const lg = new T.Group(); lg.position.y = 0.144; g.add(lg);
    const h = 1.0;
    lg.add(box(1.16, h, 0.76, COL.load, COL.loadEdge, { edgeOpacity: 0.95 }));
    const p = [];
    [-0.193, 0.193].forEach((x) => p.push([x, 0, 0.381], [x, h, 0.381], [x, 0, -0.381], [x, h, -0.381], [x, h, -0.38], [x, h, 0.38]));
    [0.33, 0.66].forEach((y) => p.push([-0.58, y * h, 0.381], [0.58, y * h, 0.381], [0.581, y * h, -0.38], [0.581, y * h, 0.38], [-0.581, y * h, -0.38], [-0.581, y * h, 0.38]));
    p.push([-0.58, h, 0], [0.58, h, 0]);
    lg.add(segs(p, COL.loadEdge, 0.55));
    lg.scale.y = Math.max(0.001, load);
    g.userData.load = lg;
    const film = box(1.24, h + 0.06, 0.84, COL.bone, COL.bone, { fillOpacity: 0.07, edgeOpacity: 0.28 });
    film.position.y = 0.12; film.visible = wrapped; g.add(film);
    g.userData.film = film;
    // narożniki ochronne na krawędziach ładunku: zakłada je aplikator przy owijarce
    const cn = new T.Group(); cn.position.y = 0.144; cn.visible = corners; g.add(cn);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      cn.add(at(box(0.012, h, 0.08, COL.bone, null, { fillOpacity: 0.55 }), sx * 0.586, 0, sz * 0.34));
      cn.add(at(box(0.08, h, 0.012, COL.bone, null, { fillOpacity: 0.55 }), sx * 0.54, 0, sz * 0.386));
    });
    g.userData.corners = cn;
    return g;
  }
  function slipSheets() {
    const g = new T.Group();
    g.add(box(1.2, 0.144, 0.8, 0x18150f, COL.ash, { edgeOpacity: 0.85 }));
    g.add(at(box(1.18, 0.42, 0.78, 0x221e16, COL.loadEdge, { edgeOpacity: 0.9 }), 0, 0.144, 0));
    const p = [];
    for (let y = 0.2; y < 0.56; y += 0.06) p.push([-0.59, y, 0.391], [0.59, y, 0.391], [0.591, y, -0.39], [0.591, y, 0.39]);
    g.add(segs(p, COL.loadEdge, 0.45));
    return g;
  }
  function person(color = COL.bone) {
    // sylwetka jak na rysunku architektonicznym: nogi, tułów, ręce, głowa (wzrost ok. 1,72 m)
    const g = new T.Group();
    const part = (geo, x, y, z) => { const m = new T.Mesh(geo, fillMat(color, 0.92)); m.position.set(x, y, z); g.add(m); };
    [-0.1, 0.1].forEach((z) => part(new T.CapsuleGeometry(0.075, 0.62, 4, 10), 0, 0.42, z));
    part(new T.CapsuleGeometry(0.16, 0.42, 4, 12), 0, 1.12, 0);
    [-0.235, 0.235].forEach((z) => part(new T.CapsuleGeometry(0.055, 0.5, 4, 8), 0, 1.08, z));
    part(new T.SphereGeometry(0.115, 14, 10), 0, 1.6, 0);
    return g;
  }
  function lift(height = 6.2) {
    const g = new T.Group();
    const w = 1.9, d = 1.7;
    [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([x, z]) => g.add(at(box(0.12, height, 0.12, COL.fill, COL.bone, { edgeOpacity: 0.9 }), x, 0, z)));
    g.add(at(box(w + 0.12, 0.18, d + 0.12, COL.fill, COL.bone), 0, height, 0));
    g.add(at(box(0.5, 0.4, 0.5, COL.fill2, COL.bone), 0.5, height + 0.18, 0));
    const car = new T.Group();
    car.add(box(1.55, 0.12, 1.45, COL.fill2, COL.bone, { edgeOpacity: 0.9 }));
    car.add(rollers(1.5, 1.05, 0.12, 0.17, 0, false));
    car.position.y = TOP - 0.12;
    g.add(car);
    g.userData.car = car;
    return g;
  }
  function turntable(top = TOP, base = 0) {
    const g = new T.Group();
    g.add(at(cyl(0.85, top - 0.18 - base, COL.fill, COL.bone, { edgeOpacity: 0.9 }), 0, base, 0));
    const rot = new T.Group(); rot.position.y = 0; g.add(rot);
    rot.add(rollers(1.5, 1.2, top, 0.17, top - 0.2));
    g.userData.rot = rot;
    return g;
  }
  function crossTransfer() {
    const g = new T.Group();
    g.add(rollers(1.6, 1.25));
    const p = [];
    [-0.5, 0, 0.5].forEach((x) => p.push([x, TOP + 0.01, -0.62], [x, TOP + 0.01, 0.62]));
    g.add(segs(p, COL.gold, 0.85));
    g.add(at(box(1.0, 0.2, 1.0, COL.fill2, COL.bone, { edgeOpacity: 0.6 }), 0, 0.05, 0));
    return g;
  }
  function robot() {
    const g = new T.Group();
    g.add(box(1.0, 0.35, 1.0, COL.fill, COL.bone));
    const turret = new T.Group(); turret.position.y = 0.35; g.add(turret);
    turret.add(cyl(0.42, 0.35, COL.fill2, COL.bone));
    turret.add(at(box(0.55, 0.65, 0.5, COL.fill2, COL.bone), 0, 0.35, 0));
    const shoulder = new T.Group(); shoulder.position.set(0.1, 0.95, 0); turret.add(shoulder);
    const L1 = 1.5, L2 = 1.6;
    const up = box(L1, 0.26, 0.26, COL.fill2, COL.bone); up.children.forEach((c) => c.geometry.translate(L1 / 2, -0.13, 0)); shoulder.add(up);
    const elbow = new T.Group(); elbow.position.x = L1; shoulder.add(elbow);
    const fo = box(L2, 0.2, 0.2, COL.fill2, COL.bone); fo.children.forEach((c) => c.geometry.translate(L2 / 2, -0.1, 0)); elbow.add(fo);
    const wrist = new T.Group(); wrist.position.x = L2; elbow.add(wrist);
    const grip = box(0.18, 0.32, 0.18, COL.fill2, COL.bone); grip.children.forEach((c) => c.geometry.translate(0, -0.32, 0)); wrist.add(grip);
    const head = box(0.62, 0.08, 0.46, COL.fill2, COL.gold); head.position.y = -0.4; wrist.add(head);
    const carton = box(0.4, 0.26, 0.3, COL.load, COL.loadEdge); carton.position.y = -0.68; carton.visible = false; wrist.add(carton);
    g.userData = { turret, shoulder, elbow, wrist, L1, L2, carton };
    return g;
  }
  function solveArm(r, ag, x, y, z) {
    // r: robot (Group), cel w układzie świata; ramię w lokalnym +X wieżyczki
    const u = r.userData;
    const base = r.position;
    const dx = x - base.x, dz = z - base.z;
    u.turret.rotation.y = Math.atan2(-dz, dx) - r.rotation.y;
    const rr = Math.hypot(dx, dz) - 0.1;
    const v = y - (base.y + 0.35 + 0.95) + 0.72;
    const D = clamp(Math.hypot(rr, v), 0.4, u.L1 + u.L2 - 0.02);
    const c2 = clamp((D * D - u.L1 * u.L1 - u.L2 * u.L2) / (2 * u.L1 * u.L2), -1, 1);
    const t2 = -Math.acos(c2);
    const t1 = Math.atan2(v, rr) - Math.atan2(u.L2 * Math.sin(t2), u.L1 + u.L2 * Math.cos(t2));
    u.shoulder.rotation.z = t1;
    u.elbow.rotation.z = t2;
    u.wrist.rotation.z = -(t1 + t2);
    u.carton.visible = !!ag;
  }
  function destacker() {
    const g = new T.Group();
    g.add(rollers(1.6, 1.05));
    [[-0.8, -0.55], [0.8, -0.55], [-0.8, 0.55], [0.8, 0.55]].forEach(([x, z]) => g.add(at(box(0.1, 2.5, 0.1, COL.fill, COL.bone, { edgeOpacity: 0.85 }), x, 0, z)));
    g.add(at(box(1.7, 0.12, 1.2, COL.fill, COL.bone), 0, 2.5, 0));
    for (let i = 0; i < 9; i++) g.add(at(box(1.2, 0.144, 0.8, 0x18150f, COL.ash, { edgeOpacity: 0.7 }), 0, TOP + 0.02 + i * 0.16, 0, Math.PI / 2));
    return g;
  }
  function scissor(w = 1.3, d = 1.0, h = TOP) {
    const g = new T.Group();
    g.add(box(w, 0.08, d, COL.fill, COL.bone, { edgeOpacity: 0.7 }));
    const topG = new T.Group(); g.add(topG);
    topG.add(box(w, 0.1, d, COL.fill2, COL.bone));
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(8 * 3), 3));
    const x = new T.LineSegments(geo, lineMat(COL.gold, 0.9)); g.add(x);
    g.userData = { topG, x, w, d };
    setScissor(g, h);
    return g;
  }
  function setScissor(g, h) {
    const { topG, x, w, d } = g.userData;
    topG.position.y = Math.max(0.08, h - 0.1);
    const y0 = 0.08, y1 = Math.max(0.09, h - 0.1), a = w / 2 - 0.1;
    const pos = x.geometry.attributes.position;
    const pts = [];
    [-d / 2 + 0.06, d / 2 - 0.06].forEach((z) => pts.push([-a, y0, z], [a, y1, z], [-a, y1, z], [a, y0, z]));
    pts.forEach((p, i) => pos.setXYZ(i, p[0], p[1], p[2]));
    pos.needsUpdate = true;
  }
  function wrapper() {
    const g = new T.Group();
    const disc = new T.Group(); g.add(disc);
    disc.add(cyl(1.25, 0.12, COL.fill2, COL.bone, { seg: 40 }));
    disc.add(at(rollers(1.5, 1.1, TOP), 0, 0, 0));
    g.add(at(box(0.26, 3.0, 0.26, COL.fill, COL.bone), 0, 0, -1.65));
    // aplikator narożników: magazynek przy maszcie i ramię nad paletą
    g.add(at(box(0.2, 1.7, 0.2, COL.fill2, COL.bone, { edgeOpacity: 0.8 }), 0.4, 0, -1.65));
    g.add(at(box(0.08, 0.08, 0.6, COL.fill2, COL.bone, { edgeOpacity: 0.8 }), 0.4, 1.62, -1.3));
    const car = new T.Group(); car.position.set(0, 0.8, -1.42); g.add(car);
    car.add(box(0.5, 0.32, 0.3, COL.fill2, COL.gold));
    car.add(at(cyl(0.09, 0.5, 0xd8d2c4, COL.bone, { seg: 12 }), 0, -0.1, 0.22));
    g.userData = { disc, car };
    return g;
  }
  function speedDoor() {
    const g = new T.Group();
    [-1.42, 1.42].forEach((z) => g.add(at(box(0.22, 2.95, 0.22, COL.fill, COL.bone), 0, 0, z)));
    g.add(at(box(0.44, 0.45, 3.1, COL.fill2, COL.bone), 0, 2.85, 0));
    const curtain = new T.Group(); curtain.position.y = 2.85; g.add(curtain);
    const cg = new T.BoxGeometry(0.04, 2.6, 2.62); cg.translate(0, -1.3, 0);
    curtain.add(solid(cg, 0x1c1c21, COL.bone, { fillOpacity: 0.92, edgeOpacity: 0.85 }));
    const stripes = [];
    for (let y = -0.35; y > -2.6; y -= 0.45) stripes.push([0.03, y, -1.3], [0.03, y, 1.3]);
    curtain.add(segs(stripes, COL.ash, 0.4));
    g.userData = { curtain };
    return g;
  }
  function setDoor(d, open) { d.userData.curtain.scale.y = Math.max(0.035, 1 - open * 0.965); }
  function transferCar() {
    const g = new T.Group();
    [-0.62, 0.62].forEach((x) => g.add(at(box(0.08, 0.1, 13.4, COL.fill, COL.bone, { edgeOpacity: 0.7 }), x, 0, -1.9)));
    const car = new T.Group(); g.add(car);
    car.add(box(1.7, 0.28, 1.6, COL.fill2, COL.bone));
    car.add(at(rollers(1.5, 1.1, TOP), 0, 0, 0, 0));
    g.userData = { car };
    return g;
  }
  function forklift() {
    const g = new T.Group();
    g.add(box(1.9, 0.9, 1.1, COL.fill2, COL.bone));
    g.add(at(box(0.5, 0.7, 1.05, COL.fill, COL.bone), -0.75, 0.9, 0));
    const cage = [];
    [[-0.4, -0.5], [-0.4, 0.5], [0.5, -0.5], [0.5, 0.5]].forEach(([x, z]) => cage.push([x, 0.9, z], [x, 2.15, z]));
    cage.push([-0.4, 2.15, -0.5], [0.5, 2.15, -0.5], [-0.4, 2.15, 0.5], [0.5, 2.15, 0.5], [-0.4, 2.15, -0.5], [-0.4, 2.15, 0.5], [0.5, 2.15, -0.5], [0.5, 2.15, 0.5]);
    g.add(segs(cage, COL.bone, 0.8));
    [-0.35, 0.35].forEach((z) => g.add(at(box(0.08, 2.5, 0.08, COL.fill, COL.bone), 1.0, 0, z)));
    [-0.3, 0.3].forEach((z) => g.add(at(box(1.15, 0.05, 0.12, COL.fill, COL.bone), 1.62, 0.35, z)));
    const drv = person(); drv.scale.setScalar(0.8); drv.position.set(0.05, 0.75, 0); g.add(drv);
    g.add(at(pallet(1, true), 1.62, 0.4, 0, Math.PI / 2));
    return g;
  }
  function handTruck() {
    const p = [];
    [-0.27, 0.27].forEach((z) => p.push([0, 0.08, z], [1.15, 0.08, z]));
    p.push([0, 0.08, -0.27], [0, 0.08, 0.27], [0, 0.08, 0], [-0.25, 1.1, 0], [-0.25, 1.1, -0.15], [-0.25, 1.1, 0.15]);
    return segs(p, COL.bone, 0.85);
  }
  function mezzanine() {
    const g = new T.Group();
    g.add(at(box(12.2, 0.3, 6.0, COL.fill, COL.bone), -6.5, DECK - 0.3, 6.0));
    const cols = [[-12.4, 3.2], [-12.4, 8.8], [-3.7, 3.2], [-3.7, 8.8], [-0.8, 3.2], [-0.8, 8.8]];
    cols.forEach(([x, z]) => g.add(at(box(0.3, DECK - 0.3, 0.3, COL.fill, COL.bone, { edgeOpacity: 0.85 }), x, 0, z)));
    const r = [];
    const y = DECK + 1.1;
    [[-12.6, 3.0, -0.4, 3.0], [-12.6, 9.0, -0.4, 9.0], [-0.4, 6.9, -0.4, 9.0]].forEach(([x0, z0, x1, z1]) => {
      r.push([x0, y, z0], [x1, y, z1], [x0, DECK + 0.55, z0], [x1, DECK + 0.55, z1]);
      const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.5);
      for (let i = 0; i <= n; i++) { const xx = lerp(x0, x1, i / n), zz = lerp(z0, z1, i / n); r.push([xx, DECK, zz], [xx, y, zz]); }
    });
    g.add(segs(r, COL.bone, 0.6));
    return g;
  }

  /* ---------- warstwa 02: mechanika ---------- */
  function buildMech() {
    const g = group('mechanika');
    const P = 0.15, Q = 0.335;   // zakres montażu
    const step = (i, n) => [P + (Q - P) * (i / n), P + (Q - P) * (i / n) + 0.035];
    const N = 12;
    const put = (obj, i, h) => { g.add(obj); const [a, b] = step(i, N); reveal(obj, a, b, 'drop', { h: h ?? 2.6 }); return obj; };

    // 1 przenośniki rolkowe (wszystkie odcinki)
    put(at(rollers(4.5), -16.75, 0, 6), 0);
    put(mezzanine(), 1, 3.5);
    const l1 = put(at(lift(), -13.5, 0, 6), 2);
    const r2 = put(at(rollers(10.0, 1.05, DECK + TOP, 0.17, DECK), -7.4, 0, 6), 3, 1.8);
    const t1 = put(at(turntable(DECK + TOP, DECK), -1.4, 0, 6), 4, 1.6);
    const r3 = put(at(rollers(1.4, 1.05, DECK + TOP, 0.17, DECK), -1.4, 0, 4.25, Math.PI / 2), 4, 1.6);
    const l2 = put(at(lift(), -1.4, 0, 2.3, Math.PI / 2), 5);
    put(at(rollers(2.6), -1.4, 0, 0.0, Math.PI / 2), 5);
    put(at(crossTransfer(), -1.4, 0, -2.6), 6);
    put(at(chains(5.4), 2.5, 0, -2.6), 6);
    const rob = put(at(robot(), 6.4, 0, -5.2), 7, 3.2);
    const ss = put(at(slipSheets(), 8.8, 0, -3.4, Math.PI / 2), 7);
    put(at(destacker(), 1.4, 0, -8.0), 8);
    put(at(rollers(1.6), 3.2, 0, -8.0), 8);
    const sc = put(at(scissor(1.4, 1.1, TOP), 5.6, 0, -8.0), 8);
    put(at(rollers(5.6), 9.2, 0, -8.0), 9);
    const wr = put(at(wrapper(), 13.4, 0, -8.0), 9);
    put(at(rollers(2.3), 15.75, 0, -8.0), 10);
    const door = put(at(speedDoor(), INNER_X, 0, -8.0), 10, 1.5);
    put(at(rollers(1.5), 18.2, 0, -8.0), 10);
    const tc = put(at(transferCar(), 19.8, 0, 0), 11);
    put(at(rollers(1.6), 21.4, 0, 4.0), 11);
    // stół podnośny w wykopie: obrys wykopu + stół
    const pit = new T.Group();
    pit.add(poly(rectPts(22.45, 3.35, 23.95, 4.65, 0.02), lineMat(COL.bone, 0.7), 0));
    pit.add(at(box(1.5, 0.02, 1.3, 0x070708, null), 23.2, -0.01, 4.0));
    const sl = at(scissor(1.3, 1.1, SL_UP), 23.2, -0.6, 4.0); pit.add(sl);
    put(pit, 11);

    // statyczne palety (do arkusza 06, potem przejmuje pętla)
    const sp = new T.Group(); g.add(sp);
    sp.add(at(pallet(1, true), -18.5, TOP, 6));
    sp.add(at(pallet(1, true), 4.6, TOP, -2.6, Math.PI / 2));
    sp.add(at(pallet(0.45), 5.6, TOP, -8.0));
    sp.add(at(pallet(1, true, true), 21.4, TOP, 4.0));
    reveal(sp, 0.325, 0.345, 'fade', { out: [0.885, 0.895] });

    // ludzie przy maszynach (02)
    const fl = at(forklift(), -21.6, 0, 6.0); g.add(fl); reveal(fl, 0.17, 0.2, 'fade');
    const ped = at(person(), -7.6, 0, 9.6); g.add(ped); reveal(ped, 0.2, 0.23, 'fade');
    const op = at(person(), 23.2, 0, 7.6); g.add(op); reveal(op, 0.31, 0.335, 'fade');
    const ht = at(handTruck(), 23.2, 0, 7.2, Math.PI / 2); g.add(ht); reveal(ht, 0.31, 0.335, 'fade');

    moving.robot = rob; moving.t1 = t1; moving.l1 = l1; moving.l2 = l2; moving.wrapper = wr; moving.door = door;
    moving.tc = tc; moving.sl = sl; moving.sc = sc; moving.staticPallets = sp; moving.ped = ped;
    solveArm(rob, false, 5.2, 2.6, -4.4);

    const R = [0.2, 0.89];
    const n = (id, num, pos, o = {}) => label(id, String(num), pos, o.range || R, Object.assign({ kind: 'num' }, o));
    n('m1a', 1, [-17.5, TOP, 6.5], { range: [step(0, N)[1], 0.36] });
    n('m1b', 1, [-9, DECK + TOP, 6.5], { range: [step(3, N)[1], 0.36] });
    n('m1c', 1, [9.5, TOP, -7.5], { range: [step(9, N)[1], 0.36] });
    n('m1d', 1, [21.4, TOP, 4.5], { range: [step(11, N)[1], 0.36] });
    n('m2a', 2, [-13.5, 6.4, 6], { range: [step(2, N)[1], 0.36] });
    n('m2b', 2, [-1.4, 6.4, 2.3], { range: [step(5, N)[1], 0.36] });
    n('m3', 3, [-1.4, DECK + TOP, 6.6], { range: [step(4, N)[1], 0.36] });
    n('m4', 4, [-1.4, TOP, -2.0], { range: [step(6, N)[1], 0.36], dx: -30 });
    n('m5', 5, [2.5, TOP, -2.0], { range: [step(6, N)[1], 0.36] });
    n('m6', 6, [6.4, 2.8, -5.2], { range: [step(7, N)[1], 0.36] });
    n('m7', 7, [1.4, 2.6, -8.0], { range: [step(8, N)[1], 0.36], dx: -30 });
    n('m8', 8, [13.4, 3.0, -9.6], { range: [step(9, N)[1], 0.36] });
    n('m9', 9, [INNER_X, 3.3, -8.0], { range: [step(10, N)[1], 0.36] });
    n('m10', 10, [19.8, TOP, -0.5], { range: [step(11, N)[1], 0.36] });
    n('m11', 11, [23.2, 0.2, 3.4], { range: [step(11, N)[1], 0.36], dy: 28 });
  }

  /* ---------- warstwa 03: automatyka i elektryka ---------- */
  function estop(h = 1.05, facing = 0) {
    // żółta obudowa na słupku, czerwony grzybek wystaje z frontu (lokalne +Z)
    const g = new T.Group();
    if (h > 0) g.add(box(0.07, h, 0.07, COL.fill, COL.ash, { edgeOpacity: 0.7 }));
    const head = new T.Group(); head.position.y = h; head.rotation.y = facing; g.add(head);
    head.add(box(0.15, 0.15, 0.11, COL.yellow, 0xb88f12));
    const stem = new T.CylinderGeometry(0.034, 0.034, 0.035, 16); stem.rotateX(Math.PI / 2); stem.translate(0, 0.075, 0.072);
    head.add(solid(stem, COL.yellow, 0xb88f12));
    const mush = new T.CylinderGeometry(0.062, 0.068, 0.04, 20); mush.rotateX(Math.PI / 2); mush.translate(0, 0.075, 0.108);
    head.add(solid(mush, COL.red, 0x8f2019, { angle: 30 }));
    return g;
  }
  function boxBatch(items, fill, edge, edgeOp = 0.85) {
    // wiele jednakowych prostopadłościanów (aparatura w szafie): jedno wywołanie rysowania na wypełnienia i jedno na krawędzie
    const g = new T.Group();
    const geo = new T.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const inst = new T.InstancedMesh(geo, fillMat(fill), items.length);
    const m = new T.Matrix4();
    const pts = [];
    const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    items.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d); m.setPosition(b.x, b.y, b.z); inst.setMatrixAt(i, m);
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, y0 = b.y, y1 = b.y + b.h, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
      const c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      E.forEach(([a, k]) => pts.push(c[a], c[k]));
    });
    inst.instanceMatrix.needsUpdate = true;
    g.add(inst);
    if (edge !== null) g.add(segs(pts, edge, edgeOp));
    return g;
  }
  function photo(x, y, z, alongX = true, w = 1.2) {
    const g = new T.Group();
    const a = alongX ? [x, y, z - w / 2] : [x - w / 2, y, z];
    const b = alongX ? [x, y, z + w / 2] : [x + w / 2, y, z];
    g.add(at(box(0.09, 0.09, 0.09, COL.fill2, COL.gold), a[0], a[1] - 0.045, a[2]));
    g.add(at(box(0.09, 0.09, 0.09, COL.fill2, COL.gold), b[0], b[1] - 0.045, b[2]));
    g.add(segs([a, b], COL.goldHi, 0.8));
    return g;
  }
  function induct(x, y, z) {
    const g = new T.Group();
    const c = new T.CylinderGeometry(0.035, 0.035, 0.14, 10); c.rotateZ(Math.PI / 2);
    g.add(solid(c, COL.fill2, COL.gold));
    const ring = new T.Mesh(new T.RingGeometry(0.12, 0.16, 28), fillMat(COL.goldHi, 0.8));
    ring.rotation.x = -Math.PI / 2; g.add(ring);
    g.position.set(x, y, z);
    g.userData.ring = ring;
    return g;
  }
  function buildCabinet(g) {
    const cab = new T.Group(); at(cab, -4.0, 0, -13.25); g.add(cab);
    const W = 2.4, H = 2.1, D = 0.6;
    cab.add(box(W + 0.04, 0.1, D, COL.fill, COL.bone));
    const body = new T.Group(); body.position.y = 0.1; cab.add(body);
    // korpus bez frontu
    const shell = [];
    const hw = W / 2, hd = D / 2;
    [[-hw, -hd, -hw, hd], [hw, -hd, hw, hd]].forEach(([x0, z0, x1, z1]) => {
      shell.push([x0, 0, z0], [x1, 0, z1], [x0, H, z0], [x1, H, z1], [x0, 0, z1], [x0, H, z1], [x0, 0, z0], [x0, H, z0]);
    });
    shell.push([-hw, H, -hd], [hw, H, -hd], [-hw, 0, -hd], [hw, 0, -hd]);
    body.add(segs(shell, COL.bone, 0.95));
    const sideGeo = new T.PlaneGeometry(D, H); sideGeo.translate(0, H / 2, 0);
    [-hw, hw].forEach((x) => { const m = new T.Mesh(sideGeo, fillMat(COL.fill)); m.rotation.y = Math.PI / 2; m.position.x = x; body.add(m); });
    const tm = new T.Mesh(new T.PlaneGeometry(W, D), fillMat(COL.fill)); tm.rotation.x = -Math.PI / 2; tm.position.y = H; body.add(tm);

    // płyta montażowa (wysuwa się przy „rozstrzale”); aparatura w rzędach między korytkami, x od -1.0 do 1.0
    const plate = new T.Group(); plate.position.z = -hd + 0.04; plate.userData.restZ = plate.position.z; body.add(plate);
    plate.add(at(box(W - 0.16, H - 0.16, 0.02, 0x101012, COL.graphite2), 0, 0.08, 0));
    const DUCT = [1.9, 1.6, 1.31, 0.86, 0.58, 0.32, 0.1];
    plate.add(boxBatch(DUCT.map((y) => ({ x: 0, y: y - 0.03, z: 0.045, w: 2.08, h: 0.06, d: 0.07 }))
      .concat([-1.07, 1.07].map((x) => ({ x, y: 0.07, z: 0.045, w: 0.07, h: 1.86, d: 0.07 }))), 0x1d1d22, COL.ash, 0.5));
    const rails = []; [1.76, 1.45, 1.07, 0.71, 0.44, 0.2].forEach((y) => rails.push([-1.02, y, 0.02], [1.02, y, 0.02]));
    plate.add(segs(rails, COL.ash, 0.7));

    const grey = [], gold = [], yel = [], wires = [];
    const put = (list, x, y, w, h, d) => {
      list.push({ x, y, z: 0.012 + d / 2, w, h, d });
      const above = DUCT.slice().reverse().find((v) => v - 0.03 > y + h);
      const below = DUCT.find((v) => v + 0.03 < y);
      if (above !== undefined) wires.push([x, y + h, 0.04], [x, above - 0.03, 0.04]);
      if (below !== undefined) wires.push([x, y, 0.04], [x, below + 0.03, 0.04]);
    };
    const run = (list, n, x0, pitch, y, w, h, d, every) => {
      for (let i = 0; i < n; i++) put(every && i % every === every - 1 ? gold : list, x0 + i * pitch, y, w, h, d);
      return x0 + n * pitch;
    };
    // rząd A: zabezpieczenia, różnicówki, zasilacze 24 V, przełącznik sieciowy, przekaźniki kontrolne
    let x = run(grey, 24, -0.98, 0.019, 1.7, 0.017, 0.09, 0.07);
    x = run(grey, 2, x + 0.02, 0.037, 1.7, 0.035, 0.09, 0.075);
    put(grey, x + 0.08, 1.69, 0.09, 0.12, 0.12); put(grey, x + 0.18, 1.69, 0.09, 0.12, 0.12);
    put(gold, x + 0.33, 1.69, 0.15, 0.12, 0.08);
    x = run(grey, 6, x + 0.45, 0.024, 1.7, 0.0225, 0.09, 0.07);
    x = run(grey, 14, x + 0.03, 0.019, 1.7, 0.017, 0.09, 0.07);
    put(grey, x + 0.05, 1.7, 0.05, 0.08, 0.06);
    run(grey, 8, x + 0.11, 0.019, 1.7, 0.017, 0.09, 0.07);
    // rząd B: PLC z modułami wejść/wyjść, sterownik bezpieczeństwa, przekaźniki bezpieczeństwa i sprzęgające
    put(gold, -0.92, 1.38, 0.13, 0.14, 0.11);
    x = run(gold, 14, -0.84, 0.026, 1.38, 0.024, 0.14, 0.1);
    put(gold, x + 0.02, 1.38, 0.04, 0.14, 0.1);
    put(yel, x + 0.14, 1.385, 0.1, 0.13, 0.1);
    x = run(yel, 6, x + 0.21, 0.026, 1.385, 0.024, 0.13, 0.1);
    x = run(yel, 4, x + 0.04, 0.024, 1.39, 0.0225, 0.1, 0.09);
    x = run(grey, 22, x + 0.05, 0.0135, 1.39, 0.0125, 0.08, 0.07);
    run(grey, 16, x + 0.03, 0.0135, 1.39, 0.0125, 0.08, 0.07);
    // rząd C: falowniki, serwonapędy, filtry
    x = run(grey, 8, -0.9, 0.18, 0.92, 0.16, 0.3, 0.17);
    put(grey, x, 0.93, 0.07, 0.28, 0.19); put(grey, x + 0.09, 0.93, 0.07, 0.28, 0.19);
    run(grey, 3, x + 0.2, 0.08, 0.95, 0.06, 0.22, 0.1);
    // rząd D: wyłączniki silnikowe i styczniki
    x = run(grey, 12, -0.97, 0.047, 0.66, 0.045, 0.09, 0.08);
    x = run(grey, 20, x + 0.04, 0.047, 0.66, 0.045, 0.085, 0.09);
    run(grey, 4, x + 0.04, 0.047, 0.66, 0.045, 0.085, 0.09);
    // rzędy E i F: złączki na szynach DIN (co któraś z oznacznikiem)
    run(grey, 176, -0.98, 0.0112, 0.405, 0.0102, 0.07, 0.055, 10);
    run(grey, 118, -0.98, 0.0168, 0.165, 0.0155, 0.075, 0.06, 12);

    plate.add(boxBatch(grey, 0x202026, COL.bone, 0.75));
    plate.add(boxBatch(gold, 0x202026, COL.gold, 0.95));
    plate.add(boxBatch(yel, COL.yellow, 0xb88f12, 0.95));
    plate.add(segs(wires, COL.ash, 0.4));

    // front szafy: dwa skrzydła z aparaturą drzwiową. W rozstrzale front wysuwa się do przodu,
    // skrzydła stają się półprzezroczyste i obrysowane linią przerywaną (jak części przyległe na rysunku)
    const front = new T.Group(); front.position.z = hd; body.add(front);
    const leaves = new T.Group(); front.add(leaves);
    [-hw / 2, hw / 2].forEach((cx) => leaves.add(at(box(hw - 0.01, H, 0.03, COL.fill2, COL.bone), cx, 0, 0)));
    [-1, 1].forEach((sgn) => leaves.add(at(box(0.03, 0.22, 0.04, 0x2a2a30, COL.ash), sgn * 0.08, 1.0, 0.03)));
    const leafMats = collect(leaves).mats.map((e) => Object.assign(e, { line: e.m.isLineBasicMaterial }));
    const phantom = poly([[-hw, 0, 0.02], [hw, 0, 0.02], [hw, H, 0.02], [-hw, H, 0.02], [-hw, 0, 0.02]], dashMat(COL.gold, 0, 0.12, 0.06), 0);
    front.add(phantom);
    front.add(poly([[0, 0, 0.02], [0, H, 0.02]], dashMat(COL.gold, 0, 0.12, 0.06), 0));
    const phantomMats = [phantom.material, front.children[front.children.length - 1].material];
    // lewe skrzydło: panel HMI, lampki, E-stop i reset
    const hmi = at(box(0.46, 0.33, 0.04, 0x0d0d0f, COL.gold), -0.6, 1.4, 0.03); front.add(hmi);
    hmi.add(at(box(0.38, 0.23, 0.01, 0x15130e, COL.goldHi, { edgeOpacity: 0.8 }), 0, 0.05, 0.03));
    [[-0.74, COL.bone], [-0.62, COL.gold], [-0.5, COL.red]].forEach(([x0, c]) => {
      const lg = new T.CylinderGeometry(0.024, 0.024, 0.03, 12); lg.rotateX(Math.PI / 2); lg.translate(x0, 1.25, 0.03);
      front.add(solid(lg, c, c));
    });
    front.add(at(estop(0), -0.74, 0.98, 0.015));
    const rs = new T.CylinderGeometry(0.03, 0.03, 0.03, 14); rs.rotateX(Math.PI / 2); rs.translate(-0.5, 1.05, 0.03);
    front.add(solid(rs, COL.bone, COL.ash));
    // prawe skrzydło: wyłącznik główny z napędem drzwiowym i wentylator z filtrem
    const ms = new T.Group(); ms.position.set(0.72, 1.2, 0.03); front.add(ms);
    ms.add(at(box(0.18, 0.18, 0.012, COL.yellow, 0xb88f12), 0, -0.09, 0));
    const handle = box(0.04, 0.15, 0.05, COL.red, 0x8f2019); handle.position.set(0, -0.075, 0.03); handle.rotation.z = 0.5; ms.add(handle);
    const fan = new T.Group(); fan.position.set(0.6, 0.22, 0.02); front.add(fan);
    fan.add(box(0.3, 0.3, 0.02, 0x15151a, COL.bone));
    const fl = []; for (let i = 1; i < 7; i++) fl.push([-0.13, 0.043 * i, 0.012], [0.13, 0.043 * i, 0.012]);
    fan.add(segs(fl, COL.ash, 0.7));
    g.userData.cab = { cab, plate, front, frontZ: hd, leafMats, phantomMats };
    // serwisant
    const tech = at(person(), -7.0, 0, -12.2); g.add(tech);
    reveal(tech, 0.44, 0.47, 'fade');

    // opisy w dwóch kolumnach po bokach szafy (kolejność slotów od góry)
    const R = [0.455, 0.515];
    const w = (v) => V(-4.0 + v[0], 0.1 + v[1], -13.25 - hd + 0.04 + v[2]);
    const colL = { top: V(-5.3, 2.25, -12.95), bot: V(-5.3, 0.15, -12.95) };
    const colR = { top: V(-2.7, 2.25, -12.95), bot: V(-2.7, 0.15, -12.95) };
    const inL = (id, text, v, slot) => label(id, text, w(v), R, { obj: plate, col: 'l', slot, of: 7, colTop: colL.top, colBot: colL.bot });
    const inR = (id, text, v, slot) => label(id, text, w(v), R, { obj: plate, col: 'r', slot, of: 5, colTop: colR.top, colBot: colR.bot });
    const onFront = (lx, ly, lz) => () => { tmp.set(lx, ly, lz); front.localToWorld(tmp); return tmp; };
    inL('c-fuse', 'ZABEZPIECZENIA', [-0.75, 1.79, 0.08], 0);
    inL('c-plc', 'STEROWNIK PLC', [-0.86, 1.5, 0.11], 1);
    label('c-hmi', 'PANEL HMI', V(0, 0, 0), R, { col: 'l', slot: 2, of: 7, colTop: colL.top, colBot: colL.bot, follow: onFront(-0.6, 1.45, 0.06) });
    inL('c-vfd', 'FALOWNIKI', [-0.72, 1.15, 0.17], 3);
    label('c-es', 'E-STOP · RESET', V(0, 0, 0), R, { col: 'l', slot: 4, of: 7, colTop: colL.top, colBot: colL.bot, follow: onFront(-0.74, 1.05, 0.13) });
    inL('c-mpcb', 'WYŁĄCZNIKI SILNIKOWE', [-0.8, 0.74, 0.08], 5);
    inL('c-din', 'ZŁĄCZKI NA SZYNACH DIN', [-0.6, 0.45, 0.06], 6);
    inR('c-psu', 'ZASILACZE 24 V · PRZEŁĄCZNIK', [0.0, 1.8, 0.1], 0);
    inR('c-safe', 'STEROWNIK BEZPIECZEŃSTWA', [0.05, 1.5, 0.1], 1);
    label('c-main', 'WYŁĄCZNIK GŁÓWNY', V(0, 0, 0), R, { col: 'r', slot: 2, of: 5, colTop: colR.top, colBot: colR.bot, follow: onFront(0.72, 1.12, 0.06) });
    inR('c-rel', 'PRZEKAŹNIKI', [0.55, 1.46, 0.07], 3);
    inR('c-ctr', 'STYCZNIKI', [0.4, 0.74, 0.09], 4);
  }
  function buildAuto() {
    const g = group('automatyka');
    const A = 0.35, B = 0.41;
    // trasy kablowe (rysowane od szafy)
    const y = 3.3;
    const runs = [
      [[-4.0, 2.3, -13.6], [-4.0, y, -13.6], [-14.0, y, -13.6], [-14.0, y, 5.0], [-18.5, y, 5.0]],
      [[-4.0, y, -13.6], [-1.4, y, -13.6], [-1.4, y, -3.4], [3.0, y, -3.4]],
      [[-1.4, y, -13.6], [12.8, y, -13.6], [12.8, y, -9.6], [15.6, y, -9.6]],
      [[12.8, y, -13.6], [19.8, y, -13.6], [19.8, y, -10.0]],
      [[-14.0, y, 2.0], [-6.5, DECK + 1.6, 2.0], [-1.4, DECK + 1.6, 2.0]],
      [[19.8, y, -13.6], [24.4, y, -13.6], [24.4, y, 4.0], [23.6, y, 4.0]]
    ];
    runs.forEach((r, i) => {
      const l = poly(r, lineMat(COL.gold, 0.95), 0.2); g.add(l);
      reveal(l, A + i * 0.006, B + i * 0.006, 'draw');
      const l2 = poly(r.map((p) => [p[0], p[1] + 0.1, p[2]]), lineMat(COL.goldLo, 0.9), 0.2); g.add(l2);
      reveal(l2, A + i * 0.006, B + i * 0.006, 'draw');
    });
    // czujniki fotoelektryczne
    const ph = [photo(-15.0, TOP + 0.25, 6), photo(-7.0, DECK + TOP + 0.25, 6), photo(4.2, TOP + 0.3, -2.6, true, 1.4), photo(11.2, TOP + 0.25, -8.0), photo(21.0, TOP + 0.25, 4.0)];
    ph.forEach((o, i) => { g.add(o); reveal(o, 0.37 + i * 0.006, 0.39 + i * 0.006, 'fade'); });
    // czujniki indukcyjne z impulsem
    const ind = [induct(-0.55, DECK + 0.4, 6.75), induct(-0.55, 0.3, -1.85), induct(19.8, 0.15, -8.75), induct(19.8, 0.15, 4.75), induct(12.0, 0.2, -8.6)];
    ind.forEach((o, i) => { g.add(o); reveal(o, 0.375 + i * 0.006, 0.395 + i * 0.006, 'fade'); });
    moving.induct = ind;
    // bramka kontroli konturu na wejściu
    const cc = new T.Group(); at(cc, -16.2, 0, 6); g.add(cc);
    [-0.85, 0.85].forEach((z) => cc.add(at(box(0.1, 2.1, 0.1, COL.fill2, COL.gold), 0, 0, z)));
    cc.add(at(box(0.1, 0.1, 1.8, COL.fill2, COL.gold), 0, 2.1, 0));
    const grid = [];
    for (let yy = 0.7; yy <= 1.95; yy += 0.18) grid.push([0, yy, -0.8], [0, yy, 0.8]);
    for (let zz = -0.6; zz <= 0.61; zz += 0.3) grid.push([0, 2.08, zz], [0, 0.6, zz]);
    cc.add(segs(grid, COL.goldHi, 0.5));
    reveal(cc, 0.365, 0.385, 'fade');
    // skaner kodów QR za owijarką
    const qr = new T.Group(); at(qr, 14.6, 0, -9.35); g.add(qr);
    qr.add(box(0.07, 1.6, 0.07, COL.fill, COL.ash));
    qr.add(at(box(0.16, 0.12, 0.12, COL.fill2, COL.gold), 0, 1.6, 0));
    const fan = new T.BufferGeometry();
    fan.setAttribute('position', new T.Float32BufferAttribute([0, 1.62, 0.06, -0.45, 0.7, 0.75, 0.45, 0.7, 0.75], 3));
    const fanM = new T.Mesh(fan, fillMat(COL.goldHi, 0.16)); qr.add(fanM);
    qr.add(segs([[0, 1.62, 0.06], [-0.45, 0.7, 0.75], [0, 1.62, 0.06], [0.45, 0.7, 0.75]], COL.goldHi, 0.6));
    moving.qrFan = fanM;
    reveal(qr, 0.385, 0.4, 'fade');
    // sterownik robota (szafka przy celi)
    const rc = at(box(0.7, 1.2, 0.55, COL.fill2, COL.gold), 2.6, 0, -11.2); g.add(rc); reveal(rc, 0.39, 0.41, 'fade');
    moving.robotCtrl = rc;
    // wyłączniki awaryjne
    const ES = [[-18.6, 0, 7.2, 0], [10.8, 0, 0.0, 0], [13.4, 0, -6.3, 0], [22.3, 0, 5.7, 0], [-6.0, DECK, 8.6, Math.PI]];
    ES.forEach(([x, y, z, f], i) => { const e = at(estop(1.05, f), x, y, z); g.add(e); reveal(e, 0.395 + i * 0.005, 0.41 + i * 0.005, 'drop', { h: 0.6 }); });
    // operator przy wyłączniku przy drzwiach celi
    const op = at(person(), 11.4, 0, 0.6); g.add(op); reveal(op, 0.4, 0.42, 'fade');
    buildCabinet(g);
    reveal(g.userData.cab.cab, 0.36, 0.39, 'drop', { h: 1.2 });

    const R = [0.375, 0.435];
    label('a-cc', 'KONTROLA KONTURU', [-16.2, 2.2, 6], R, { dx: 30, dy: -54 });
    label('a-photo', 'CZUJNIKI FOTOELEKTRYCZNE', [4.2, TOP + 0.3, -1.9], R, { dx: 34, dy: -60 });
    label('a-ind', 'CZUJNIKI INDUKCYJNE', [19.8, 0.15, -8.75], R, { dx: 30, dy: -56 });
    label('a-qr', 'SKANER KODÓW QR', [14.6, 1.7, -9.35], R, { dx: 30, dy: -70 });
    label('a-es', 'WYŁĄCZNIKI AWARYJNE', [10.8, 1.25, 0.0], R, { dx: 30, dy: 40 });
    label('a-tray', 'TRASY KABLOWE', [-9, 3.3, -13.6], R, { dx: -40, dy: -40 });
    label('a-cab', 'SZAFA STEROWNICZA', [-4.0, 2.3, -13.25], R, { dx: 40, dy: -50 });
  }

  /* ---------- warstwa 04: bezpieczeństwo ---------- */
  function fenceRun(x0, z0, x1, z1, h = 2.2, gaps = []) {
    const p = [];
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.max(1, Math.round(len / 1.4));
    const inGap = (t) => gaps.some(([a, b]) => t > a && t < b);
    for (let i = 0; i < n; i++) {
      const ta = i / n, tb = (i + 1) / n, tm = (ta + tb) / 2;
      if (inGap(tm)) continue;
      const xa = lerp(x0, x1, ta), za = lerp(z0, z1, ta), xb = lerp(x0, x1, tb), zb = lerp(z0, z1, tb);
      p.push([xa, 0, za], [xa, h, za], [xb, 0, zb], [xb, h, zb], [xa, h, za], [xb, h, zb], [xa, 0.12, za], [xb, 0.12, zb]);
      for (let k = 1; k < 7; k++) { const t = k / 7; const xx = lerp(xa, xb, t), zz = lerp(za, zb, t); p.push([xx, 0.12, zz], [xx, h, zz]); }
      p.push([xa, h * 0.55, za], [xb, h * 0.55, zb]);
    }
    return segs(p, COL.ash, 0.6);
  }
  function curtain(x, z0, z1, h = 1.9) {
    const g = new T.Group();
    [z0, z1].forEach((z) => g.add(at(box(0.08, h, 0.08, 0x2a2a30, COL.yellow, { edgeOpacity: 0.9 }), x, 0, z)));
    const beams = [];
    for (let y = 0.3; y < h - 0.05; y += 0.17) beams.push([x, y, z0], [x, y, z1]);
    const b = segs(beams, COL.gold, 0.85); g.add(b);
    g.userData.beams = b;
    return g;
  }
  function fieldFan(r, start, len, color, op) {
    const geo = new T.CircleGeometry(r, 40, start, len); geo.rotateX(-Math.PI / 2);
    const g = new T.Group();
    g.add(new T.Mesh(geo, fillMat(color, op)));
    g.add(new T.LineSegments(new T.EdgesGeometry(geo), lineMat(color, 0.55)));
    return g;
  }
  function buildSafety() {
    const g = group('bezpieczenstwo');
    const A = 0.545, B = 0.585;
    // wygrodzenie celi (otwory na przenośniki i drzwi)
    const f = new T.Group(); g.add(f);
    f.add(fenceRun(3.6, -0.6, 3.6, -10.0, 2.2, [[0.1, 0.32], [0.68, 0.9]]));
    f.add(fenceRun(3.6, -10.0, 12.0, -10.0));
    f.add(fenceRun(12.0, -10.0, 12.0, -0.6, 2.2, [[0.0, 0.3]]));
    f.add(fenceRun(12.0, -0.6, 3.6, -0.6, 2.2, [[0.0, 0.24]]));
    // szyby wind
    f.add(fenceRun(-14.45, 5.05, -12.55, 5.05, 6.0)); f.add(fenceRun(-14.45, 6.95, -12.55, 6.95, 6.0));
    f.add(fenceRun(-2.35, 1.45, -2.35, 3.15, 6.0)); f.add(fenceRun(-0.45, 1.45, -0.45, 3.15, 6.0));
    reveal(f, A, B, 'grow');
    // drzwi celi z ryglem
    const dc = new T.Group(); at(dc, 11.0, 0, -0.6); g.add(dc);
    dc.add(segs([[-0.9, 0, 0], [-0.9, 2.1, 0], [0.9, 0, 0], [0.9, 2.1, 0], [-0.9, 2.1, 0], [0.9, 2.1, 0], [-0.9, 0.1, 0], [0.9, 0.1, 0], [-0.9, 1.1, 0], [0.9, 1.1, 0]], COL.bone, 0.8));
    dc.add(at(box(0.12, 0.2, 0.1, COL.yellow, 0xb88f12), -0.75, 1.0, 0.08));
    reveal(dc, A + 0.01, B, 'fade');
    // kurtyny na otworach celi (bez animacji)
    const k1 = curtain(3.85, -3.35, -1.85); g.add(k1); reveal(k1, A + 0.012, B, 'fade');
    const k2 = curtain(11.75, -8.75, -7.25); g.add(k2); reveal(k2, A + 0.012, B, 'fade');
    // radar bezpieczeństwa w celi
    const rad = new T.Group(); at(rad, 3.75, 2.2, -0.85); g.add(rad);
    rad.add(box(0.18, 0.14, 0.12, COL.fill2, COL.yellow));
    const cone = new T.ConeGeometry(2.6, 5.2, 28, 1, true); cone.translate(0, -2.6, 0);
    const coneM = new T.Group();
    coneM.add(new T.Mesh(cone, fillMat(COL.red, 0.05)));
    coneM.add(new T.LineSegments(new T.EdgesGeometry(cone, 30), lineMat(COL.red, 0.4)));
    coneM.quaternion.setFromUnitVectors(V(0, -1, 0), V(0.62, -0.38, -0.69).normalize());
    rad.add(coneM);
    reveal(rad, A + 0.015, B + 0.01, 'fade');
    // skaner laserowy na wózku jazdy poziomej (pola: ostrzegawcze i ochronne)
    const sc = new T.Group(); g.add(sc);
    sc.add(at(cyl(0.09, 0.16, COL.fill2, COL.yellow, { seg: 16 }), 0, 0.3, 0.85));
    const warn = fieldFan(3.2, -Math.PI / 2 - 0.62 * Math.PI, 1.24 * Math.PI, COL.yellow, 0.12);
    const prot = fieldFan(2.0, -Math.PI / 2 - 0.62 * Math.PI, 1.24 * Math.PI, COL.red, 0.2);
    [warn, prot].forEach((o) => { o.position.set(0, 0.02, 0.85); sc.add(o); });
    sc.position.set(19.8, 0, 0);
    moving.scanner = sc;
    reveal(sc, A + 0.02, B + 0.01, 'fade');
    // kurtyna z mutingiem krzyżowym przed bramą szybkobieżną
    const main = curtain(16.55, -9.05, -6.95, 1.95); g.add(main);
    const lamp = at(cyl(0.07, 0.14, 0x2a2a30, COL.goldHi, { seg: 14 }), 16.55, 1.95, -9.05); main.add(lamp);
    const mute = new T.Group(); g.add(mute);
    [[15.55, -9.05], [16.25, -9.05], [15.55, -6.95], [16.25, -6.95]].forEach(([x, z]) => mute.add(at(box(0.07, 1.0, 0.07, 0x2a2a30, COL.gold), x, 0, z)));
    const mb = segs([[15.55, 0.85, -9.05], [16.25, 0.85, -6.95], [15.55, 0.85, -6.95], [16.25, 0.85, -9.05]], COL.gold, 0.7);
    mute.add(mb);
    reveal(main, A + 0.02, B + 0.012, 'fade'); reveal(mute, A + 0.02, B + 0.012, 'fade');
    moving.curtain = main; moving.muteBeams = mb; moving.lamp = lamp;
    // paleta sekwencji kulminacyjnej i człowiek
    const sp = pallet(1, true, true); at(sp, 14.0, TOP, -8.0); g.add(sp); moving.seqPallet = sp;
    const who = person(); g.add(who); moving.seqPerson = who;

    const R = [0.56, 0.6];
    label('s-fence', 'WYGRODZENIE CELI', [7.8, 2.2, -10.0], R, { dx: -30, dy: -46 });
    label('s-door', 'DRZWI Z RYGLEM', [11.0, 2.1, -0.6], R, { dx: 30, dy: -46 });
    label('s-radar', 'RADAR BEZPIECZEŃSTWA', [3.75, 2.3, -0.85], R, { dx: -60, dy: -54 });
    label('s-scan', 'SKANER LASEROWY · POLA OCHRONNE', [19.8, 0.3, 1.0], R, { dx: 30, dy: 44 });
    label('s-curt', 'KURTYNA + MUTING KRZYŻOWY', [16.55, 1.95, -6.95], R, { dx: 30, dy: -50 });
    label('s-mute', 'CZUJNIKI MUTINGU', [15.9, 0.85, -8.0], [0.6, 0.68], { dx: -150, dy: 40 });
    label('s-curt2', 'KURTYNA BEZPIECZEŃSTWA', [16.55, 1.6, -6.95], [0.6, 0.76], { dx: 40, dy: -40 });
    label('s-gate', 'BRAMA SZYBKOBIEŻNA', [INNER_X, 2.9, -9.4], [0.6, 0.76], { dx: 40, dy: -50 });
  }

  /* ---------- warstwa 05: sieć OT ---------- */
  function buildNet() {
    const g = group('siec');
    const A = 0.785, B = 0.81;
    const border = poly(rectPts(-24.4, -14.4, 24.7, 11.4, 0.05), dashMat(COL.gold, 0.9, 0.9, 0.5), 0.4);
    g.add(border); reveal(border, A, B, 'draw');
    const sw = at(box(0.5, 0.3, 0.25, COL.fill2, COL.gold), -6.2, 2.0, -13.75); g.add(sw);
    const fw = new T.Group(); at(fw, -24.4, 0, -11.0); g.add(fw);
    fw.add(box(0.7, 1.5, 0.9, COL.fill2, COL.gold));
    fw.add(segs([[0.36, 0.4, -0.3], [0.36, 1.2, -0.3], [0.36, 0.4, 0.3], [0.36, 1.2, 0.3], [0.36, 0.8, -0.3], [0.36, 0.8, 0.3]], COL.goldHi, 0.9));
    // sieć biurowa poza halą
    const it = new T.Group(); at(it, -34, 0, -11); g.add(it);
    it.add(box(7, 3, 5.5, COL.carbon, COL.ash, { edgeOpacity: 0.7, fillOpacity: 0.55 }));
    it.add(at(box(0.8, 2.0, 1.0, COL.fill2, COL.bone), -1.0, 0, 0));
    it.add(at(box(0.8, 2.0, 1.0, COL.fill2, COL.bone), 0.4, 0, 0));
    const efw = at(box(0.6, 1.2, 0.8, COL.fill2, COL.ash), -39.8, 0, -14.8); g.add(efw);
    const net = new T.Group(); at(net, -47, 5.0, -20); g.add(net);
    const ico = new T.IcosahedronGeometry(3.2, 1);
    net.add(new T.LineSegments(new T.EdgesGeometry(ico, 1), lineMat(COL.ash, 0.55)));
    const OUTSIDE = [0.886, 0.9];
    reveal(sw, A + 0.005, B, 'fade'); reveal(fw, A + 0.008, B, 'fade'); reveal(it, A + 0.01, B + 0.005, 'fade', { out: OUTSIDE });
    reveal(efw, A + 0.012, B + 0.008, 'fade', { out: OUTSIDE }); reveal(net, A + 0.012, B + 0.008, 'fade', { out: OUTSIDE });

    const L = (pts, color, op) => { const l = poly(pts, dashMat(color, op, 0.45, 0.3), 0.3); g.add(l); return l; };
    const links = [
      L([[14.6, 1.7, -9.35], [14.6, 3.6, -9.35], [14.6, 3.6, -13.9], [-6.2, 3.6, -13.9], [-6.2, 2.15, -13.75]], COL.gold, 0.9),
      L([[2.6, 1.2, -11.2], [2.6, 3.6, -11.2], [2.6, 3.6, -13.9]], COL.gold, 0.9),
      L([[-4.0, 2.2, -13.25], [-4.0, 2.6, -13.75], [-6.2, 2.6, -13.75]], COL.gold, 0.9),
      L([[-6.2, 2.0, -13.75], [-6.2, 2.0, -13.95], [-24.0, 2.0, -13.95], [-24.4, 1.5, -11.0]], COL.gold, 0.9),
      L([[-24.4, 0.8, -11.0], [-30.5, 0.8, -11.0], [-34, 1.5, -11.0]], COL.gold, 0.9),
      L([[-37.5, 1.0, -12.5], [-39.8, 1.0, -14.8]], COL.ash, 0.7),
      L([[-39.8, 1.0, -14.8], [-47, 5.0, -20]], COL.ash, 0.7)
    ];
    links.forEach((l, i) => reveal(l, A + 0.01 + i * 0.002, B + 0.008 + i * 0.002, 'draw', i >= 4 ? { out: OUTSIDE } : {}));
    // próba dostępu z internetu: czerwona ścieżka do zapory sieci OT
    const atk = poly([[-47, 5.0, -20], [-36, 2.4, -16.5], [-28, 1.4, -12.5], [-24.8, 1.0, -11.0]], dashMat(COL.red, 0.55, 0.35, 0.3), 0.3);
    g.add(atk); reveal(atk, 0.815, 0.83, 'draw', { out: [0.88, 0.89] });

    // pakiety: złote (dane palety: QR → przełącznik → zapora → WMS) i czerwone (z internetu, zatrzymane na zaporze)
    const okPath = densify([[14.6, 1.7, -9.35], [14.6, 3.6, -9.35], [14.6, 3.6, -13.9], [-6.2, 3.6, -13.9], [-6.2, 2.0, -13.95], [-24.0, 2.0, -13.95], [-24.4, 1.5, -11.0], [-24.4, 0.8, -11.0], [-30.5, 0.8, -11.0], [-34, 1.5, -11.0]], 0.4);
    const badPath = densify([[-47, 5.0, -20], [-36, 2.4, -16.5], [-28, 1.4, -12.5], [-24.8, 1.0, -11.0]], 0.3);
    const pk = (c) => { const m = new T.Mesh(new T.SphereGeometry(0.42, 14, 10), fillMat(c, 1)); g.add(m); m.visible = false; return m; };
    const ring = new T.Mesh(new T.RingGeometry(0.7, 0.95, 36), fillMat(COL.red, 0.9)); g.add(ring); ring.visible = false;
    moving.net = { ok: [pk(COL.goldHi), pk(COL.goldHi), pk(COL.goldHi)], bad: [pk(COL.red), pk(COL.red), pk(COL.red)], okPath, badPath, ring };

    const R = [0.8, 0.885];
    label('n-ot', 'SIEĆ OT · LOKALNA', [-14, 0.05, 11.4], R, { kind: 'zone', dx: 20, dy: 30 });
    label('n-sw', 'PRZEŁĄCZNIK', [-6.2, 2.3, -13.75], R, { dx: 30, dy: -46 });
    label('n-fw', 'ZAPORA SIECI OT', [-24.4, 1.6, -11.0], R, { dx: -60, dy: -60 });
    label('n-it', 'SIEĆ BIUROWA · WMS / ERP', [-34, 3.0, -11], R, { dx: -40, dy: -50 });
    label('n-www', 'INTERNET', [-47, 8.4, -20], R, { dx: 30, dy: -30 });
    label('n-block', 'DOSTĘP Z ZEWNĄTRZ ZABLOKOWANY', [-24.8, 1.0, -11.0], [0.835, 0.885], { dx: -80, dy: 54, alert: true });
  }
  function pathAt(path, t) {
    const n = path.length - 1;
    const f = clamp(t) * n; const i = Math.min(n - 1, Math.floor(f)); const k = f - i;
    const a = path[i], b = path[i + 1];
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  }

  /* ---------- kamera ---------- */
  const KEYS = [
    { p: 0.0, az: 45, el: 31, zoom: 1.12, t: [2, 1.5, 1] },
    { p: 0.06, az: 42, el: 31, zoom: 1.08, t: [1, 1.5, 0] },
    { p: 0.15, az: 26, el: 33, zoom: 1.0, t: [0, 1.5, 0] },
    { p: 0.2, az: 22, el: 32, zoom: 1.45, t: [-9, 2.5, 4] },
    { p: 0.27, az: 15, el: 32, zoom: 1.5, t: [3, 1.5, -4] },
    { p: 0.325, az: 8, el: 32, zoom: 1.4, t: [14, 1.5, -2] },
    { p: 0.345, az: 2, el: 32, zoom: 1.04, t: [0, 1.8, -1] },
    { p: 0.415, az: -6, el: 30, zoom: 1.05, t: [0, 1.6, -3] },
    { p: 0.45, az: -8, el: 17, zoom: 9.2, t: [-4.0, 1.1, -13.0] },
    { p: 0.51, az: -14, el: 17, zoom: 9.2, t: [-4.0, 1.1, -13.0] },
    { p: 0.55, az: -26, el: 30, zoom: 1.12, t: [4, 1.5, -3] },
    { p: 0.585, az: -30, el: 28, zoom: 1.25, t: [8, 1.5, -3] },
    { p: 0.61, az: -34, el: 22, zoom: 3.5, t: [15.0, 1.0, -7.2] },
    { p: 0.755, az: -42, el: 21, zoom: 3.5, t: [15.0, 1.0, -7.2] },
    { p: 0.8, az: -104, el: 52, zoom: 0.66, t: [-12, 0, -6] },
    { p: 0.885, az: -122, el: 54, zoom: 0.66, t: [-12, 0, -6] },
    { p: 1.0, az: -315, el: 31, zoom: 1.0, t: [1, 1.5, 0] }
  ];
  const cam = { az: 45, el: 31, zoom: 1, t: V(1, 1.5, 0) };
  function cameraAt(p) {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const k = ease(seg(p, a.p, b.p));
    cam.az = lerp(a.az, b.az, k);
    cam.el = lerp(a.el, b.el, k);
    cam.zoom = Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), k));
    cam.t.set(lerp(a.t[0], b.t[0], k), lerp(a.t[1], b.t[1], k), lerp(a.t[2], b.t[2], k));
  }
  function applyCamera() {
    const az = cam.az * Math.PI / 180, el = cam.el * Math.PI / 180;
    const d = 120;
    camera.position.set(cam.t.x + d * Math.cos(el) * Math.sin(az), cam.t.y + d * Math.sin(el), cam.t.z + d * Math.cos(el) * Math.cos(az));
    camera.up.set(0, 1, 0);
    camera.lookAt(cam.t);
    camera.zoom = cam.zoom;
    const L = state.layout;
    const aspect = state.w / state.h;
    const H = Math.max(L.fitH, L.fitW / aspect);
    const W = H * aspect;
    const ox = L.offX * W / cam.zoom, oy = L.offY * H / cam.zoom;
    camera.left = -W / 2 + ox; camera.right = W / 2 + ox;
    camera.top = H / 2 + oy; camera.bottom = -H / 2 + oy;
    camera.updateProjectionMatrix();
    // ściany zwrócone do kamery opuszczamy (przekrój „domku dla lalek”)
    const dx = Math.sin(az), dz = Math.cos(az);
    walls.forEach((w) => {
      const dot = w.userData.n[0] * dx + w.userData.n[1] * dz;
      w.scale.y = lerp(WALL_H, WALL_LOW, smooth(0.0, 0.35, dot));
    });
  }

  /* ---------- sekwencje zależne od p i od czasu ---------- */
  const pal = { in: null, out: null };
  function seqMuting(p) {
    const m = moving;
    // 04: paleta jedzie do bramy, muting, brama, przejazd
    const pv = seg(p, 0.59, 0.665);
    const x = lerp(14.0, 18.4, ease(pv));
    m.seqPallet.visible = p > 0.585 && p < 0.885;
    m.seqPallet.position.set(x, TOP, -8.0);
    const front = x + 0.6, back = x - 0.6;
    const blocked = front > 15.65 && back < 16.3;
    const muted = front > 15.75 && back < 16.9;
    const doorOpen = smooth(16.1, 16.55, front) * (1 - smooth(17.15, 17.7, back));
    // człowiek: podchodzi i przerywa kurtynę
    const pp = seg(p, 0.675, 0.715);
    const back2 = seg(p, 0.755, 0.775);
    const who = m.seqPerson;
    who.visible = p > 0.665 && p < 0.785;
    const wx = lerp(lerp(13.4, 16.35, ease(pp)), 13.4, ease(back2));
    const wz = lerp(lerp(-5.0, -7.6, ease(pp)), -5.0, ease(back2));
    who.position.set(wx, 0, wz);
    const broken = p >= 0.713 && p < 0.765;
    state.stop = broken;
    if (broken) state.status = 'STOP';
    setCurtain(muted ? 'muted' : broken ? 'broken' : 'active', blocked);
    setDoor(m.door, doorOpen);
  }
  function setCurtain(mode, blocked) {
    const bm = moving.curtain.userData.beams.material;
    if (mode === 'muted') { bm.color.set(COL.goldLo); bm.opacity = 0.5; }
    else if (mode === 'broken') { bm.color.set(COL.red); bm.opacity = 1; }
    else { bm.color.set(COL.gold); bm.opacity = 0.85; }
    moving.muteBeams.material.color.set(blocked ? COL.goldHi : COL.gold);
    moving.muteBeams.material.opacity = blocked ? 1 : 0.6;
    moving.lamp.children.forEach((c) => { if (c.material && c.isMesh) c.material.color.set(mode === 'muted' ? COL.goldHi : 0x2a2a30); });
  }
  function seqCabinet(p) {
    const c = layerGroups.automatyka.userData.cab;
    const ghost = smooth(0.44, 0.47, p) * (1 - smooth(0.51, 0.535, p));
    c.front.position.z = c.frontZ + ghost * 0.65;
    if (ghost > 0.001) c.leafMats.forEach((e) => { e.m.opacity = e.base * (1 - ghost * (e.line ? 0.75 : 0.95)); });
    c.phantomMats.forEach((m) => { m.opacity = ghost * 0.9; });
    c.plate.position.z = c.plate.userData.restZ + smooth(0.46, 0.485, p) * (1 - smooth(0.5, 0.52, p)) * 0.12;
  }
  function seqInduct(p) {
    moving.induct.forEach((o, i) => {
      const t = seg(p, 0.38 + i * 0.006, 0.4 + i * 0.006);
      const r = o.userData.ring;
      r.scale.setScalar(1 + t * 3.2);
      r.material.opacity = 0.85 * (1 - t) + 0.15;
    });
  }
  function seqNet(p) {
    const n = moving.net;
    n.ok.forEach((m, i) => {
      const t = seg(p, 0.815 + i * 0.012, 0.86 + i * 0.012);
      m.visible = t > 0 && t < 1 && p < 0.885;
      const q = pathAt(n.okPath, t); m.position.set(q[0], q[1], q[2]);
    });
    let flash = 0;
    n.bad.forEach((m, i) => {
      const t = seg(p, 0.83 + i * 0.014, 0.85 + i * 0.014);
      m.visible = t > 0 && t < 1 && p < 0.885;
      const q = pathAt(n.badPath, t); m.position.set(q[0], q[1], q[2]);
      m.material.opacity = 1 - smooth(0.85, 1, t) * 0.6;
      const after = seg(p, 0.85 + i * 0.014, 0.858 + i * 0.014);
      if (after > 0 && after < 1) flash = Math.max(flash, 1 - after);
    });
    n.ring.visible = flash > 0.01;
    n.ring.position.set(-24.9, 1.0, -11.0);
    n.ring.quaternion.copy(camera.quaternion);
    n.ring.scale.setScalar(1 + (1 - flash) * 1.4);
    n.ring.material.opacity = flash;
  }

  /* pętla pracy linii (arkusz 06) i ruch robota (04, 06).
     Każdy odcinek zwraca położenie palety i stan maszyn, przez które właśnie przechodzi. */
  const UP = DECK + TOP;
  const IN = [
    { d: 3.0, f: (k) => ({ x: lerp(-19, -13.5, k), y: TOP, z: 6, r: 0 }) },
    { d: 2.0, f: (k) => { const y = lerp(TOP, UP, ease(k)); return { x: -13.5, y, z: 6, r: 0, l1: y }; } },
    { d: 3.6, f: (k) => ({ x: lerp(-13.5, -1.4, k), y: UP, z: 6, r: 0, l1: lerp(UP, TOP, ease(k)) }) },
    { d: 1.0, f: (k) => ({ x: -1.4, y: UP, z: 6, r: ease(k) * Math.PI / 2, t1: ease(k) * Math.PI / 2 }) },
    { d: 1.4, f: (k) => ({ x: -1.4, y: UP, z: lerp(6, 2.3, k), r: Math.PI / 2, t1: lerp(Math.PI / 2, 0, ease(k)) }) },
    { d: 2.0, f: (k) => { const y = lerp(UP, TOP, ease(k)); return { x: -1.4, y, z: 2.3, r: Math.PI / 2, l2: y }; } },
    { d: 1.6, f: (k) => ({ x: -1.4, y: TOP, z: lerp(2.3, -2.6, k), r: Math.PI / 2, l2: lerp(TOP, UP, ease(k)) }) },
    { d: 2.4, f: (k) => ({ x: lerp(-1.4, 4.6, k), y: TOP, z: -2.6, r: Math.PI / 2 }) },
    { d: 1.2, f: () => ({ x: 4.6, y: TOP, z: -2.6, r: Math.PI / 2 }) }
  ];
  const OUT = [
    { d: 2.6, f: (k) => ({ x: lerp(5.6, 13.4, k), y: TOP, z: -8, wrap: 0, sl: lerp(SL_DOWN, SL_UP, ease(k)) }) },
    { d: 3.0, f: (k) => ({ x: 13.4, y: TOP, z: -8, wrap: k, disc: k * Math.PI * 4, mast: k }) },
    { d: 3.4, f: (k) => ({ x: lerp(13.4, 18.4, k), y: TOP, z: -8, wrap: 1 }) },
    { d: 1.0, f: (k) => ({ x: lerp(18.4, 19.8, k), y: TOP, z: -8, wrap: 1, tc: -8 }) },
    { d: 2.4, f: (k) => { const z = lerp(-8, 4, ease(k)); return { x: 19.8, y: TOP, z, wrap: 1, tc: z }; } },
    { d: 1.4, f: (k) => ({ x: lerp(19.8, 23.2, k), y: TOP, z: 4, wrap: 1, tc: lerp(4, -8, ease(k)) }) },
    { d: 1.4, f: (k) => { const y = lerp(TOP, 0.0, ease(k)); return { x: 23.2, y, z: 4, wrap: 1, sl: y + SL_DOWN }; } },
    { d: 1.6, f: (k) => ({ x: 23.2, y: 0.0, z: lerp(4, 6.1, ease(k)), wrap: 1, sl: SL_DOWN, gone: k > 0.92 }) }
  ];
  const durIn = IN.reduce((s, x) => s + x.d, 0), durOut = OUT.reduce((s, x) => s + x.d, 0);
  function sample(list, dur, t) {
    let tt = ((t % dur) + dur) % dur;
    for (const s of list) { if (tt <= s.d) return s.f(tt / s.d); tt -= s.d; }
    return list[list.length - 1].f(1);
  }
  function resetStatic() {
    moving.l1.userData.car.position.y = TOP - 0.12;
    moving.l2.userData.car.position.y = UP - 0.12;
    moving.t1.userData.rot.rotation.y = 0;
    moving.wrapper.userData.disc.rotation.y = 0;
    moving.wrapper.userData.car.position.y = 0.8;
    moving.tc.userData.car.position.z = 0;
    moving.scanner.position.set(19.8, 0, 0);
    setScissor(moving.sl, SL_UP);
    moving.ped.position.set(-7.6, 0, 9.6);
    moving.qrFan.material.opacity = 0.16;
  }
  function seqLoop(p) {
    const on = p >= 0.885;
    pal.in.visible = on; pal.out.visible = on;
    if (!on) { resetStatic(); return; }
    const t = state.time;
    const a = sample(IN, durIn, t);
    pal.in.position.set(a.x, a.y, a.z); pal.in.rotation.y = a.r;
    moving.l1.userData.car.position.y = (a.l1 ?? TOP) - 0.12;
    moving.l2.userData.car.position.y = (a.l2 ?? UP) - 0.12;
    moving.t1.userData.rot.rotation.y = a.t1 ?? 0;
    // przy celi robot zdejmuje kartony z palety dostawczej
    const lastIn = IN[IN.length - 1].d;
    const tin = ((t % durIn) + durIn) % durIn;
    const unload = clamp((tin - (durIn - lastIn)) / lastIn);
    pal.in.userData.load.scale.y = Math.max(0.001, 1 - unload * 0.6);
    pal.in.userData.film.visible = a.x < 4.0;

    const o = sample(OUT, durOut, t + 4.0);
    pal.out.visible = !o.gone;
    pal.out.position.set(o.x, o.y, o.z);
    pal.out.rotation.y = o.disc ?? 0;
    pal.out.userData.film.visible = o.wrap > 0.02;
    pal.out.userData.film.scale.y = Math.max(0.02, o.wrap);
    pal.out.userData.corners.visible = o.wrap > 0.02;
    pal.out.userData.corners.scale.y = Math.max(0.02, o.wrap);
    moving.wrapper.userData.disc.rotation.y = o.disc ?? 0;
    moving.wrapper.userData.car.position.y = o.mast !== undefined ? 0.5 + Math.abs(Math.sin(o.mast * Math.PI)) * 1.2 : 0.8;
    const tcZ = o.tc ?? -8;
    moving.tc.userData.car.position.z = tcZ;
    moving.scanner.position.set(19.8, 0, tcZ);
    setScissor(moving.sl, o.sl ?? SL_UP);
    const onLane = Math.abs(o.z + 8) < 0.01;
    const front = o.x + 0.6, back = o.x - 0.6;
    const blocked = onLane && front > 15.65 && back < 16.3;
    const muted = onLane && front > 15.75 && back < 16.9;
    setCurtain(muted ? 'muted' : 'active', blocked);
    setDoor(moving.door, onLane ? smooth(16.1, 16.55, front) * (1 - smooth(17.15, 17.7, back)) : 0);
    moving.qrFan.material.opacity = onLane && Math.abs(o.x - 14.6) < 0.8 ? 0.42 : 0.16;
    // pieszy pod antresolą
    moving.ped.position.set(-7.6, 0, 12 - ((t * 1.3) % 26));
  }
  function robotPose(p) {
    const r = moving.robot;
    const live = (p >= 0.545 && p < 0.785) || p >= 0.885;
    if (!live) { solveArm(r, false, 5.2, 2.6, -4.4); return; }
    const cyc = 3.4;
    const k = ((state.time % cyc) + cyc) % cyc / cyc;
    const pick = [4.6, 1.75, -2.6], place = [5.6, 1.35, -8.0];
    const hov = 0.6;
    let x, y, z, carry = false;
    const L = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    const up = (q) => [q[0], q[1] + hov, q[2]];
    let q;
    if (k < 0.12) q = L(up(pick), pick, ease(k / 0.12));
    else if (k < 0.2) q = pick, carry = true;
    else if (k < 0.3) q = L(pick, up(pick), ease((k - 0.2) / 0.1)), carry = true;
    else if (k < 0.55) q = L(up(pick), up(place), ease((k - 0.3) / 0.25)), carry = true;
    else if (k < 0.66) q = L(up(place), place, ease((k - 0.55) / 0.11)), carry = true;
    else if (k < 0.74) q = place;
    else if (k < 0.84) q = L(place, up(place), ease((k - 0.74) / 0.1));
    else q = L(up(place), up(pick), ease((k - 0.84) / 0.16));
    [x, y, z] = q;
    solveArm(r, carry, x, y, z);
  }

  /* ---------- API ---------- */
  function init(canvas) {
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    if (!renderer || !renderer.getContext()) return false;
    renderer.setClearColor(COL.void, 1);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    scene = new T.Scene();
    root = new T.Group(); scene.add(root);
    camera = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 600);
    buildHall(); buildMech(); buildAuto(); buildSafety(); buildNet();
    pal.in = pallet(1, true); layerGroups.mechanika.add(pal.in); pal.in.visible = false;
    pal.out = pallet(1, false); layerGroups.mechanika.add(pal.out); pal.out.visible = false;
    return true;
  }
  function resize(w, h, layout) {
    state.w = w; state.h = h;
    if (layout) Object.assign(state.layout, layout);
    renderer.setSize(w, h, false);
  }
  function setProgress(p) {
    state.p = p;
    applyAnims(p);
    cameraAt(p);
    applyCamera();
    seqCabinet(p); seqInduct(p);
    state.stop = false;
    if (p < 0.885) seqMuting(p);
    seqNet(p);
    seqLoop(p);
    robotPose(p);
    if (p < 0.15) state.status = 'PROJEKT';
    else if (p < 0.345) state.status = 'MONTAŻ';
    else if (p < 0.545) state.status = 'URUCHAMIANIE';
    else if (!state.stop) state.status = 'PRACA';
    state.looping = (p >= 0.545 && p < 0.785 && !state.stop) || p >= 0.885;
  }
  function tick(dt) { if (state.looping) state.time += dt; }
  function render() { renderer.render(scene, camera); }
  function project(l, out) {
    const v = l.follow ? l.follow().clone() : l.pos.clone();
    if (l.obj) v.z += l.obj.position.z - l.obj.userData.restZ;
    v.project(camera);
    out.x = (v.x * 0.5 + 0.5) * state.w;
    out.y = (-v.y * 0.5 + 0.5) * state.h;
    out.ok = v.z > -1 && v.z < 1;
    return out;
  }
  function projectPoint(v3, out) {
    tmp.copy(v3).project(camera);
    out.x = (tmp.x * 0.5 + 0.5) * state.w;
    out.y = (-tmp.y * 0.5 + 0.5) * state.h;
    return out;
  }
  function setLayerVisible(name, on) { if (layerGroups[name]) layerGroups[name].visible = on; }

  window.SynergyScene = {
    init, resize, setProgress, tick, render, project, projectPoint, setLayerVisible, labels, state,
    layers: ['hala', 'mechanika', 'automatyka', 'bezpieczenstwo', 'siec']
  };
})();
