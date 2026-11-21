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
    { org: 'Valley Water', role: 'Groundwater Management Intern · 2026', lat: 37.25, lng: -121.86, kind: 'water', img: 'images/recharge-pond.jpg', pos: 'center 35%', link: 'about.html#exp-valleywater', more: 'What I did there' },
    { org: 'Valley Water', role: 'Anderson Dam retrofit site visit · 2026', lat: 37.17, lng: -121.63, kind: 'water', img: 'images/anderson-dam.jpg', link: 'about.html#exp-valleywater', more: 'What I did there' },
    { org: 'Cal Poly SLO', role: 'M.S. research, GIS Developer and teaching · 2025–now', lat: 35.30, lng: -120.66, kind: 'research', img: 'images/cover-eto.svg', link: 'research.html', more: 'Explore my research' },
    { org: 'Cal Poly SLO', role: 'Salinas Valley pilot and irrigation calculator · 2026', lat: 36.45, lng: -121.35, kind: 'research', img: 'images/cover-calculator.svg', link: 'portfolio.html#irrigation-calculator', more: 'See the project' },
    { org: 'Cal Poly SLO', role: 'Applied GIS: Bartleson Ranch mapping · 2025', lat: 35.11, lng: -120.57, kind: 'research', img: 'images/bartleson.jpg', pos: 'center 40%', link: 'portfolio.html#bartleson-ranch', more: 'See the project' },
    { org: 'Santa Barbara County Parks', role: 'Program Coordinator, Cachuma Lake · 2024–25', lat: 34.58, lng: -119.98, kind: 'water', link: 'about.html#exp-sbparks', more: 'What I did there' },
    { org: 'Santa Clara County Parks', role: 'Natural Resources Management Intern · 2022', lat: 37.34, lng: -121.70, kind: 'land', img: 'images/scc-burn.jpg', pos: '35% center', link: 'about.html#exp-sccparks', more: 'What I did there' },
    { org: 'Vesper Meadow Education Program', role: 'Wetland Restoration Volunteer · 2020', lat: 42.29, lng: -122.37, kind: 'water', link: 'about.html#exp-vesper', more: 'What I did there' },
    { org: 'Westmont College', role: 'Teaching Assistant and Tutor, Old Testament · 2023', lat: 34.449, lng: -119.661, kind: 'research', link: 'about.html#exp-westmont', more: 'More about my teaching' },
    { org: 'Mesa Harmony Garden', role: 'Volunteer, Santa Barbara Mesa', lat: 34.404, lng: -119.722, kind: 'land', link: 'about.html#story-westmont', more: 'More about my Westmont years' },
    { org: 'Bureau of Land Management', role: 'Biological Monitoring Volunteer, Cascade-Siskiyou National Monument · 2020', lat: 42.08, lng: -122.47, kind: 'land', img: 'images/blm-oregon.jpg', pos: 'center 30%', link: 'about.html#exp-blm', more: 'What I did there' }
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
    let html = '<div class="pop">';
    html += p.img ? '<img src="' + p.img + '" alt="" class="pop-img"' + (p.pos ? ' style="object-position:' + p.pos + '"' : '') + '>' : '<div class="pop-img pop-img-empty" aria-hidden="true"></div>';
    html += '<div class="pop-body"><strong class="pop-org">' + p.org + '</strong><span class="pop-role">' + p.role + '</span>';
    if (p.link) html += '<a class="pop-link" href="' + p.link + '">' + p.more + ' <span aria-hidden="true">&rarr;</span></a>';
    html += '</div></div>';
    m.bindPopup(html, { maxWidth: 260, minWidth: 260 });
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
    // where the page content starts (the creek runs in the gutter to its left)
    const br = main.getBoundingClientRect(), mr = { left: br.left + parseFloat(getComputedStyle(main).paddingLeft) - 28 };
    active = window.innerWidth >= 900 && mr.left >= 80;
    cv.style.display = active ? 'block' : 'none';
    if (!active) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
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
    const Wp = document.documentElement.clientWidth, deep = document.getElementById('deep'), footEl = document.querySelector('.site-footer');
    // The pond ends at the footer (the underwater section below it draws its own water).
    const goFish = document.querySelector('.go-fish'), endEl = goFish || footEl;
    const Hp = deep && endEl ? endEl.getBoundingClientRect().bottom + window.scrollY : document.documentElement.scrollHeight;
    const vx = Math.max(40, main.getBoundingClientRect().left + parseFloat(getComputedStyle(main).paddingLeft) - 28 - 44 + window.scrollX); // the creek's valley

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
    // a few smaller fish nosing around the lily pads in the shallows
    P.pads.forEach((p, i) => {
      for (let n = 0; n < 2; n++) {
        const im = KOI[(i + n) % KOI.length]; if (!im.complete) continue;
        const dir = n ? -1 : 1, th = time * (0.35 + 0.08 * ((i + n) % 3)) * dir + i * 2.1 + n * Math.PI;
        const r = p.s * 0.9 + 14 + n * 10, x = p.x + Math.cos(th) * r * 1.4, y = p.y + Math.sin(th) * r * 0.7;
        const ang = Math.atan2(Math.cos(th) * r * 0.7 * dir, -Math.sin(th) * r * 1.4 * dir) + Math.sin(time * 9 + i + n) * 0.08;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = 0.9; ctx.drawImage(im, -11, -4.5, 22, 9); ctx.restore();
      }
    });
    ctx.globalAlpha = 1;
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

