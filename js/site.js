// Small interactive touches for the site. No frameworks.

// 1. Lightbox: click any image marked data-zoom to see it large.
(function () {
  const imgs = document.querySelectorAll('img[data-zoom]');
  if (!imgs.length) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><img alt=""><p class="lightbox-caption"></p>';
  document.body.appendChild(dlg);
  const big = dlg.querySelector('img');
  const cap = dlg.querySelector('.lightbox-caption');
  dlg.querySelector('.lightbox-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  imgs.forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge: ' + img.alt);
    const open = () => {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      const fc = img.closest('figure')?.querySelector('figcaption');
      cap.textContent = fc ? fc.textContent : img.alt;
      dlg.showModal();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
})();

// 2. Portfolio filters: buttons with data-filter show projects whose data-topics include it.
(function () {
  const bar = document.querySelector('.filters');
  if (!bar) return;
  const buttons = bar.querySelectorAll('button');
  const projects = document.querySelectorAll('[data-topics]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      let shown = 0;
      projects.forEach((p) => {
        const match = f === 'all' || p.dataset.topics.split(' ').includes(f);
        p.hidden = !match;
        if (match) shown++;
      });
      const status = document.querySelector('.filter-status');
      if (status) status.textContent = shown + (shown === 1 ? ' project' : ' projects');
    });
  });
})();

// 3. Before / after toggle (Bartleson Ranch).
(function () {
  document.querySelectorAll('.compare').forEach((box) => {
    const img = box.querySelector('img');
    const cap = box.querySelector('figcaption');
    box.querySelectorAll('button[data-src]').forEach((btn, i, all) => {
      btn.addEventListener('click', () => {
        img.src = btn.dataset.src;
        img.alt = btn.dataset.alt;
        if (cap) cap.textContent = btn.dataset.caption;
        all.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      });
    });
  });
})();

// 4. "Where I've worked" map (Leaflet).
(function () {
  const el = document.getElementById('work-map');
  if (!el || typeof L === 'undefined') return;
  const places = [
    { name: 'Valley Water', note: 'Groundwater contours, PFAS and recharge-pond sampling · 2026', lat: 37.25, lng: -121.86, kind: 'water', link: 'portfolio.html#groundwater-contours', img: 'images/recharge-pond.jpg' },
    { name: 'Anderson Dam retrofit', note: 'Site visit with Valley Water · 2026', lat: 37.17, lng: -121.63, kind: 'water', img: 'images/anderson-dam.jpg' },
    { name: 'Salinas Valley', note: 'Irrigation calculator and thesis pilot · 2026', lat: 36.45, lng: -121.35, kind: 'water', link: 'portfolio.html#irrigation-calculator', img: 'images/cover-calculator.svg' },
    { name: 'Cal Poly, San Luis Obispo', note: 'M.S. research, GIS Developer, TA', lat: 35.30, lng: -120.66, kind: 'research', link: 'research.html', img: 'images/cover-eto.svg' },
    { name: 'Bartleson Ranch', note: 'Reservoir and utility mapping · 2025', lat: 35.11, lng: -120.57, kind: 'water', link: 'portfolio.html#bartleson-ranch', img: 'images/bartleson.jpg' },
    { name: 'Cachuma Lake', note: 'Aquatic invasive species monitoring · 2024–25', lat: 34.58, lng: -119.98, kind: 'water' },
    { name: 'Santa Clara County Parks', note: 'Milkweed conservation and prescribed burns · 2022', lat: 37.34, lng: -121.70, kind: 'land', link: 'portfolio.html#milkweed', img: 'images/scc-burn.jpg' },
    { name: 'Cascade-Siskiyou National Monument', note: 'Biological monitoring · 2020', lat: 42.08, lng: -122.47, kind: 'land' }
  ];
  const colors = { water: '#4FB3C8', research: '#FFFFFF', land: '#F2A23A' };
  const map = L.map(el, { scrollWheelZoom: false }).setView([37.0, -120.6], 6);
  // Esri Hybrid: World Imagery with boundaries and place labels on top
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
  }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18
  }).addTo(map);
  const bounds = [];
  places.forEach((p) => {
    const m = L.circleMarker([p.lat, p.lng], { radius: 9, color: '#0B1E24', weight: 2, fillColor: colors[p.kind], fillOpacity: 1 }).addTo(map);
    let html = '';
    if (p.img) html += '<img src="' + p.img + '" alt="" class="popup-img">';
    html += '<strong>' + p.name + '</strong><br><span>' + p.note + '</span>';
    if (p.link) html += '<br><a href="' + p.link + '">See the project</a>';
    m.bindPopup(html, { maxWidth: 240 });
    bounds.push([p.lat, p.lng]);
  });
  map.fitBounds(bounds, { padding: [30, 30] });
})();