// 10. Research page: a live farm scene driven by the weather sliders, an irrigation
//     calculator, and a short guided tour that pops up the first time it scrolls into view.
(function () {
  const canvas = document.getElementById('eto-scene');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);
  const el = { sun: $('eto-sun'), temp: $('eto-temp'), rh: $('eto-rh'), wind: $('eto-wind'),
    crop: $('eto-crop'), acres: $('eto-acres'), eff: $('eto-eff') };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // FAO-56 mid-season crop coefficients (California values for pistachios).
  const KC = { lettuce: 1.0, broccoli: 1.05, strawberries: 0.85, tomatoes: 1.15, corn: 1.2, cotton: 1.15,
    rice: 1.2, alfalfa: 0.95, almonds: 0.9, pistachios: 1.1, citrus: 0.65, grapes: 0.7 };

  function eto(sunPct, T, RH, u2) {
    const Ra = 40, Rs = (0.25 + 0.5 * sunPct / 100) * Ra, Rso = 0.75 * Ra;
    const es = 0.6108 * Math.exp(17.27 * T / (T + 237.3)), ea = es * RH / 100;
    const Rnl = 4.903e-9 * Math.pow(T + 273.16, 4) * (0.34 - 0.14 * Math.sqrt(ea)) * (1.35 * Rs / Rso - 0.35);
    const Rn = 0.77 * Rs - Rnl;
    const d = 4098 * es / Math.pow(T + 237.3, 2), g = 0.0674;
    return Math.max(0, (0.408 * d * Rn + g * 900 / (T + 273) * u2 * (es - ea)) / (d + g * (1 + 0.34 * u2)));
  }

  const target = {}, cur = {};
  let model = { eto: 0, etc: 0, apply: 0 };
  const env = 'valley'; let crop = 'lettuce';
  const fmt = (n, d) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

  function read() {
    target.sun = +el.sun.value / 100; target.temp = +el.temp.value;
    target.rh = +el.rh.value / 100; target.wind = +el.wind.value;
    const E = eto(+el.sun.value, target.temp, +el.rh.value, target.wind);
    const kc = KC[el.crop.value] || 1, eff = +el.eff.value;
    const acres = Math.max(0, +el.acres.value || 0);
    const etc = E * kc, apply = etc / eff;
    model = { eto: E, etc, apply };
    $('eto-sun-out').textContent = el.sun.value + '% clear';
    $('eto-temp-out').textContent = fmt(target.temp, 0) + ' °C · ' + fmt(target.temp * 9 / 5 + 32, 0) + ' °F';
    $('eto-rh-out').textContent = el.rh.value + '%';
    $('eto-wind-out').textContent = fmt(target.wind, 1) + ' m/s · ' + fmt(target.wind * 2.237, 0) + ' mph';
    $('eto-value').textContent = fmt(E, 1);
    $('eq-eto').textContent = fmt(E, 1);
    $('eq-kc').textContent = fmt(kc, 2);
    $('eq-etc').textContent = fmt(etc, 1);
    $('out-week').textContent = fmt(apply * 7 / 25.4, 1) + ' in/week';
    $('out-gal').textContent = fmt(Math.round(apply / 25.4 * 27154 * acres / 100) * 100, 0) + ' gal/day';
    if (el.crop.value !== crop) { crop = el.crop.value; layout(); }
    if (reduce) { Object.assign(cur, target); draw(0); }
  }

  function paintFill(inp) { inp.style.setProperty('--fill', ((inp.value - inp.min) / (inp.max - inp.min) * 100) + '%'); }
  ['sun', 'temp', 'rh', 'wind'].forEach((k) => { paintFill(el[k]); el[k].addEventListener('input', () => { paintFill(el[k]); read(); }); });
  ['crop', 'acres', 'eff'].forEach((k) => el[k].addEventListener('input', read));

  // ----- helpers -----
  const mix = (a, b, t) => a + (b - a) * t;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(mix(v, B[i], Math.max(0, Math.min(1, t)))).toString(16).padStart(2, '0')).join(''); };
  const circle = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2); ctx.fill(); };
  const ellipse = (x, y, rx, ry, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.3, rx), Math.max(0.3, ry), 0, 0, Math.PI * 2); ctx.fill(); };
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ----- layout -----
  let W = 0, H = 0, horizon = 0, rows = [], heads = [];
  const SPACING = { lettuce: 26, broccoli: 28, strawberries: 18, tomatoes: 32, corn: 15, cotton: 24, rice: 9,
    alfalfa: 10, almonds: 82, pistachios: 82, citrus: 72, grapes: 13 };
  const TREE = { almonds: 1, pistachios: 1, citrus: 1 };
  function layout() {
    rows = [];
    const N = TREE[crop] ? 6 : crop === 'grapes' ? 7 : 9;
    for (let k = 0; k < N; k++) {
      const f = Math.pow((k + 1) / N, 1.35), y = horizon + (H - horizon) * f, sc = (TREE[crop] ? 0.25 + f * 1.05 : 0.3 + f * 1.25);
      const plants = [], gap = SPACING[crop] * sc;
      for (let x = -gap + (k % 2) * gap / 2; x < W + gap; x += gap) plants.push(x);
      rows.push({ y, sc, plants, k });
    }
    const hy = horizon + (H - horizon) * 0.5;
    heads = [{ x: W * 0.34, y: hy }, { x: W * 0.68, y: hy }];
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect(); W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizon = H * 0.5;
    layout();
    if (reduce) draw(0);
  }

  // ----- landscapes -----
  function ridge(base, amp, seed, color, jag) {
    ctx.beginPath(); ctx.moveTo(0, horizon + 2);
    for (let x = 0; x <= W; x += 6) {
      const t = x / W;
      let y = base - amp * (0.55 * Math.sin(t * 5.2 + seed) + 0.3 * Math.sin(t * 11.7 + seed * 2) + 0.6);
      if (jag) y -= amp * jag * (Math.abs(Math.sin(t * 37 + seed * 5)) * 0.3 + Math.abs(Math.sin(t * 71 + seed)) * 0.15);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, horizon + 2); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function snowcaps(base, amp, seed, jag) {
    ctx.save(); ridge(base, amp, seed, 'rgba(0,0,0,0)', jag); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(0, 0, W, base - amp * 0.95);
    ctx.restore();
  }
  function oak(x, y, s, c) { ctx.fillStyle = '#5B4A3A'; ctx.fillRect(x - 1 * s, y - 6 * s, 2 * s, 6 * s); ellipse(x, y - 9 * s, 9 * s, 6 * s, c); }
  function cypress(x, y, s) {
    ctx.fillStyle = '#3B4F45'; ctx.fillRect(x - 1.5 * s, y - 14 * s, 3 * s, 14 * s);
    ellipse(x - 6 * s, y - 16 * s, 12 * s, 4 * s, '#36503F'); ellipse(x + 7 * s, y - 19 * s, 11 * s, 4 * s, '#3E5A48');
  }
  function palm(x, y, s, t, u) {
    ctx.strokeStyle = '#7A5E44'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(x, y);
    const tx = x + 4 * s + Math.sin(t * 1.3) * u * 0.4 * s, ty = y - 34 * s;
    ctx.quadraticCurveTo(x - 3 * s, y - 18 * s, tx, ty); ctx.stroke();
    ctx.strokeStyle = '#4F7A3E'; ctx.lineWidth = 2 * s;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + i * Math.PI / 6 + Math.sin(t * 2 + i) * 0.05 * u;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * 9 * s, ty + Math.sin(a) * 9 * s - 3 * s, tx + Math.cos(a) * 15 * s, ty + Math.sin(a) * 10 * s + 6 * s); ctx.stroke();
    }
  }
  const LAND = {
    valley: { top: '#A8B47E', bottom: '#7C6A4F', haze: [236, 240, 238],
      draw(rh, t, u) {
        ridge(horizon - H * 0.05, H * 0.13, 1.3, mixc('#8EA6BE', '#C6D2DA', rh * 0.6), 0.6);
        snowcaps(horizon - H * 0.05, H * 0.13, 1.3, 0.6);
        ridge(horizon + 2, H * 0.08, 4.1, mixc('#C5AE76', '#D6C9A6', rh * 0.4));
        for (let i = 0; i < 14; i++) oak(W * (i + 0.5) / 14 + rnd(i) * 30, horizon + 1, 0.8 + rnd(i + 3) * 0.6, '#6F8456');
      } }
  };

  // ----- crops -----
  function plant(c, x, y, s, i, k, t, u) {
    const sway = Math.sin(t * (1.6 + u * 0.3) + i * 0.6 + k) * u * 0.35 * s;
    switch (c) {
      case 'lettuce':
        ellipse(x, y, 9 * s, 7.5 * s, '#62AA4C'); ellipse(x - 2.5 * s, y - 2.5 * s, 4.5 * s, 2.6 * s, 'rgba(214,242,165,0.6)'); break;
      case 'broccoli':
        ctx.fillStyle = '#6F9F6A'; ctx.fillRect(x - 1 * s, y - 4 * s, 2 * s, 5 * s);
        circle(x - 4 * s + sway * 0.3, y - 7 * s, 4.6 * s, '#3F7350'); circle(x + 4 * s + sway * 0.3, y - 7 * s, 4.6 * s, '#3F7350'); circle(x + sway * 0.3, y - 10 * s, 5 * s, '#4C8A5C'); break;
      case 'strawberries':
        ellipse(x, y - 2 * s, 6 * s, 4 * s, '#3E8A45'); if (i % 2 === 0) circle(x + 3 * s, y, 1.6 * s, '#D93B3B'); if (i % 3 === 0) circle(x - 3 * s, y + 0.5 * s, 1.4 * s, '#E04A44'); break;
      case 'tomatoes':
        ctx.strokeStyle = '#9B8063'; ctx.lineWidth = Math.max(0.6, 1.2 * s); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 22 * s); ctx.stroke();
        ellipse(x + sway, y - 11 * s, 8 * s, 11 * s, '#4F8E3E'); circle(x + sway - 3 * s, y - 8 * s, 2 * s, '#E2483A'); circle(x + sway + 3 * s, y - 13 * s, 2 * s, '#D63C30'); circle(x + sway + 1 * s, y - 4 * s, 1.8 * s, '#E5763A'); break;
      case 'corn': {
        const h = 34 * s, tx = x + sway * 2.2;
        ctx.strokeStyle = '#7FAA4A'; ctx.lineWidth = Math.max(0.6, 2 * s); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x, y - h / 2, tx, y - h); ctx.stroke();
        ctx.strokeStyle = '#6E9C3E'; ctx.lineWidth = Math.max(0.5, 1.6 * s);
        for (let j = 1; j < 4; j++) { const ly = y - h * j / 4, d = j % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x + sway * j / 2, ly); ctx.quadraticCurveTo(x + d * 7 * s + sway * j, ly - 4 * s, x + d * 11 * s + sway * j, ly + 3 * s); ctx.stroke(); }
        ctx.strokeStyle = '#D9B850'; ctx.beginPath(); ctx.moveTo(tx, y - h); ctx.lineTo(tx - 2 * s, y - h - 5 * s); ctx.moveTo(tx, y - h); ctx.lineTo(tx + 2 * s, y - h - 5 * s); ctx.stroke(); break; }
      case 'cotton':
        ellipse(x + sway * 0.5, y - 6 * s, 8 * s, 7 * s, '#5F8B48'); circle(x - 3 * s, y - 8 * s, 2.2 * s, '#FBFBF6'); circle(x + 3 * s, y - 5 * s, 2.2 * s, '#FFFFFF'); circle(x + 1 * s, y - 11 * s, 1.9 * s, '#F4F4EE'); break;
      case 'rice':
        ctx.strokeStyle = '#8CC255'; ctx.lineWidth = Math.max(0.5, 1.1 * s);
        for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(x + j * 1.2 * s, y); ctx.quadraticCurveTo(x + j * 2 * s, y - 6 * s, x + j * 3 * s + sway * 1.2, y - 13 * s); ctx.stroke(); }
        break;
      case 'alfalfa':
        ellipse(x, y - 3 * s, 7 * s, 5 * s, i % 2 ? '#5E9E48' : '#6AAA50'); if (i % 4 === 0) circle(x + 2 * s, y - 7 * s, 1.3 * s, '#9B7FC6'); break;
      case 'grapes':
        ellipse(x + sway * 0.4, y - 13 * s, 8 * s, 6 * s, i % 2 ? '#5D8C3F' : '#6A9A48'); if (i % 3 === 0) { circle(x, y - 9 * s, 1.6 * s, '#5B3566'); circle(x + 1.5 * s, y - 7.5 * s, 1.4 * s, '#6A3F77'); } break;
      default: { // trees
        const canopy = c === 'citrus' ? '#2F6B3A' : c === 'pistachios' ? '#7E9A62' : '#5E8F4A';
        ctx.fillStyle = '#6A5038'; ctx.fillRect(x - 1.6 * s, y - 14 * s, 3.2 * s, 14 * s);
        const cx = x + sway, cy = y - (c === 'citrus' ? 18 : 24) * s, r = (c === 'citrus' ? 15 : 17) * s;
        ellipse(cx, cy, r, r * (c === 'citrus' ? 0.95 : 0.8), canopy);
        ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.5, r * 0.3, 'rgba(255,255,255,0.12)');
        const fruit = c === 'citrus' ? '#F29A2E' : c === 'pistachios' ? '#C9787A' : '#F3E9D8';
        for (let j = 0; j < 5; j++) circle(cx + (rnd(i * 7 + j + k * 31) - 0.5) * r * 1.4, cy + (rnd(i * 3 + j + k * 17) - 0.4) * r * 0.9, (c === 'almonds' ? 1.4 : 1.8) * s, fruit);
      }
    }
  }
  function rowBed(c, r, t, u) {
    const s = r.sc;
    if (c === 'rice') return;
    if (c === 'strawberries') { ctx.fillStyle = 'rgba(232,232,226,0.85)'; ctx.fillRect(0, r.y - 6 * s, W, 8 * s); return; }
    if (c === 'alfalfa') return;
    if (c === 'grapes') {
      ctx.strokeStyle = 'rgba(90,80,70,0.7)'; ctx.lineWidth = Math.max(0.5, 0.8 * s);
      ctx.beginPath(); ctx.moveTo(0, r.y - 13 * s); ctx.lineTo(W, r.y - 13 * s); ctx.stroke();
      ctx.fillStyle = '#7B6450'; for (let x = (r.k % 2) * 30 * s; x < W; x += 60 * s) ctx.fillRect(x, r.y - 17 * s, 1.6 * s, 17 * s);
    }
    ctx.fillStyle = 'rgba(92,70,48,0.35)'; ctx.fillRect(0, r.y - 4 * s, W, 7 * s);
  }

  // ----- clouds, particles -----
  const clouds = Array.from({ length: 8 }, (_, i) => ({ x: i / 8 + rnd(i) * 0.05, y: 0.06 + rnd(i + 2) * 0.2, s: 0.7 + rnd(i + 5) * 0.6 }));
  clouds[0] = { x: 0.78, y: 0.13, s: 1.3 };
  const vapor = [], drops = [];
  function cloud(cx, cy, s, alpha, shade) {
    ctx.globalAlpha = alpha; ctx.fillStyle = shade; ctx.beginPath();
    [[0, 0, 26], [24, -10, 22], [48, 0, 24], [22, 8, 24], [-20, 6, 18], [66, 8, 16]].forEach(([dx, dy, r]) => {
      ctx.moveTo(cx + (dx + r) * s, cy + dy * s); ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    });
    ctx.fill(); ctx.globalAlpha = 1;
  }

  let last = 0, time = 0;
  function draw(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; time += dt;
    if (!reduce) for (const k in target) cur[k] = cur[k] === undefined ? target[k] : mix(cur[k], target[k], Math.min(1, dt * 4));
    const s = cur.sun, heat = (cur.temp - 5) / 35, rh = cur.rh, u = cur.wind;
    const unit = Math.min(W, 1400) / 1400 + 0.35;
    const L = LAND[env];

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, mixc('#9AA8B0', '#4FA6D3', s));
    sky.addColorStop(1, mixc(mixc('#D7DEE1', '#CDEBF4', s), '#F7D9A6', heat * s * 0.7));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon + 4);

    // sun
    const sx = W * 0.8, sy = H * 0.18, sr = 30 * unit + heat * 8;
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4);
    glow.addColorStop(0, 'rgba(255,224,130,' + (0.55 * s) + ')'); glow.addColorStop(1, 'rgba(255,224,130,0)');
    ctx.fillStyle = glow; ctx.fillRect(sx - sr * 4, sy - sr * 4, sr * 8, sr * 8);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(time * 0.15);
    ctx.strokeStyle = 'rgba(255,205,90,' + (0.2 + 0.7 * s) + ')'; ctx.lineWidth = 3 * unit; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(sr * 1.35, 0); ctx.lineTo(sr * (1.6 + 0.5 * heat + 0.1 * Math.sin(time * 2 + i)), 0); ctx.stroke(); }
    ctx.restore();
    circle(sx, sy, sr, mixc('#F3E3B0', '#FFD45C', s));

    // clouds
    const cAlpha = 0.04 + 0.96 * Math.pow(1 - s, 0.8), shade = mixc('#FFFFFF', '#C9D2D7', (1 - s) * 0.8);
    clouds.forEach((c, i) => {
      if (!reduce) c.x += (0.004 + u * 0.006) * dt * (0.8 + (i % 3) * 0.2);
      if (c.x > 1.15) c.x = -0.15;
      cloud(c.x * W, c.y * H, c.s * unit, i === 0 ? cAlpha : Math.min(1, cAlpha * 1.1 + (i < 3 ? 0.06 : 0)), shade);
    });

    // land behind the field: cross-fade between environments
    L.draw(rh, time, u);

    // haze at the horizon
    const hz = L.haze;
    const haze = ctx.createLinearGradient(0, horizon - H * 0.25, 0, horizon + H * 0.04);
    haze.addColorStop(0, 'rgba(' + hz + ',0)'); haze.addColorStop(1, 'rgba(' + hz + ',' + (0.75 * rh) + ')');
    ctx.fillStyle = haze; ctx.fillRect(0, horizon - H * 0.25, W, H * 0.3);

    // field
    let top = L.top, bottom = L.bottom;
    top = mixc(top, '#C9B27A', heat * heat * 0.6); bottom = mixc(bottom, '#9A7A55', heat * heat * 0.4);
    if (crop === 'rice') { top = mixc('#8DB3B0', top, 0.25); bottom = mixc('#5E8C93', bottom, 0.2); }
    if (crop === 'alfalfa') { top = mixc(top, '#7EAA5A', 0.7); bottom = mixc(bottom, '#4E8A3E', 0.75); }
    const ground = ctx.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, top); ground.addColorStop(1, bottom);
    ctx.fillStyle = ground; ctx.fillRect(0, horizon, W, H - horizon);
    if (crop === 'rice') {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (let i = 0; i < 18; i++) ctx.fillRect((rnd(i) * W + time * 4 * (1 + u)) % W, horizon + (H - horizon) * rnd(i + 40), 40 + rnd(i + 7) * 60, 1.5);
    }
    const sys = +el.eff.value >= 0.85 ? 'drip' : +el.eff.value <= 0.65 ? 'furrow' : 'sprinkler';
    rows.forEach((r, k) => {
      rowBed(crop, r, time, u);
      const s2 = r.sc;
      if (sys === 'furrow') {
        // water running down the furrow between this row and the one behind it
        const prevY = k ? rows[k - 1].y : horizon, fy = (prevY + r.y) / 2 + 2 * s2, fh = Math.max(1.5, 3.6 * s2);
        ctx.fillStyle = 'rgba(79,170,196,0.85)'; ctx.fillRect(0, fy - fh / 2, W, fh);
        ctx.fillStyle = 'rgba(225,246,250,0.75)';
        const flow = 30 + model.apply * 6;
        for (let j = 0; j < 7; j++) { const x = ((rnd(j + k * 13) * W + time * flow * s2) % (W + 60)) - 30; ctx.fillRect(x, fy - fh * 0.2, 18 * s2, Math.max(0.6, fh * 0.3)); }
      }
      if (sys === 'drip') {
        // drip tape along the row, with emitters dripping at each plant
        ctx.strokeStyle = '#2A302F'; ctx.lineWidth = Math.max(0.6, 1.3 * s2);
        ctx.beginPath(); ctx.moveTo(0, r.y + 1.5 * s2); ctx.lineTo(W, r.y + 1.5 * s2); ctx.stroke();
        const rate = 0.25 + model.apply * 0.06;
        r.plants.forEach((x, i) => {
          ctx.fillStyle = 'rgba(70,48,30,0.28)'; ctx.beginPath(); ctx.ellipse(x + 4 * s2, r.y + 2.5 * s2, 7 * s2, 2.4 * s2, 0, 0, Math.PI * 2); ctx.fill();
          const ph = (time * rate + rnd(i + k * 7)) % 1;
          ctx.fillStyle = 'rgba(79,179,200,' + (0.95 - ph * 0.6) + ')';
          ctx.beginPath(); ctx.arc(x + 4 * s2, r.y + 1.5 * s2 + ph * 3 * s2, Math.max(0.9, 1.9 * s2), 0, Math.PI * 2); ctx.fill();
        });
      }
      r.plants.forEach((x, i) => plant(crop, x, r.y - 2 * r.sc, r.sc, i, r.k, time, u));
    });

    // low fog when it's humid and gray
    const fogA = Math.max(0, rh - 0.55) * 1.4 * (1.1 - s);
    if (fogA > 0.01) {
      const fog = ctx.createLinearGradient(0, horizon - H * 0.08, 0, horizon + (H - horizon) * 0.6);
      fog.addColorStop(0, 'rgba(236,242,244,' + fogA + ')'); fog.addColorStop(1, 'rgba(236,242,244,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, horizon - H * 0.08, W, H);
    }

    // water vapor rising (rate follows ETo)
    if (!reduce) {
      let n = model.eto * 7 * dt * (W / 900);
      while (n > 0) {
        if (Math.random() < n) {
          const r = rows[1 + Math.floor(Math.random() * (rows.length - 2))];
          vapor.push({ x: Math.random() * W, y: r.y - 12 * r.sc, sc: r.sc, life: 0, max: 2.4 + Math.random() * 1.6, ph: Math.random() * 6 });
        }
        n -= 1;
      }
    }
    ctx.lineCap = 'round';
    for (let i = vapor.length - 1; i >= 0; i--) {
      const v = vapor[i]; v.life += dt;
      if (v.life > v.max) { vapor.splice(i, 1); continue; }
      v.y -= (16 + 10 * v.sc) * dt; v.x += u * 9 * dt;
      const a = Math.sin(Math.PI * v.life / v.max) * 0.75, len = 14 * v.sc + 6;
      ctx.strokeStyle = 'rgba(232,247,255,' + (a * 0.7) + ')'; ctx.lineWidth = 1.6 * v.sc + 0.6;
      ctx.beginPath(); ctx.moveTo(v.x, v.y);
      ctx.bezierCurveTo(v.x + 5 * v.sc * Math.sin(time * 3 + v.ph), v.y - len / 3, v.x - 5 * v.sc * Math.sin(time * 3 + v.ph), v.y - 2 * len / 3, v.x + 2 * v.sc, v.y - len); ctx.stroke();
    }

    // sprinklers (spray follows the water to apply)
    if (sys === 'furrow') {
      // a head ditch along the left edge feeding the furrows
      ctx.fillStyle = 'rgba(79,170,196,0.8)'; ctx.beginPath(); ctx.moveTo(0, horizon + 4); ctx.lineTo(W * 0.012, horizon + 4); ctx.lineTo(W * 0.03, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    }
    if (sys === 'sprinkler') heads.forEach((h) => {
      const sc = Math.max(0.55, Math.min(1.1, H / 480));
      ctx.strokeStyle = '#5E6B70'; ctx.lineWidth = 3 * sc; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x, h.y - 40 * sc); ctx.stroke();
      circle(h.x, h.y - 41 * sc, 4 * sc, '#3E4A4F');
      if (!reduce) {
        let n = model.apply * 22 * dt * sc;
        while (n > 0) {
          if (Math.random() < n) {
            const ang = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.9), sp = (95 + Math.random() * 75) * sc;
            drops.push({ x: h.x, y: h.y - 41 * sc, vx: Math.sin(ang) * sp, vy: -Math.cos(ang) * sp * 0.9, g: 140 * sc, floor: h.y + (4 + Math.random() * 18) * sc });
          }
          n -= 1;
        }
      } else {
        ctx.strokeStyle = 'rgba(79,179,200,0.7)'; ctx.lineWidth = 2;
        [-1, 1].forEach((d) => { ctx.beginPath(); ctx.moveTo(h.x, h.y - 41 * sc); ctx.quadraticCurveTo(h.x + d * 50 * sc, h.y - 95 * sc, h.x + d * 100 * sc, h.y); ctx.stroke(); });
      }
    });
    ctx.fillStyle = 'rgba(46,155,181,0.85)';
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += d.g * dt; d.vx += u * 8 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.y > d.floor && d.vy > 0) { drops.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(d.x, d.y, 2.1, 0, Math.PI * 2); ctx.fill();
    }

    // windsock
    const px = W * 0.93, py = horizon + (H - horizon) * 0.22, ph = 60 * unit;
    ctx.strokeStyle = '#4A5559'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - ph); ctx.stroke();
    const lift = Math.min(1, u / 6), angle = mix(1.35, 0.05, lift) + Math.sin(time * (2 + u)) * 0.06 * lift;
    ctx.save(); ctx.translate(px, py - ph + 2); ctx.rotate(angle);
    const sl = 36 * unit;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#FFFFFF' : '#E9763A';
      const x0 = sl * i / 4, x1 = sl * (i + 1) / 4, h0 = 7 * unit * (1 - 0.35 * i / 4), h1 = 7 * unit * (1 - 0.35 * (i + 1) / 4);
      ctx.beginPath(); ctx.moveTo(x0, -h0); ctx.lineTo(x1, -h1); ctx.lineTo(x1, h1); ctx.lineTo(x0, h0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    if (!reduce && running) requestAnimationFrame(draw);
  }

  let running = false;
  function start() { if (!running && !reduce) { running = true; last = 0; requestAnimationFrame(draw); } }
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) start(); else running = false; })).observe(canvas);
  window.addEventListener('resize', resize);
  resize(); read();
  Object.assign(cur, target);
  draw(0);
  setupTour();

  // ----- guided tour -----
  function setupTour() {
    const card = document.querySelector('.eto-card'), coach = document.querySelector('.coach');
    if (!card || !coach) return;
    const stepEl = coach.querySelector('.coach-step'), titleEl = coach.querySelector('.coach-title'), textEl = coach.querySelector('.coach-text');
    const nextBtn = coach.querySelector('.coach-next'), skipBtn = coach.querySelector('.coach-skip');
    const prog = document.createElement('div'); prog.className = 'coach-progress'; prog.innerHTML = '<i></i>'; coach.insertBefore(prog, coach.querySelector('.coach-actions'));
    const bar = prog.firstChild;
    const start = { sun: +el.sun.value, temp: +el.temp.value, rh: +el.rh.value, wind: +el.wind.value };
    const steps = [
      { key: 'sun', title: 'Meet the weather', text: 'Each slider is one ingredient of atmospheric thirst (ETo). Drag one and watch the big number on the farm change. Here’s what each one does.' },
      { key: 'sun', to: 100, title: 'Turn up the sun', text: 'Sunlight is the energy that turns water into vapor. More sun means more evaporation, so ETo goes up.' },
      { key: 'temp', to: 36, title: 'Warm it up', text: 'Warm air can hold more water vapor, so it pulls more water from wet leaves and soil.' },
      { key: 'rh', to: 15, title: 'Dry out the air', text: 'Dry air is thirstier. When the air is already holding very little moisture, water escapes faster.' },
      { key: 'wind', to: 6, title: 'Add some wind', text: 'Wind sweeps away the damp air sitting right above the crop and brings in drier air, so evaporation keeps going.' },
      { key: 'sun', reset: true, title: 'Now you try', text: 'Every change also flows into the irrigation calculator below: higher ETo means more water to apply. Pick a crop and play.' }
    ];
    let i = -1, timers = [], active = false, anim = 0;
    const clear = () => { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(anim); };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const label = (k) => el[k].closest('.eto-slider');
    function tween(k, to, ms, done) {
      const inp = el[k], from = +inp.value, t0 = performance.now();
      if (reduce) { inp.value = to; paintFill(inp); read(); return done && done(); }
      (function step(now) {
        const p = Math.min(1, (now - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        inp.value = from + (to - from) * e; paintFill(inp); read();
        if (p < 1) anim = requestAnimationFrame(step); else if (done) done();
      })(performance.now());
    }
    function autoAdvance(ms) {
      bar.style.transition = 'none'; bar.style.width = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '100%'; }));
      later(go, ms);
    }
    function go() {
      clear(); i += 1;
      if (i >= steps.length) return end();
      const st = steps[i];
      document.querySelectorAll('.eto-slider').forEach((l) => l.classList.toggle('is-focus', !!st.to && l === label(st.key)));
      stepEl.textContent = (i + 1) + ' of ' + steps.length;
      titleEl.textContent = st.title; textEl.textContent = st.text;
      nextBtn.textContent = i === steps.length - 1 ? 'Got it' : 'Next';
      coach.hidden = false;
      const lay = coach.parentElement.getBoundingClientRect(); coach.style.top = (label(st.key).getBoundingClientRect().top - lay.top) + 'px';
      const side = document.querySelector('.eto-side'); if (side) coach.parentElement.style.setProperty('--side-w', side.offsetWidth + 'px');
      if (st.to !== undefined) {
        const before = model.eto;
        later(() => tween(st.key, st.to, 1500, () => {
          textEl.textContent = st.text + ' ETo went from ' + fmt(before, 1) + ' to ' + fmt(model.eto, 1) + ' mm/day.';
          autoAdvance(11000);
        }), 500);
      } else if (st.reset) {
        let n = 0; const keys = Object.keys(start);
        keys.forEach((k) => tween(k, start[k], 1200, () => { if (++n === keys.length) bar.style.width = '100%'; }));
      } else autoAdvance(12000);
    }
    function end() {
      clear(); active = false; coach.hidden = true;
      document.querySelectorAll('.eto-slider').forEach((l) => l.classList.remove('is-focus'));
    }
    function begin() { if (active) return; active = true; i = -1; go(); }
    nextBtn.addEventListener('click', () => (i >= steps.length - 1 ? end() : go()));
    skipBtn.addEventListener('click', end);
    document.querySelector('.eto-tour-btn').addEventListener('click', () => { end(); begin(); });
    // A real drag by the visitor ends the tour so it never fights them.
    ['sun', 'temp', 'rh', 'wind'].forEach((k) => el[k].addEventListener('input', (e) => { if (active && e.isTrusted) end(); }));
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(begin, 600); }
    }, { threshold: 0.6 });
    io.observe(card);
  }
})();

// 11. Research page: nudge ETo and watch the net irrigation requirement move.
(function () {
  const inp = document.getElementById('nir-shift');
  if (!inp) return;
  const $ = (id) => document.getElementById(id);
  const BASE = 5, KC = 1, DAYS = 180, ACRES = 1e6, MM_PER_FT = 304.8, POOL_AF = 2.03;
  const fmt = (n, d) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  const nir = (eto) => eto * KC * DAYS / MM_PER_FT * ACRES; // acre-feet
  function update() {
    const pct = +inp.value, eto = BASE * (1 + pct / 100), total = nir(eto), diff = total - nir(BASE);
    $('nir-shift-out').textContent = (pct > 0 ? '+' : '') + pct + '%';
    $('nir-eto').textContent = fmt(eto, 2);
    $('nir-total').textContent = fmt(total / 1e6, 2);
    $('nir-diff').textContent = diff === 0 ? '0' : (diff > 0 ? '+' : '−') + fmt(Math.abs(diff) / 1000, 0) + 'k';
    $('nir-pools').textContent = diff === 0 ? 'acre-feet' : 'acre-feet, about ' + fmt(Math.abs(diff) / POOL_AF, 0) + ' Olympic pools';
    const mid = 50, pos = (pct + 20) / 40 * 100;
    inp.style.setProperty('--lo', Math.min(mid, pos) + '%'); inp.style.setProperty('--hi', Math.max(mid, pos) + '%');
  }
  inp.addEventListener('input', update);
  update();
})();