// 5. Water touches: scroll reveal and the stream down the side.
(function () {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal sections as they enter the screen
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-visible'));
  }

})();

// 6. Scroll-linked motion: keyword ribbon slides sideways, photos drift slightly.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ribbon = document.querySelector('.ribbon-track');
  const photos = [...document.querySelectorAll('.field-grid .photo img')];
  photos.forEach((img) => { img.classList.add('parallax'); img.style.transform = 'scale(1.12)'; });
  let ticking = false;
  function move() {
    const vh = window.innerHeight;
    if (ribbon) {
      const r = ribbon.parentElement.getBoundingClientRect();
      const t = (vh - r.top) / (vh + r.height); // 0 when entering, 1 when leaving
      ribbon.style.transform = 'translateX(' + (-t * 35).toFixed(2) + '%)';
    }
    photos.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 around center
      img.style.transform = 'scale(1.12) translateY(' + (t * -6).toFixed(2) + '%)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
  window.addEventListener('resize', move);
  move();
})();


// 7. The creek: a canvas-drawn stream down the left side that fills as you scroll
//    and pours into the waves at the bottom of the page.
(function () {
  const main = document.querySelector('main');
  const foot = document.querySelector('.pond-space');
  if (!main || !foot) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'creek';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  // Colors matched to the waves in the footer
  const C = { bed: '#EDF2EF', bed2: '#E1EAE6', pebble: '#CBD8D3', edge: '#8DBFC3', body: '#4E95A2', deep: '#2E7484' };
  const W = 120, HALF = 22; // canvas width, half-width of the water
  let dpr = 1, pts = [], cum = [], total = 0, heads = [], pebbles = [], parts = [], drops = [], rings = [];
  let reach = 0, active = false, time = 0, last = performance.now(), splashTimer = 0, crestY = 0, creekX = 0;

  function layout() {
    active = window.innerWidth >= 1300;
    cv.style.display = active ? 'block' : 'none';
    if (!active) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const mr = main.getBoundingClientRect();
    cv.style.left = (mr.left - 44 - W / 2) + 'px';
    cv.width = W * dpr; cv.height = window.innerHeight * dpr;
    cv.style.width = W + 'px'; cv.style.height = window.innerHeight + 'px';
    const top = 0; // start at the very top of the page
    const fr = foot.getBoundingClientRect();
    const endY = window.__pondInlet ? window.__pondInlet + 150 : fr.top + window.scrollY - 40;
    creekX = mr.left - 44 + window.scrollX; // runs into the pond's inlet
    crestY = fr.top + window.scrollY - 400000; // no splash: the trees hide the inlet
    const bushEl = foot.querySelector('.creek-bush');
    if (bushEl) bushEl.style.left = (mr.left - 44 - fr.left - 55) + 'px';
    // Build a gently meandering centerline, sampled every ~4px
    pts = [[W / 2, top]];
    let y = top, side = 1;
    while (y < endY) {
      const step = Math.min(280, endY - y), bend = endY - y < 320 ? 5 : 13;
      const p0 = [W / 2, y], c1 = [W / 2 + bend * side, y + step * 0.33], c2 = [W / 2 + bend * side, y + step * 0.66], p3 = [W / 2, y + step];
      const n = Math.max(1, Math.ceil(step / 4));
      for (let i = 1; i <= n; i++) {
        const t = i / n, m = 1 - t;
        pts.push([m * m * m * p0[0] + 3 * m * m * t * c1[0] + 3 * m * t * t * c2[0] + t * t * t * p3[0],
                  m * m * m * p0[1] + 3 * m * m * t * c1[1] + 3 * m * t * t * c2[1] + t * t * t * p3[1]]);
      }
      y += step; side = -side;
    }
    cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    total = cum[cum.length - 1];
    heads = [...main.querySelectorAll('h1, h2')].map((h) => { const r = h.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; });
    pebbles = [];
    for (let i = 0; i < total / 14; i++) pebbles.push({ s: Math.random() * total, u: (Math.random() * 2 - 1) * 0.8, r: 1 + Math.random() * 2.2 });
    if (!parts.length) for (let i = 0; i < 90; i++) parts.push(newPart(true));
  }

  function idxAtLen(s) { let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < s) lo = m; else hi = m; } return lo; }
  function idxAtY(y) { let lo = 0, hi = pts.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m][1] < y) lo = m; else hi = m; } return lo; }
  function at(s) {
    s = Math.max(0, Math.min(total, s));
    const i = idxAtLen(s), j = Math.min(i + 1, pts.length - 1), seg = (cum[j] - cum[i]) || 1, t = (s - cum[i]) / seg;
    const a = pts[i], b = pts[j], dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx: -dy, ny: dx, tx: dx, ty: dy };
  }
  function newPart(init) { return { s: init ? Math.random() * Math.max(reach, 1) : Math.random() * 40, u: Math.random() * 2 - 1, v: 22 + Math.random() * 38, l: 8 + Math.random() * 18, a: 0.2 + Math.random() * 0.4 }; }

  function targetReach() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) return total;
    const yLine = window.scrollY + window.innerHeight * 0.62;
    if (yLine <= pts[0][1]) return 0;
    if (yLine >= pts[pts.length - 1][1]) return total;
    return cum[idxAtY(yLine)];
  }

  function trace(iA, iB, off) {
    ctx.beginPath();
    for (let i = iA; i <= iB; i++) {
      let x = pts[i][0], y = pts[i][1];
      if (off) { const j = Math.min(i + 1, pts.length - 1), k = Math.max(i - 1, 0); const dx = pts[j][0] - pts[k][0], dy = pts[j][1] - pts[k][1], L = Math.hypot(dx, dy) || 1; x += (-dy / L) * off; y += (dx / L) * off; }
      i === iA ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
  }

  function draw(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!pts.length) return;
    const sy = window.scrollY, vh = window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, -sy * dpr);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const i0 = idxAtY(sy - 80), i1 = Math.min(pts.length - 1, idxAtY(sy + vh + 80) + 1);
    if (i1 <= i0) return;
    ctx.save();

    // Dry creek bed and pebbles
    trace(i0, i1); ctx.strokeStyle = C.bed; ctx.lineWidth = HALF * 2 + 10; ctx.stroke();
    trace(i0, i1); ctx.strokeStyle = C.bed2; ctx.lineWidth = HALF * 2 - 4; ctx.stroke();
    ctx.fillStyle = C.pebble;
    pebbles.forEach((p) => { if (p.s < reach) return; const q = at(p.s); if (q.y < sy - 20 || q.y > sy + vh + 20) return; ctx.beginPath(); ctx.arc(q.x + q.nx * p.u * (HALF - 4), q.y + q.ny * p.u * (HALF - 4), p.r, 0, 6.283); ctx.fill(); });

    // Water
    const iR = idxAtLen(reach), wB = Math.min(i1, iR);
    if (reach > 1 && wB > i0) {
      const f = at(reach);
      const water = (w, c, alpha) => { trace(i0, wB); if (iR <= i1) ctx.lineTo(f.x, f.y); ctx.globalAlpha = alpha || 1; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); ctx.globalAlpha = 1; };
      water(HALF * 2 + 4, C.edge);
      water(HALF * 2 - 8, C.body);
      water(HALF * 0.9, C.deep, 0.55);
      // Light glints along both banks
      if (!reduce) {
        ctx.setLineDash([3, 19, 1, 13, 7, 25]); ctx.lineDashOffset = -time * 16; ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        trace(i0, wB, HALF - 7); ctx.stroke(); ctx.lineDashOffset = -time * 12 + 9; trace(i0, wB, -(HALF - 7)); ctx.stroke();
        ctx.setLineDash([]);
      }
      // Foam streaks riding the current
      if (!reduce) {
        ctx.lineWidth = 1.6;
        parts.forEach((p) => {
          p.s += p.v * dt;
          if (p.s > reach) Object.assign(p, newPart(false));
          if (p.s - p.l < 0) return;
          const h = at(p.s); if (h.y < sy - 30 || h.y > sy + vh + 30) return;
          const t = at(p.s - p.l), wob = Math.sin(time * 2 + p.s * 0.03) * 0.15, u = (p.u + wob) * (HALF - 9);
          ctx.strokeStyle = 'rgba(255,255,255,' + p.a + ')';
          ctx.beginPath(); ctx.moveTo(t.x + t.nx * u, t.y + t.ny * u); ctx.lineTo(h.x + h.nx * u, h.y + h.ny * u); ctx.stroke();
        });
      }
    }

    // Let the creek dissolve into the pond: erase it gradually below the pond's edge
    if (window.__pondInlet) {
      const fy = window.__pondInlet - 10, fade = ctx.createLinearGradient(0, fy, 0, fy + 130);
      fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade; ctx.fillRect(-10, fy, W + 20, Math.max(0, sy + vh - fy + 200));
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();

    // Bubbles marking each section heading
    heads.forEach((hy) => {
      if (hy < sy - 20 || hy > sy + vh + 20) return;
      const i = idxAtY(hy), wet = cum[i] <= reach, x = pts[i][0];
      ctx.beginPath(); ctx.arc(x, hy, 7, 0, 6.283);
      ctx.fillStyle = wet ? '#FFFFFF' : C.bed; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = wet ? C.deep : '#CFDDE3'; ctx.stroke();
    });

    // Splash and ripples where the creek meets the waves
    const arrived = reach >= total - 60;
    document.body.classList.toggle('stream-arrived', arrived);
    const end = pts[pts.length - 1];
    if (arrived && !reduce) {
      splashTimer -= dt;
      if (splashTimer <= 0) {
        splashTimer = 0.06;
        drops.push({ x: end[0] + (Math.random() * 2 - 1) * 12, y: crestY, vx: (Math.random() * 2 - 1) * 70, vy: -90 - Math.random() * 90, r: 1.5 + Math.random() * 2.5, life: 1 });
        if (Math.random() < 0.08) rings.push({ r: 6, life: 1 });
      }
    }
    drops = drops.filter((d) => d.life > 0);
    drops.forEach((d) => { d.vy += 420 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * 1.4; if (d.y > crestY + 6) d.life = 0; ctx.globalAlpha = Math.max(0, d.life); ctx.fillStyle = Math.random() < 0.5 ? '#FFFFFF' : C.body; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill(); });
    rings = rings.filter((g) => g.life > 0);
    rings.forEach((g) => { g.r += 40 * dt; g.life -= dt * 0.7; ctx.globalAlpha = Math.max(0, g.life) * 0.8; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(end[0], crestY + 2, g.r, g.r * 0.3, 0, 0, 6.283); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    if (active && pts.length) {
      const target = targetReach();
      if (reduce) reach = target;
      else if (target > reach) reach = Math.min(target, reach + Math.max(40, (target - reach) * 3) * dt); // water flows forward
      else reach = Math.max(target, reach - (reach - target) * Math.min(1, dt * 5));       // and drains back
      draw(dt);
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  window.addEventListener('pond:ready', layout);
  if (reduce) window.addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  requestAnimationFrame(frame);
})();


// 8. The watershed: faint topographic contours, and a pond at the bottom of the page
//    carved out of the same elevation surface, fed by the creek, with fish.
(function () {
  const main = document.querySelector('main');
  const space = document.querySelector('.pond-space');
  if (!main) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'topo';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  const G = 16, BAND = 240;
  let buckets = new Map(), dpr = 1, pond = null, time = 0, last = performance.now(), dirty = true;

  // Smooth value noise
  const perm = []; let seed = 20261111;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 512; i++) perm.push(rnd());
  const lat = (i, j) => perm[((i * 73856093) ^ (j * 19349663)) & 511];
  const sm = (t) => t * t * (3 - 2 * t);
  function noise(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j);
    const a = lat(i, j), b = lat(i + 1, j), c = lat(i, j + 1), d = lat(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Marching squares over a grid; calls out(x1,y1,x2,y2,level) for each segment
  function contour(fn, x0, y0, cols, rows, g, levels, out) {
    const z = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) z[r * cols + c] = fn(x0 + c * g, y0 + r * g);
    for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) {
      const a = z[r * cols + c], b = z[r * cols + c + 1], d = z[(r + 1) * cols + c], e = z[(r + 1) * cols + c + 1];
      const lo = Math.min(a, b, d, e), hi = Math.max(a, b, d, e);
      for (const L of levels(lo, hi)) {
        const X = x0 + c * g, Y = y0 + r * g, p = [];
        const ed = (v1, v2, X1, Y1, X2, Y2) => { if ((v1 < L) !== (v2 < L)) { const t = (L - v1) / (v2 - v1); p.push(X1 + (X2 - X1) * t, Y1 + (Y2 - Y1) * t); } };
        ed(a, b, X, Y, X + g, Y); ed(b, e, X + g, Y, X + g, Y + g); ed(e, d, X + g, Y + g, X, Y + g); ed(d, a, X, Y + g, X, Y);
        if (p.length >= 4) out(p[0], p[1], p[2], p[3], L);
        if (p.length === 8) out(p[4], p[5], p[6], p[7], L);
      }
    }
  }

  // Images for the fish, lily pads and frog
  const img = (svg) => { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); return i; };
  const koiSvg = (body, spots) => img('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 24"><path d="M10 12 L0 3 L2 12 L0 21 Z" fill="' + body + '"/><ellipse cx="30" cy="12" rx="20" ry="7.5" fill="' + body + '"/>' + spots + '<path d="M30 5 L36 1 L38 6 Z M30 19 L36 23 L38 18 Z" fill="' + body + '" opacity="0.8"/><circle cx="45" cy="9.5" r="1.4" fill="#1E2A22"/><circle cx="45" cy="14.5" r="1.4" fill="#1E2A22"/></svg>');
  const KOI = [
    koiSvg('#E8833A', '<ellipse cx="26" cy="10" rx="6" ry="3.5" fill="#FFF4E6"/><ellipse cx="38" cy="13" rx="4" ry="2.5" fill="#FFF4E6"/>'),
    koiSvg('#FFF4E6', '<ellipse cx="24" cy="12" rx="7" ry="4" fill="#E8833A"/><ellipse cx="40" cy="10" rx="3.5" ry="2.2" fill="#D9452B"/>'),
    koiSvg('#F2A53A', ''),
  ];
  const MINNOW = img('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 12"><path d="M4 6 L0 2 L1 6 L0 10 Z" fill="#9FC3CA"/><ellipse cx="16" cy="6" rx="11" ry="3.6" fill="#B5D3D8"/></svg>');
  const PAD = img('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 50 L97 42 A47 47 0 1 1 93 30 Z" fill="#6FA866"/><path d="M50 50 L20 22 M50 50 L10 58 M50 50 L40 92 M50 50 L78 84" stroke="#8DC283" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>');
  const FROG = img('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M22 54 q-16 4 -18 18 M58 54 q16 4 18 18" stroke="#4F8A43" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M26 30 q-12 -6 -14 -16 M54 30 q12 -6 14 -16" stroke="#4F8A43" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="44" rx="17" ry="22" fill="#5E9E4E"/><ellipse cx="40" cy="48" rx="9" ry="12" fill="#7DB766" opacity="0.7"/><circle cx="31" cy="26" r="6" fill="#5E9E4E"/><circle cx="49" cy="26" r="6" fill="#5E9E4E"/><circle cx="31" cy="25" r="3" fill="#1E2A22"/><circle cx="49" cy="25" r="3" fill="#1E2A22"/><circle cx="30" cy="24" r="1" fill="#fff"/><circle cx="48" cy="24" r="1" fill="#fff"/></svg>');
  [...KOI, MINNOW, PAD, FROG].forEach((i) => i.addEventListener('load', () => { dirty = true; }));

  function build() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
    cv.style.width = window.innerWidth + 'px'; cv.style.height = window.innerHeight + 'px';
    const Wp = document.documentElement.clientWidth, Hp = document.documentElement.scrollHeight;
    const vx = Math.max(40, main.getBoundingClientRect().left - 44 + window.scrollX); // the creek's valley

    // --- The pond: an upside-down V opening downhill from the creek and filling the page bottom
    pond = null;
    let pondField = () => 99;
    if (space) {
      const sr = space.getBoundingClientRect(), apexY = sr.top + window.scrollY;
      const reachR = Math.max(260, sr.height * 0.62), reachL = Math.max(120, sr.height * 0.35);
      // Shoreline height at x: lowest at the creek (the apex), dropping toward both page edges
      const shore = (x) => {
        const d = x - vx, ad = Math.max(0, Math.abs(d) - 16); // flat tip as wide as the creek
        const t = d >= 0 ? ad / Math.max(1, Wp - vx) : ad / Math.max(1, vx);
        const drop = (d >= 0 ? reachR : reachL) * Math.pow(Math.min(1, t), 0.75) + 18 * Math.pow(Math.min(1, ad / 40), 2);
        const calm = Math.min(1, Math.abs(d) / 120);
        return apexY + drop + calm * ((noise(x / 90, 7) - 0.5) * 34 + (noise(x / 30, 3) - 0.5) * 6);
      };
      // pondField < 1 on the water, smaller with depth (distance below the shoreline)
      pondField = (x, y) => Math.exp(-(y - shore(x)) / 120);
      const bx0 = 0, bx1 = Wp, by0 = apexY - 20, by1 = Hp;
      const w = Math.ceil(bx1 - bx0), h = Math.ceil(by1 - by0);
      const off = document.createElement('canvas'); off.width = w; off.height = h;
      const octx = off.getContext('2d'), im = octx.createImageData(w, h);
      const band = [[0.12, [46, 116, 132]], [0.3, [61, 134, 149]], [0.55, [78, 149, 162]], [0.82, [111, 170, 180]], [1.0, [151, 196, 201]]];
      const shoreCache = new Float32Array(w);
      for (let xx = 0; xx < w; xx++) shoreCache[xx] = shore(bx0 + xx);
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
        const g = Math.exp(-((by0 + yy) - shoreCache[xx]) / 120);
        if (g >= 1.04) continue;
        let col = band[band.length - 1][1];
        for (const [lv, c] of band) if (g < lv) { col = c; break; }
        const o = (yy * w + xx) * 4;
        im.data[o] = col[0]; im.data[o + 1] = col[1]; im.data[o + 2] = col[2];
        im.data[o + 3] = Math.round(255 * clamp((1.04 - g) / 0.05, 0, 1));
      }
      octx.putImageData(im, 0, 0);
      const depth = [];
      contour(pondField, bx0, by0, Math.ceil(w / 8) + 1, Math.ceil(h / 8) + 1, 8,
        (lo, hi) => [0.12, 0.3, 0.55, 0.82].filter((L) => L >= lo && L <= hi), (a, b, c, d) => depth.push(a, b, c, d));
      // Swim lanes in the deep water along the bottom of the page
      const deepY = (x) => Math.max(shore(x) + 140, by1 - 200);
      const cx = Wp * 0.55, cy = Math.min(by1 - 110, deepY(cx));
      const sx = Wp * 0.36, sy = 46;
      const pads = [];
      [[0.22, 70], [0.38, 95], [0.71, 60], [0.86, 85], [0.6, 120]].forEach(([fx, dy], i) => {
        const x = Wp * fx, y = shore(x) + dy;
        if (y < by1 - 40) pads.push({ x, y, s: [30, 24, 34, 26, 22][i], r: i * 1.3, frog: i === 2 });
      });
      const fish = [
        { img: 0, rx: 0.8, ry: 0.9, sp: 0.07, ph: 0 },
        { img: 1, rx: 0.95, ry: 0.6, sp: -0.05, ph: 2 },
        { img: 2, rx: 0.5, ry: 0.8, sp: 0.09, ph: 4 },
        { img: 0, rx: 0.65, ry: 0.5, sp: -0.06, ph: 1 },
      ];
      pond = { off, bx0, by0, w, h, depth, pads, fish, cx, cy, sx, sy, top: apexY - 20, bottom: by1 };
      window.__pondInlet = apexY;
      window.__pondShore = shore;
    }

    // --- Land contours, bent around the pond so the shoreline follows them
    const shoreFn = window.__pondShore;
    const elev = (x, y) => {
      const dx = x - vx;
      const valley = 0.085 * Math.sqrt(dx * dx + 900) + noise(x / 340, y / 340) * 18 + noise(x / 130 + 50, y / 130) * 5;
      if (!shoreFn) return -y * 0.05 + valley;
      const h = shoreFn(x) - y;                       // height above the waterline
      const w = Math.pow(clamp(h / 650, 0, 1), 1.6);  // 0 at the shore, 1 well uphill
      return 0.05 * h + w * (valley - 0.085 * Math.sqrt(900));
    };
    const STEP = 4.5;
    buckets = new Map();
    contour(elev, 0, 0, Math.ceil(Wp / G) + 1, Math.ceil(Hp / G) + 1, G,
      (lo, hi) => { const out = []; for (let L = Math.ceil(lo / STEP) * STEP; L <= hi; L += STEP) out.push(L); return out; },
      (x1, y1, x2, y2, L) => {
        if (pond && pondField((x1 + x2) / 2, (y1 + y2) / 2) < 1.08) return; // no land contours on the water
        const k = Math.floor(Math.min(y1, y2) / BAND);
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k).push(x1, y1, x2, y2, Math.round(L / STEP) % 5 === 0 ? 1 : 0);
      });
    dirty = true;
    window.dispatchEvent(new Event('pond:ready'));
  }

  function draw() {
    const sy = window.scrollY, vh = window.innerHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, -window.scrollX * dpr, -sy * dpr);
    ctx.lineCap = 'round';
    const k0 = Math.floor((sy - G) / BAND) - 1, k1 = Math.floor((sy + vh) / BAND);
    for (const major of [0, 1]) {
      ctx.beginPath();
      for (let k = k0; k <= k1; k++) {
        const seg = buckets.get(k); if (!seg) continue;
        for (let i = 0; i < seg.length; i += 5) if (seg[i + 4] === major) { ctx.moveTo(seg[i], seg[i + 1]); ctx.lineTo(seg[i + 2], seg[i + 3]); }
      }
      ctx.strokeStyle = major ? '#D2E0DB' : '#E2ECE8';
      ctx.lineWidth = major ? 1.3 : 1;
      ctx.stroke();
    }
    if (!pond || pond.bottom < sy || pond.top - 40 > sy + vh) return false;
    const P = pond;
    ctx.drawImage(P.off, P.bx0, P.by0);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let i = 0; i < P.depth.length; i += 4) { ctx.moveTo(P.depth[i], P.depth[i + 1]); ctx.lineTo(P.depth[i + 2], P.depth[i + 3]); } ctx.stroke();
    // Fish swim slow loops under the lily pads
    P.fish.forEach((f, n) => {
      const th = f.ph + time * f.sp;
      const x = P.cx + Math.cos(th) * P.sx * f.rx + Math.sin(th * 2.3) * 10;
      const y = P.cy + Math.sin(th) * P.sy * f.ry + Math.cos(th * 1.7) * 5;
      const dx = -Math.sin(th) * f.rx * P.sx * f.sp, dy = Math.cos(th) * f.ry * P.sy * f.sp;
      const ang = Math.atan2(dy, dx) + Math.sin(time * 9 + n) * 0.08;
      const im = KOI[f.img];
      if (!im.complete) return;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.drawImage(im, -17, -7, 34, 14); ctx.restore();
    });
    // A little school of minnows
    if (MINNOW.complete) {
      const th = 1 + time * 0.08;
      for (let m = 0; m < 6; m++) {
        const t2 = th - m * 0.05;
        const x = P.cx + Math.cos(t2) * P.sx * 0.45 + (m % 2) * 6, y = P.cy + Math.sin(t2) * P.sy * 0.62 + (m % 3) * 4;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t2 + Math.PI / 2 + Math.sin(time * 10 + m) * 0.1); ctx.drawImage(MINNOW, -6, -2.5, 12, 5); ctx.restore();
      }
    }
    P.pads.forEach((p) => {
      if (!PAD.complete) return;
      const bob = Math.sin(time * 0.8 + p.r) * 0.06;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r + bob); ctx.drawImage(PAD, -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
      if (p.frog && FROG.complete) { ctx.save(); ctx.translate(p.x, p.y - 2 - Math.max(0, Math.sin(time * 0.7)) ** 30 * 10); ctx.rotate(-0.3 + bob); ctx.drawImage(FROG, -13, -13, 26, 26); ctx.restore(); }
    });
    return true;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += reduce ? 0 : dt;
    const animating = draw.lastVisible && !reduce;
    if (dirty || animating) { draw.lastVisible = draw(); dirty = false; }
    requestAnimationFrame(frame);
  }
  let t = null;
  window.addEventListener('scroll', () => { dirty = true; }, { passive: true });
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); });
  window.addEventListener('load', build);
  build();
  requestAnimationFrame(frame);
})();