// 12. Research page: hover a legend item to light up its terms in the Penman–Monteith equation.
(function () {
  const eq = document.querySelector('.pm-eq');
  if (!eq) return;
  document.querySelectorAll('.pm-legend li').forEach((li) => {
    li.tabIndex = 0;
    const on = () => eq.setAttribute('data-active', li.dataset.k), off = () => eq.removeAttribute('data-active');
    li.addEventListener('mouseenter', on); li.addEventListener('focus', on);
    li.addEventListener('mouseleave', off); li.addEventListener('blur', off);
  });
})();

// 13. Research page: a three-step illustration of how a machine learning model
//     learns from stations + satellites, then predicts everywhere.
(function () {
  const root = document.getElementById('ml-demo');
  if (!root) return;
  const svg = root.querySelector('.ml-svg'), tip = root.querySelector('.ml-tip'), cap = root.querySelector('.ml-caption');
  const tabs = [...root.querySelectorAll('.ml-steps button')];
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = 20, ROWS = 13, CW = 25, X0 = 20, Y0 = 34;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const ramp = (a, b) => (t) => 'rgb(' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',') + ')';
  const lstC = ramp('#FCEBD3', '#D45A26'), etoC = ramp('#E3F3F1', '#1F4E58');
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const lst = (i, j) => clamp(0.12 + 0.72 * Math.pow(i / (COLS - 1), 0.85) + 0.12 * Math.sin(j * 0.6 + i * 0.35));
  const eto = (i, j) => clamp(0.1 + 0.82 * lst(i, j) + 0.05 * Math.cos(i * 0.9 - j * 0.5));
  const toC = (v) => Math.round(14 + v * 32), toMM = (v) => (1 + v * 7.5).toFixed(1);
  const stations = [[1, 3], [2, 9], [4, 6], [6, 11], [8, 2], [9, 7], [11, 10], [13, 4], [15, 8], [17, 2], [18, 11]];

  // map
  mk('text', { x: X0, y: 22, class: 'ml-title', 'font-size': 15, 'font-weight': 600, fill: '#1F4E58' }).textContent = '';
  const mapTitle = svg.lastChild;
  const cells = [];
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const r = mk('rect', { x: X0 + i * CW, y: Y0 + j * CW, width: CW - 1, height: CW - 1, rx: 3, fill: lstC(lst(i, j)) });
    r.style.transition = 'fill 0.6s ease';
    r.dataset.i = i; r.dataset.j = j; cells.push(r);
  }
  const stG = mk('g', {});
  stations.forEach(([i, j]) => {
    const cx = X0 + i * CW + CW / 2, cy = Y0 + j * CW + CW / 2;
    const g = mk('g', {}, stG);
    mk('circle', { cx, cy, r: 13, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2, class: 'ml-ring' }, g);
    mk('circle', { cx, cy, r: 7, fill: '#FFFFFF', stroke: '#1F4E58', 'stroke-width': 2.5 }, g);
  });
  // scatter
  const PX0 = 600, PX1 = 840, PY0 = 60, PY1 = 300;
  mk('text', { x: PX0 - 40, y: 22, 'font-size': 15, 'font-weight': 600, fill: '#1F4E58' }).textContent = 'What the model learns';
  mk('line', { x1: PX0, y1: PY1, x2: PX1, y2: PY1, stroke: '#9BB8BC', 'stroke-width': 1.5 });
  mk('line', { x1: PX0, y1: PY0, x2: PX0, y2: PY1, stroke: '#9BB8BC', 'stroke-width': 1.5 });
  mk('text', { x: (PX0 + PX1) / 2, y: PY1 + 30, 'text-anchor': 'middle', 'font-size': 13, fill: '#4C5956' }).textContent = 'Satellite ground temperature →';
  const yl = mk('text', { x: PX0 - 16, y: (PY0 + PY1) / 2, 'text-anchor': 'middle', 'font-size': 13, fill: '#4C5956', transform: `rotate(-90 ${PX0 - 16} ${(PY0 + PY1) / 2})` }); yl.textContent = 'Station ETo →';
  const empty = mk('text', { x: (PX0 + PX1) / 2, y: (PY0 + PY1) / 2, 'text-anchor': 'middle', 'font-size': 14, fill: '#9BB8BC' }); empty.textContent = 'No examples yet';
  const fit = mk('path', { d: '', fill: 'none', stroke: '#2E7484', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const pts = stations.map(([i, j], k) => {
    const p = mk('circle', { cx: PX0 + 10 + lst(i, j) * (PX1 - PX0 - 20), cy: PY1 - 10 - eto(i, j) * (PY1 - PY0 - 20), r: 6, fill: '#E2683A', stroke: '#FFFFFF', 'stroke-width': 2 });
    p.style.transition = 'opacity 0.4s ease ' + (k * 0.12) + 's, transform 0.4s ease ' + (k * 0.12) + 's';
    p.style.transformOrigin = p.getAttribute('cx') + 'px ' + p.getAttribute('cy') + 'px';
    return p;
  });
  // fitted curve through the cloud
  let d = '';
  for (let x = 0; x <= 1.0001; x += 0.05) { const y = clamp(0.1 + 0.82 * x); d += (d ? 'L' : 'M') + (PX0 + 10 + x * (PX1 - PX0 - 20)).toFixed(1) + ' ' + (PY1 - 10 - y * (PY1 - PY0 - 20)).toFixed(1); }
  fit.setAttribute('d', d);
  const fitLen = 330; fit.style.strokeDasharray = fitLen; fit.style.transition = 'stroke-dashoffset 1.2s ease 1.2s';
  const legend = mk('g', { transform: `translate(${X0} ${Y0 + ROWS * CW + 14})` });
  const legRect = mk('rect', { x: 0, y: 0, width: 160, height: 10, rx: 3 }, legend);
  const defs = mk('defs', {});
  const grad = mk('linearGradient', { id: 'ml-grad' }, defs);
  const s0 = mk('stop', { offset: '0' }, grad), s1 = mk('stop', { offset: '1' }, grad);
  legRect.setAttribute('fill', 'url(#ml-grad)');
  const legLo = mk('text', { x: 168, y: 9, 'font-size': 12, fill: '#4C5956' }, legend);

  const CAPS = [
    '<strong>Collect examples.</strong> Satellites measure ground temperature everywhere (orange). Weather stations (white dots) measure ETo in only a few places.',
    '<strong>Learn the pattern.</strong> Wherever a station and a satellite pixel overlap, the model gets one example. From many examples, it learns how ground temperature, location and season relate to ETo.',
    '<strong>Predict everywhere.</strong> Now the model uses satellite data alone to estimate ETo for every pixel, including all the places without a station. Hover a pixel to see its estimate.'
  ];
  let step = -1, timers = [];
  function show(n) {
    step = n;
    tabs.forEach((t, k) => t.setAttribute('aria-selected', k === n ? 'true' : 'false'));
    cap.innerHTML = CAPS[n];
    mapTitle.textContent = n < 2 ? 'Satellite: ground temperature' : 'Model: estimated ETo';
    const pred = n === 2;
    cells.forEach((r) => {
      const i = +r.dataset.i, j = +r.dataset.j;
      r.style.transitionDelay = pred && !reduce ? (i * 0.04) + 's' : '0s';
      r.setAttribute('fill', pred ? etoC(eto(i, j)) : lstC(lst(i, j)));
    });
    s0.setAttribute('stop-color', pred ? '#E3F3F1' : '#FCEBD3'); s1.setAttribute('stop-color', pred ? '#1F4E58' : '#D45A26');
    legLo.textContent = pred ? 'Lower → higher ETo' : 'Cooler → hotter ground';
    const learned = n >= 1;
    empty.style.opacity = learned ? 0 : 1;
    pts.forEach((p) => { p.style.opacity = learned ? 1 : 0; p.style.transform = learned ? 'scale(1)' : 'scale(0.2)'; });
    fit.style.strokeDashoffset = learned ? 0 : fitLen;
    fit.style.transitionDelay = n === 1 && !reduce ? '1.4s' : '0s';
    stG.querySelectorAll('.ml-ring').forEach((c) => c.classList.toggle('pulse', n === 1));
  }
  function stopAuto() { timers.forEach(clearTimeout); timers = []; }
  tabs.forEach((t, k) => t.addEventListener('click', () => { stopAuto(); show(k); }));
  svg.addEventListener('mousemove', (e) => {
    const r = e.target.closest && e.target.closest('rect[data-i]');
    if (!r || step !== 2) { tip.hidden = true; return; }
    const i = +r.dataset.i, j = +r.dataset.j, box = svg.getBoundingClientRect(), sc = box.width / 860;
    tip.textContent = 'Ground ' + toC(lst(i, j)) + ' °C → ETo ' + toMM(eto(i, j)) + ' mm/day';
    tip.style.left = ((X0 + i * CW + CW / 2) * sc) + 'px'; tip.style.top = ((Y0 + j * CW) * sc) + 'px'; tip.hidden = false;
  });
  svg.addEventListener('mouseleave', () => { tip.hidden = true; });
  show(0);
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    if (reduce) return;
    timers.push(setTimeout(() => show(1), 6000), setTimeout(() => show(2), 13000));
  }, { threshold: 0.6 });
  io.observe(svg);
})();