// 9. Research page: step through Figure 5 month by month.
(function () {
  const v = document.getElementById('month-viewer');
  if (!v) return;
  const base = v.dataset.base, ids = v.dataset.months.split(','), names = v.dataset.names.split(',');
  const img = v.querySelector('.viewer-img'), label = v.querySelector('.viewer-month');
  const range = v.querySelector('.viewer-range'), play = v.querySelector('.viewer-play');
  const chips = [...v.querySelectorAll('.month-chip')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ids.forEach((m) => { const p = new Image(); p.src = base + m + '.png'; }); // preload
  let i = 0, timer = null;
  function show(n) {
    i = (n + 12) % 12;
    img.style.opacity = reduce ? 1 : 0.35;
    img.src = base + ids[i] + '.png';
    img.alt = 'Map of California showing the percent difference between satellite-based and station-based ETo in ' + names[i];
    img.onload = () => { img.style.opacity = 1; };
    label.textContent = names[i];
    range.value = i;
    chips.forEach((c, k) => c.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = 'Play'; play.setAttribute('aria-label', 'Play through the months'); }
  play.addEventListener('click', () => {
    if (timer) return stop();
    play.textContent = 'Pause'; play.setAttribute('aria-label', 'Pause');
    timer = setInterval(() => show(i + 1), 1100);
  });
  range.addEventListener('input', () => { stop(); show(+range.value); });
  chips.forEach((c, k) => c.addEventListener('click', () => { stop(); show(k); }));
  v.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { stop(); show(i + 1); }
    if (e.key === 'ArrowLeft') { stop(); show(i - 1); }
  });
  // "See all twelve months" opens the full figure in the lightbox if present
  const all = v.querySelector('.viewer-all');
  all.addEventListener('click', (e) => {
    const dlg = document.querySelector('dialog.lightbox');
    if (!dlg) return;
    e.preventDefault();
    dlg.querySelector('img').src = all.href; dlg.querySelector('img').alt = 'All twelve monthly difference maps';
    dlg.querySelector('.lightbox-caption').textContent = 'Monthly percent difference between satellite-based and station-based ETo.';
    dlg.showModal();
  });
})();