// 14. Navigation: mark the current page, and a water "wipe" between pages.
(function () {
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.site-header .nav a').forEach((a) => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { sessionStorage.removeItem('wave'); } catch (e) {}
  setTimeout(() => document.documentElement.classList.remove('wave-in'), 900);
  if (reduce) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // same-page anchors scroll normally
    e.preventDefault();
    const veil = document.createElement('div'); veil.className = 'wave-veil'; document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('up')));
    try { sessionStorage.setItem('wave', '1'); } catch (err) {}
    setTimeout(() => { location.href = url.href; }, 620);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) document.querySelectorAll('.wave-veil').forEach((v) => v.remove()); });
})();

// 15. Home page: a fishing game below the pond. Move the lure with the arrow keys
//     (or drag), hook a fish, reel it in, and catch all six species to open the chest.
(function () {
  const sec = document.getElementById('deep');
  if (!sec) return;
  const cv = sec.querySelector('.deep-canvas'), ctx = cv.getContext('2d');
  const $ = (s) => sec.querySelector(s);
  const depthEl = $('.deep-depth strong'), countEl = $('.deep-count'), tray = $('.deep-tray-list');
  const reelBtn = $('.deep-reel'), bubble = $('.deep-bubble'), rainBtn = $('.deep-rain');
  const intro = $('.deep-intro'), catchBox = $('.deep-catch'), treasure = $('.deep-treasure');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPECIES = {
    roach: { name: 'California roach', tag: 'Native', size: 20, zone: [0.12, 0.3], n: 3, speed: 34, school: 4,
      fact: 'This little native minnow turned out to be several fish in one: a 2019 genetic study split the “California roach” into four species and four subspecies.' },
    trout: { name: 'rainbow trout', tag: 'Native', size: 46, zone: [0.22, 0.42], n: 2, speed: 42,
      fact: 'California’s state freshwater fish since 1947, the golden trout, is usually considered a subspecies of the rainbow trout.' },
    sacperch: { name: 'Sacramento perch', tag: 'Native', size: 36, zone: [0.38, 0.56], n: 2, speed: 22,
      fact: 'It’s the only member of the sunfish family native west of the Rocky Mountains. Today it survives only in introduced populations outside its original range.' },
    tule: { name: 'tule perch', tag: 'Native', size: 30, zone: [0.5, 0.68], n: 2, speed: 26,
      fact: 'The only freshwater member of the surfperch family. Like its ocean relatives, it gives birth to live young instead of laying eggs.' },
    bass: { name: 'largemouth bass', tag: 'Introduced', size: 54, zone: [0.6, 0.78], n: 2, speed: 30,
      fact: 'Not native to California. The first ones were brought from Illinois to Lake Cuyamaca in San Diego County in 1891, and now they’re found throughout the state.' },
    catfish: { name: 'channel catfish', tag: 'Introduced', size: 60, zone: [0.8, 0.9], n: 2, speed: 18,
      fact: 'Introduced from the eastern U.S. Its whisker-like barbels are covered in taste buds, which help it find food in dark, muddy water.' }
  };
  const CRAWDAD_FACT = 'Most crawdads in California’s rivers and ponds are introduced. The signal crayfish, brought here in 1912, now threatens the Shasta crayfish, California’s last native crayfish.';
  const KEYS = Object.keys(SPECIES);
  const caught = new Set();
  const SURF = 160, MAXD = 12, BOAT_S = 1.45;
  let umb = 0, hasKey = false;
  const litter = [];
  let W = 0, H = 0, WH = 0, FLOOR = 0, dpr = 1, cam = 0, time = 0, last = 0, running = false, playing = false, raining = false;
  let lure = { x: 0, y: 0, tx: null, ty: null }, boatX = 0, keys = {}, hooked = null, reeling = false, modalOpen = false;
  let fish = [], grass = [], rocks = [], coins = [], bubbles = [], ripples = [], crab = null, chest = { x: 0, open: false, shake: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- setup
  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = sec.clientWidth; H = window.innerHeight; WH = sec.offsetHeight; FLOOR = WH - 90;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (!lure.x) { lure.x = boatX = W * 0.5; lure.y = SURF + 160; }
    lure.x = Math.min(lure.x, W - 30);
    chest.x = W * 0.78;
    if (!fish.length) populate();
    grass = []; for (let x = 10; x < W; x += rnd(24, 64)) if (Math.abs(x - chest.x) > 90) grass.push({ x, h: rnd(70, 190), ph: rnd(0, 6), c: Math.random() < 0.5 ? '#3E7F55' : '#2F6B48' });
    rocks = []; for (let i = 0; i < Math.max(6, W / 160); i++) { const x = rnd(0, W); if (Math.abs(x - chest.x) > 110) rocks.push({ x, r: rnd(14, 38), c: Math.random() < 0.5 ? '#41545A' : '#36474D' }); }
    litter.length = 0; [['can', 0.12, '#C8423A'], ['bottle', 0.33], ['can', 0.47, '#3E78B3'], ['bag', 0.58], ['can', 0.92, '#E0A030']].forEach(([t, fx, c]) => { const x = fx * W; if (Math.abs(x - chest.x) > 120) litter.push({ t, x, c, r: rnd(-0.4, 0.4) }); });
    coins = []; for (let i = 0; i < 26; i++) coins.push({ x: chest.x + rnd(-110, 110), y: FLOOR + rnd(-4, 14), r: rnd(4, 7), ph: rnd(0, 6) });
  }
  function spawn(f) { const sp = SPECIES[f.k]; f.x = Math.random() < 0.5 ? -0.08 : 1.08; f.dir = f.x < 0 ? 1 : -1; f.fy = rnd(sp.zone[0], sp.zone[1]); }
  function populate() {
    fish = [];
    KEYS.forEach((k) => {
      const sp = SPECIES[k];
      for (let i = 0; i < sp.n; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1, fy = rnd(sp.zone[0], sp.zone[1]), x = rnd(0, 1), count = sp.school || 1;
        for (let j = 0; j < count; j++) fish.push({ k, x, fy: fy + j * 0.006, off: j * 26, dir, sp: sp.speed * rnd(0.8, 1.2), ph: rnd(0, 6), cool: 0 });
      }
    });
    crab = { x: rnd(0.1, 0.6), dir: 1, cool: 0 };
  }

  // ---------- drawing
  function ell(c, x, y, rx, ry, col, rot) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot || 0, 0, Math.PI * 2); c.fill(); }
  function drawFish(c, k, x, y, dir, ph, wig, scale, mono) {
    const sp = SPECIES[k], L = sp.size * (scale || 1), d = dir;
    const col = (h) => (mono ? mono : h);
    c.save(); c.translate(x, y); c.scale(d, 1); c.rotate(Math.sin(time * 6 + ph) * 0.05 + (wig || 0));
    const tail = (h, w) => { c.fillStyle = col(h); c.beginPath(); c.moveTo(-L * 0.42, 0); c.lineTo(-L * 0.62, -w + Math.sin(time * 9 + ph) * L * 0.04); c.lineTo(-L * 0.58, 0); c.lineTo(-L * 0.62, w + Math.sin(time * 9 + ph) * L * 0.04); c.closePath(); c.fill(); };
    const eye = (ex) => { if (mono) return; ell(c, ex, -L * 0.04, L * 0.035 + 1, L * 0.035 + 1, '#F4F1E6'); ell(c, ex + 0.6, -L * 0.04, L * 0.02 + 0.6, L * 0.02 + 0.6, '#14211F'); };
    switch (k) {
      case 'roach': tail('#8FA3A6', L * 0.2); ell(c, 0, 0, L * 0.45, L * 0.16, col('#B9C7C6')); ell(c, 0, -L * 0.06, L * 0.4, L * 0.07, col('#6E8486')); eye(L * 0.3); break;
      case 'trout': tail('#7F8C55', L * 0.2); ell(c, 0, 0, L * 0.46, L * 0.15, col('#C9CDA6')); ell(c, 0, -L * 0.05, L * 0.44, L * 0.09, col('#7F8C55'));
        if (!mono) { c.fillStyle = 'rgba(226,120,140,0.75)'; c.fillRect(-L * 0.36, -L * 0.015, L * 0.7, L * 0.045); c.fillStyle = '#2B3324'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-L * 0.35 + i * L * 0.08, -L * 0.08 + (i % 2) * L * 0.04, L * 0.026, 0, 7); c.fill(); } } eye(L * 0.32); break;
      case 'sacperch': tail('#8A7B4E', L * 0.24); ell(c, 0, 0, L * 0.42, L * 0.26, col('#C2AE73')); if (!mono) { c.fillStyle = 'rgba(60,52,30,0.55)'; for (let i = 0; i < 6; i++) c.fillRect(-L * 0.28 + i * L * 0.1, -L * 0.22, L * 0.04, L * 0.4); } ell(c, -L * 0.02, -L * 0.24, L * 0.26, L * 0.06, col('#8A7B4E')); eye(L * 0.28); break;
      case 'tule': tail('#7B7290', L * 0.2); ell(c, 0, 0, L * 0.42, L * 0.22, col('#A69CB5')); if (!mono) { c.fillStyle = 'rgba(232,206,120,0.6)'; for (let i = 0; i < 4; i++) c.fillRect(-L * 0.2 + i * L * 0.12, -L * 0.14, L * 0.04, L * 0.28); } eye(L * 0.28); break;
      case 'bass': tail('#4F7342', L * 0.22); ell(c, 0, 0, L * 0.46, L * 0.19, col('#A9C08A')); ell(c, 0, -L * 0.07, L * 0.44, L * 0.11, col('#4F7342')); if (!mono) { c.fillStyle = 'rgba(40,58,32,0.7)'; c.fillRect(-L * 0.38, -L * 0.02, L * 0.72, L * 0.05); } eye(L * 0.32); break;
      case 'catfish': tail('#56676E', L * 0.18); ell(c, 0, 0, L * 0.47, L * 0.14, col('#8B9CA2')); ell(c, 0, -L * 0.04, L * 0.45, L * 0.08, col('#56676E'));
        c.strokeStyle = col('#3D4A4F'); c.lineWidth = Math.max(1, L * 0.02); [[-L * 0.06, 1], [-L * 0.02, 1], [L * 0.03, -1]].forEach(([dy, s2]) => { c.beginPath(); c.moveTo(L * 0.44, dy); c.quadraticCurveTo(L * 0.6, dy + s2 * L * 0.1, L * 0.66, dy + s2 * L * 0.17 + Math.sin(time * 3) * 2); c.stroke(); }); eye(L * 0.34); break;
    }
    c.restore();
  }
  function drawKey(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.5);
    c.strokeStyle = '#B8861F'; c.fillStyle = '#F5C842'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#7A1E12'; c.beginPath(); c.arc(0, 0, 1.6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F5C842'; c.fillRect(3.5, -1.2, 12, 2.4); c.strokeRect(3.5, -1.2, 12, 2.4);
    c.fillRect(11, 1, 2, 3); c.fillRect(14, 1, 2, 2.4);
    if (!reduce) { const tw = Math.max(0, Math.sin(time * 3)); c.fillStyle = 'rgba(255,248,200,' + tw + ')'; c.fillRect(9, -5, 1.4, 4); c.fillRect(7.7, -3.7, 4, 1.4); }
    c.restore();
  }
  function drawCrab(c, x, y, dir, s, key) {
    s = s || 1; c.save(); c.translate(x, y); c.scale(dir * s, s);
    ell(c, 0, 0, 14, 5, '#E0321F'); ell(c, 14, -2, 6, 4, '#E0321F'); ell(c, -14, 0, 5, 4, '#C42816');
    ell(c, 2, -2, 9, 1.6, 'rgba(255,180,160,0.6)');
    c.strokeStyle = '#C42816'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 4, 3); c.lineTo(i * 4 + 2, 9 + Math.sin(time * 8 + i) * 1.5); c.stroke(); }
    c.beginPath(); c.moveTo(18, -4); c.quadraticCurveTo(30, -14, 36, -6); c.stroke();
    if (key) drawKey(c, 37, -10, 1.35);
    ell(c, 36, -6, 5, 3, '#E0321F'); ell(c, 20, -5, 1.4, 1.4, '#1A1A1A');
    c.restore();
  }
  function drawBoat(x) {
    // a simple canoe with a faceless little paddler
    const y = SURF, bob = reduce ? 0 : Math.sin(time * 1.4) * 1.5, OL = 'rgba(30,40,40,0.55)';
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(reduce ? 0 : Math.sin(time * 1.1) * 0.02); ctx.scale(BOAT_S, BOAT_S);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // a small umbrella when it rains (opens over a moment)
    umb += ((raining ? 1 : 0) - umb) * 0.08;
    if (umb > 0.02) {
      const ux = -10, top = -60, sp = 22 * umb;
      ctx.strokeStyle = '#4A3A30'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-7, -18); ctx.lineTo(ux, top + 2); ctx.stroke();
      ctx.fillStyle = '#F28BA8'; ctx.beginPath(); ctx.moveTo(ux - sp, top + 8 * umb);
      ctx.quadraticCurveTo(ux, top - 14 * umb, ux + sp, top + 8 * umb);
      const n = 4; for (let i = n; i > 0; i--) { const x1 = ux - sp + (2 * sp) * (i - 1) / n, x0 = ux - sp + (2 * sp) * i / n; ctx.quadraticCurveTo((x0 + x1) / 2, top + 4 * umb, x1, top + 8 * umb); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,40,60,0.5)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#4A3A30'; ctx.beginPath(); ctx.arc(ux, top - 6 * umb, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    // paddler: hair, head, life vest (no face)
    ell(ctx, -4, -16, 7, 9, '#F2A23A');
    ctx.fillStyle = '#5A3A26'; ctx.beginPath(); ctx.ellipse(-4, -30, 6.5, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, -31); ctx.quadraticCurveTo(-12, -21, -9, -19); ctx.lineTo(1, -19); ctx.quadraticCurveTo(4, -22, 2, -31); ctx.fill();
    ell(ctx, -4, -29, 5, 5.5, '#F2CDB2'); ctx.fillStyle = '#5A3A26'; ctx.beginPath(); ctx.ellipse(-4, -33, 6, 3.6, 0, Math.PI, 0); ctx.fill();
    // rod
    ctx.strokeStyle = '#5A3A26'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, -16); ctx.quadraticCurveTo(22, -40, 46, -48); ctx.stroke();
    // canoe hull
    ctx.fillStyle = '#C8794A'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-58, -12); ctx.quadraticCurveTo(-30, -6, 0, -6); ctx.quadraticCurveTo(30, -6, 58, -12);
    ctx.quadraticCurveTo(46, 6, 0, 7); ctx.quadraticCurveTo(-46, 6, -58, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#E9B48A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-54, -10); ctx.quadraticCurveTo(0, -3, 54, -10); ctx.stroke();
    ctx.fillStyle = '#FFF4E6'; ctx.font = 'italic 7px "Instrument Serif", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('Boaty McBoatface', 0, 2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(230,248,250,0.6)'; ctx.lineWidth = 1.5;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 60 * BOAT_S, SURF + 1); ctx.quadraticCurveTo(x + s * 70 * BOAT_S, SURF - 1, x + s * 82 * BOAT_S, SURF + 1); ctx.stroke(); }
    return { tipX: x + 46 * BOAT_S, tipY: y + bob - 48 * BOAT_S };
  }
  function drawLitter(L) {
    ctx.save(); ctx.translate(L.x, FLOOR + 2); ctx.rotate(L.r);
    if (L.t === 'can') {
      ctx.fillStyle = L.c; ctx.fillRect(-9, -6, 18, 12); ctx.fillStyle = '#C9CED0'; ctx.fillRect(-11, -6, 2, 12); ctx.fillRect(9, -6, 2, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-6, -4, 10, 2);
    } else if (L.t === 'bottle') {
      ctx.fillStyle = 'rgba(150,210,190,0.55)'; ctx.beginPath(); ctx.roundRect(-14, -6, 22, 12, 4); ctx.fill(); ctx.fillRect(8, -3, 8, 6); ctx.fillStyle = '#3E7F6B'; ctx.fillRect(16, -3.5, 3, 7);
    } else { // a wavy plastic bag
      ctx.fillStyle = 'rgba(235,240,240,0.45)'; ctx.beginPath(); ctx.moveTo(-12, 4); ctx.quadraticCurveTo(-10, -14 + Math.sin(time) * 2, 0, -12); ctx.quadraticCurveTo(10, -14, 12, 4); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function drawChest() {
    const cx = chest.x + (chest.shake > 0 ? Math.sin(time * 70) * 5 * Math.min(1, chest.shake * 2) : 0), cy = FLOOR - 4;
    // gold pile
    coins.forEach((co) => { ell(ctx, co.x, co.y, co.r, co.r * 0.55, '#D9A83A'); ell(ctx, co.x - co.r * 0.2, co.y - co.r * 0.15, co.r * 0.5, co.r * 0.22, '#F6D77A'); });
    if (!reduce) { const s = (Math.sin(time * 3) + 1) / 2; ctx.fillStyle = 'rgba(255,240,170,' + (0.4 + s * 0.5) + ')'; [[-70, -20], [60, -10], [10, 14]].forEach(([dx, dy], i) => { const tw = Math.max(0, Math.sin(time * 2.5 + i * 2)); ctx.save(); ctx.translate(chest.x + dx, cy + dy); ctx.rotate(Math.PI / 4); ctx.fillRect(-1, -6 * tw, 2, 12 * tw); ctx.fillRect(-6 * tw, -1, 12 * tw, 2); ctx.restore(); }); }
    // box
    ctx.fillStyle = '#6B4A2B'; ctx.fillRect(cx - 60, cy - 50, 120, 54); ctx.fillStyle = '#5A3D23'; for (const xx of [-30, 0, 30]) ctx.fillRect(cx + xx - 1, cy - 50, 2, 54);
    ctx.fillStyle = '#C9A040'; ctx.fillRect(cx - 62, cy - 30, 124, 7); ctx.fillRect(cx - 62, cy - 50, 7, 54); ctx.fillRect(cx + 55, cy - 50, 7, 54);
    // lid
    ctx.save(); ctx.translate(cx - 60, cy - 50); ctx.rotate(chest.open ? -1.1 : 0);
    ctx.fillStyle = '#7A5532'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120, 0); ctx.quadraticCurveTo(120, -36, 60, -40); ctx.quadraticCurveTo(0, -36, 0, 0); ctx.fill();
    ctx.fillStyle = '#C9A040'; ctx.fillRect(-2, -6, 124, 6); ctx.restore();
    if (chest.open) { const g = ctx.createRadialGradient(cx, cy - 56, 4, cx, cy - 56, 90); g.addColorStop(0, 'rgba(255,226,120,0.9)'); g.addColorStop(1, 'rgba(255,226,120,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 100, cy - 150, 200, 160); }
    else { ctx.fillStyle = '#E5C35A'; ctx.fillRect(cx - 9, cy - 40, 18, 20); ctx.fillStyle = '#3B2A17'; ctx.beginPath(); ctx.arc(cx, cy - 32, 3, 0, 7); ctx.fill(); ctx.fillRect(cx - 1.5, cy - 32, 3, 7); }
  }

  // ---------- UI
  function buildTray() {
    tray.innerHTML = '';
    KEYS.forEach((k) => {
      const li = document.createElement('li'); li.dataset.k = k; li.title = SPECIES[k].name;
      const c = document.createElement('canvas'); c.width = 120; c.height = 56; li.appendChild(c);
      const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = SPECIES[k].name + ': not caught yet'; li.appendChild(sr);
      tray.appendChild(li); paintTray(k);
    });
  }
  function paintTray(k) {
    const li = tray.querySelector('[data-k="' + k + '"]'); if (!li) return;
    const c = li.querySelector('canvas').getContext('2d'), got = caught.has(k), sc = 70 / SPECIES[k].size;
    c.clearRect(0, 0, 120, 56); c.save(); c.scale(2, 2); drawFish(c, k, 30, 14, 1, 0, 0, sc * 0.5, got ? null : 'rgba(255,255,255,0.22)'); c.restore();
    li.classList.toggle('got', got); li.querySelector('.sr-only').textContent = SPECIES[k].name + (got ? ': caught' : ': not caught yet');
  }
  let bubbleT = 0;
  function say(html, ms) { bubble.innerHTML = html; bubble.hidden = false; clearTimeout(bubbleT); bubbleT = setTimeout(() => { bubble.hidden = true; }, ms || 3200); }
  function openModal(el, focusSel) { modalOpen = true; el.hidden = false; const f = el.querySelector(focusSel); if (f) f.focus(); }
  function closeModal(el) { el.hidden = true; modalOpen = false; cv.focus({ preventScroll: true }); }
  function showCatch(k) {
    const art = $('.catch-art'), c = art.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, art.width, art.height);
    const g = c.createLinearGradient(0, 0, 0, art.height); g.addColorStop(0, '#2E7484'); g.addColorStop(1, '#1B4F5B'); c.fillStyle = g; c.fillRect(0, 0, art.width, art.height);
    for (let i = 0; i < 14; i++) { c.strokeStyle = 'rgba(210,240,244,0.35)'; c.beginPath(); c.arc(rnd(20, 500), rnd(20, 240), rnd(3, 8), 0, 7); c.stroke(); }
    const isCrab = k === 'crawdad', first = !isCrab && !caught.has(k);
    if (isCrab) drawCrab(c, 230, 150, 1, 5, !hasKey); else drawFish(c, k, 270, 130, 1, 0, 0, 380 / SPECIES[k].size);
    if (!isCrab) { caught.add(k); paintTray(k); countEl.textContent = caught.size + '/' + KEYS.length; }
    $('#catch-h').textContent = isCrab ? 'You caught a crawdad!' : 'You caught a ' + SPECIES[k].name + '!';
    $('.catch-tag').textContent = isCrab ? 'Bonus catch' : SPECIES[k].tag + ' to California';
    $('.catch-tag').className = 'catch-tag ' + (isCrab || SPECIES[k].tag === 'Introduced' ? 'intro' : 'native');
    const gotKey = isCrab && !hasKey; if (isCrab) hasKey = true;
    $('.catch-fact').textContent = isCrab ? CRAWDAD_FACT : SPECIES[k].fact;
    const left = KEYS.length - caught.size;
    $('.catch-progress').textContent = isCrab ? (gotKey ? 'It was holding a golden key! The treasure chest on the bottom is unlocked.' : 'Crawdads don’t count toward the six, but nice catch.') : !first ? 'You’ve caught this one before. Released back into the pond.' : left ? left + ' more species to go. Released back into the pond.' : 'That’s all six! The treasure chest on the bottom is unlocked.';
    openModal(catchBox, '#catch-h'); catchBox.dataset.t = Date.now();
  }

  // ---------- game loop
  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now; time += dt;
    // lure movement
    const sp = (hooked ? 150 : 280) * dt;
    if (playing && !modalOpen && !reeling) {
      let dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
      if (dx || dy) { lure.tx = null; const m = Math.hypot(dx, dy); lure.x += dx / m * sp; lure.y += dy / m * sp; }
      else if (lure.tx != null) { const ddx = lure.tx - lure.x, ddy = lure.ty - lure.y, m = Math.hypot(ddx, ddy); if (m > 2) { lure.x += ddx / m * Math.min(m, sp); lure.y += ddy / m * Math.min(m, sp); } }
    }
    if (reeling) { const secTop = sec.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, secTop + Math.max(0, Math.min(WH - H, lure.y - H * 0.55))); lure.y -= 340 * dt; if (lure.y <= SURF + 30) { const k = hooked.k; reeling = false; reelBtn.hidden = true; if (hooked.crab) { crab.held = false; crab.x = rnd(0.1, 0.6); crab.cool = 6; } else { spawn(hooked); hooked.cool = 5; } hooked = null; lure.y = SURF + 160; showCatch(k); } }
    lure.x = Math.max(24, Math.min(W - 24, lure.x)); lure.y = Math.max(SURF + 30, Math.min(FLOOR - 16, lure.y));
    boatX += (Math.max(80, Math.min(W - 80, lure.x - 40)) - boatX) * Math.min(1, dt * 1.2);
    // the page scroll drives the camera; the lure rides along and can move within the view
    cam = Math.max(0, Math.min(WH - H, -sec.getBoundingClientRect().top));
    const lo = Math.max(SURF + 30, cam + 110), hi = Math.min(FLOOR - 16, cam + H - 90);
    if (playing && !modalOpen && !reeling) {
      if (keys.d && lure.y >= hi - 1 && cam < WH - H) window.scrollBy(0, sp);
      if (keys.u && lure.y <= lo + 1 && cam > 0) window.scrollBy(0, -sp);
    }
    if (!reeling) lure.y = Math.max(lo, Math.min(hi, lure.y));
    depthEl.textContent = Math.max(0, (lure.y - SURF) / (FLOOR - SURF) * MAXD).toFixed(1) + ' m';

    ctx.setTransform(dpr, 0, 0, dpr, 0, -cam * dpr);
    // above the surface: the pond seen from above, continuing the section above
    if (cam < SURF) { const g0 = ctx.createLinearGradient(0, 0, 0, SURF); g0.addColorStop(0, '#2E7484'); g0.addColorStop(1, '#3A8494'); ctx.fillStyle = g0; ctx.fillRect(0, 0, W, SURF); }
    const g = ctx.createLinearGradient(0, SURF, 0, WH);
    g.addColorStop(0, '#2B6E7E'); g.addColorStop(0.35, '#22606E'); g.addColorStop(0.75, '#153F4A'); g.addColorStop(1, '#0C2A32');
    ctx.fillStyle = g; ctx.fillRect(0, Math.max(SURF, cam), W, H + 2);
    if (cam < H * 1.3) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x0 = (i + 0.5) * W / 6 + (reduce ? 0 : Math.sin(time * 0.3 + i) * 30);
        const gr = ctx.createLinearGradient(0, SURF, 0, SURF + H * 1.1); gr.addColorStop(0, 'rgba(180,230,235,0.12)'); gr.addColorStop(1, 'rgba(180,230,235,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0 - 30, SURF); ctx.lineTo(x0 + 30, SURF); ctx.lineTo(x0 + 140, SURF + H * 1.1); ctx.lineTo(x0 + 40, SURF + H * 1.1); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // rain
    if (raining && !reduce) for (let i = 0; i < 2; i++) if (Math.random() < dt * 9) { const x = rnd(0, W); ripples.push({ x, r: 1, a: 0.55 }); if (Math.random() < 0.4) bubbles.push({ x, y: SURF + rnd(6, 30), v: rnd(8, 18), r: rnd(0.8, 1.4), life: 0.9 }); }
    if (raining && cam < SURF) { ctx.strokeStyle = 'rgba(225,242,247,0.55)'; ctx.lineWidth = 1.1; for (let i = 0; i < 46; i++) { const x = (i * 97.3) % W, y = ((i * 53 + time * 150) % SURF); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 8); ctx.stroke(); } }
    ripples = ripples.filter((p) => (p.r += dt * 10, p.a -= dt * 0.9, p.a > 0));
    ripples.forEach((p) => { ctx.strokeStyle = 'rgba(220,245,248,' + p.a + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(p.x, SURF, p.r * 1.8, p.r * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); });
    if (!reduce && Math.random() < dt * 6) bubbles.push({ x: rnd(0, W), y: cam + H + 10, v: rnd(20, 45), r: rnd(1.2, 3.2), life: 99 });
    bubbles = bubbles.filter((b) => (b.y -= b.v * dt, b.life -= dt, b.y > SURF + 4 && b.life > 0 && b.y > cam - 20));
    bubbles.forEach((b) => { ctx.strokeStyle = 'rgba(210,240,244,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });

    // floor
    if (cam + H > FLOOR - 220) {
      grass.forEach((gr) => { ctx.strokeStyle = gr.c; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(gr.x, FLOOR + 10); ctx.quadraticCurveTo(gr.x + Math.sin(time * 0.9 + gr.ph) * 18, FLOOR - gr.h * 0.5, gr.x + Math.sin(time * 0.9 + gr.ph + 0.8) * 26, FLOOR - gr.h); ctx.stroke(); });
      ctx.fillStyle = '#B49B6E'; ctx.beginPath(); ctx.moveTo(0, FLOOR + 4); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, FLOOR + Math.sin(x / 90) * 6); ctx.lineTo(W, WH); ctx.lineTo(0, WH); ctx.closePath(); ctx.fill();
      rocks.forEach((rk) => ell(ctx, rk.x, FLOOR + 6, rk.r, rk.r * 0.6, rk.c));
      litter.forEach(drawLitter);
      drawChest();
      if (!crab.held) { crab.x += crab.dir * dt * 0.02; if (crab.x > 0.62 || crab.x < 0.05) crab.dir *= -1; drawCrab(ctx, crab.x * W, FLOOR - 6, crab.dir, 1.5, !hasKey); }
      crab.cool -= dt;
    }
    chest.shake = Math.max(0, chest.shake - dt);

    // fish
    fish.forEach((f) => {
      if (hooked === f) return;
      const s2 = SPECIES[f.k];
      f.x += f.dir * f.sp * dt / W;
      if (f.x > 1.1 || f.x < -0.1) spawn(f);
      f.cool -= dt;
      const x = f.x * W - f.dir * f.off, y = SURF + f.fy * (FLOOR - SURF) + Math.sin(time * 0.8 + f.ph) * 10;
      if (y < cam - 60 || y > cam + H + 60) return;
      drawFish(ctx, f.k, x, y, f.dir, f.ph, 0);
      if (playing && !hooked && !modalOpen && f.cool <= 0 && Math.hypot(x + f.dir * s2.size * 0.3 - lure.x, y - lure.y) < Math.max(24, s2.size * 0.5)) {
        hooked = f; reelBtn.hidden = false; say('Fish on! Press <kbd>Space</kbd> to reel it in.', 3000);
      }
    });
    if (playing && !hooked && !modalOpen && crab.cool <= 0 && !crab.held && Math.hypot(crab.x * W - lure.x, FLOOR - 6 - lure.y) < 26) { crab.held = true; hooked = { crab: true, k: 'crawdad' }; reelBtn.hidden = false; say('Something pinched your lure! Press <kbd>Space</kbd> to reel it in.', 3000); }

    // line, lure and the hooked catch
    const tip = drawBoat(boatX);
    ctx.strokeStyle = 'rgba(235,245,240,0.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(tip.tipX, tip.tipY); ctx.quadraticCurveTo(tip.tipX + (lure.x - tip.tipX) * 0.2, SURF + (lure.y - SURF) * 0.2, lure.x, lure.y - 10); ctx.stroke();
    if (hooked) {
      if (hooked.crab) drawCrab(ctx, lure.x, lure.y + 14, 1); else { ctx.save(); ctx.translate(lure.x, lure.y + 4); ctx.rotate(Math.PI / 2); drawFish(ctx, hooked.k, SPECIES[hooked.k].size * 0.3, 0, 1, hooked.ph, Math.sin(time * 18) * 0.25); ctx.restore(); }
    }
    ell(ctx, lure.x, lure.y - 14, 5, 6, '#E2543A'); ell(ctx, lure.x, lure.y - 18, 5, 3, '#F4F1E6');
    ctx.strokeStyle = '#D9DDD8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lure.x, lure.y - 8); ctx.lineTo(lure.x, lure.y + 3); ctx.arc(lure.x - 5, lure.y + 3, 5, 0, Math.PI); ctx.stroke();
    // a gentle pointer to the chest once it's unlocked
    if ((caught.size === KEYS.length || hasKey) && !chest.open && cam + H < FLOOR - 100) { ctx.fillStyle = 'rgba(255,226,120,' + (0.6 + Math.sin(time * 4) * 0.3) + ')'; ctx.font = '600 16px "DM Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Treasure unlocked: swim to the bottom ↓', W / 2, cam + H - 30); }

    if (running) requestAnimationFrame(frame);
  }

  // ---------- input
  function start() { intro.hidden = true; playing = true; cv.focus({ preventScroll: true }); }
  $('.deep-start').addEventListener('click', start);
  $('.deep-howto').addEventListener('click', () => { intro.hidden = false; playing = false; intro.querySelector('.deep-start').focus(); });
  function reel() { if (hooked && !reeling) { reeling = true; reelBtn.hidden = true; } }
  reelBtn.addEventListener('click', () => { reel(); cv.focus({ preventScroll: true }); });
  const map = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l', d: 'r', w: 'u', s: 'd', A: 'l', D: 'r', W: 'u', S: 'd' };
  cv.addEventListener('keydown', (e) => {
    if (map[e.key]) { e.preventDefault(); if (!playing) start(); keys[map[e.key]] = true; }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (hooked) reel(); else if (Math.hypot(lure.x - chest.x, lure.y - (FLOOR - 40)) < 90) tryChest(); }
  });
  cv.addEventListener('keyup', (e) => { if (map[e.key]) keys[map[e.key]] = false; });
  cv.addEventListener('blur', () => { keys = {}; });
  function worldPt(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top + cam }; }
  function tryChest() {
    if (chest.open) { openModal(treasure, '.retro-email'); return; }
    if (caught.size < KEYS.length && !hasKey) { chest.shake = 0.7; say('Locked! <strong>Catch all the fish</strong> to open it. (' + caught.size + '/' + KEYS.length + ')', 3200); return; }
    chest.open = true; setTimeout(() => openModal(treasure, '.retro-email'), 700);
  }
  let dragging = false;
  cv.addEventListener('pointerdown', (e) => {
    const p = worldPt(e);
    if (Math.abs(p.x - chest.x) < 75 && p.y > FLOOR - 100 && p.y < FLOOR + 20) { tryChest(); return; }
    if (!playing) start();
    dragging = true; lure.tx = p.x; lure.ty = p.y; cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', (e) => { const p = worldPt(e); cv.style.cursor = (Math.abs(p.x - chest.x) < 75 && p.y > FLOOR - 100 && p.y < FLOOR + 20) ? 'pointer' : 'crosshair'; if (dragging) { lure.tx = p.x; lure.ty = p.y; } });
  cv.addEventListener('pointerup', () => { dragging = false; });
  $('.catch-close').addEventListener('click', () => { if (Date.now() - (+catchBox.dataset.t || 0) < 700) return; closeModal(catchBox); });
  $('.retro-close').addEventListener('click', () => closeModal(treasure));
  sec.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!catchBox.hidden && Date.now() - (+catchBox.dataset.t || 0) > 700) closeModal(catchBox); if (!treasure.hidden) closeModal(treasure); } });
  rainBtn.addEventListener('click', () => { raining = !raining; rainBtn.setAttribute('aria-pressed', raining); rainBtn.textContent = raining ? 'Stop the rain' : 'Make it rain'; });
  window.addEventListener('resize', size);
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !running) { running = true; last = 0; requestAnimationFrame(frame); }
    else if (!e.isIntersecting) running = false;
  })).observe(sec);
  size(); buildTray(); countEl.textContent = '0/' + KEYS.length;
  window.__fish = { caught, KEYS, showCatch, tryChest, chest, lure }; // handy for testing
})();

// 16. Contact: copy the email address.
(function () {
  const b = document.querySelector('.contact-copy');
  if (!b) return;
  b.addEventListener('click', async () => {
    const email = b.dataset.email;
    try { await navigator.clipboard.writeText(email); b.textContent = 'Copied!'; }
    catch (e) { b.textContent = email; }
    setTimeout(() => { b.textContent = 'Copy email address'; }, 2200);
  });
})();
