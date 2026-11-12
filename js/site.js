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
  const colors = { water: '#0F766E', research: '#1C1C1A', land: '#B45309' };
  const map = L.map(el, { scrollWheelZoom: false }).setView([37.0, -120.6], 6);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
  }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16
  }).addTo(map);
  const bounds = [];
  places.forEach((p) => {
    const m = L.circleMarker([p.lat, p.lng], { radius: 9, color: '#FFFFFF', weight: 2, fillColor: colors[p.kind], fillOpacity: 1 }).addTo(map);
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
  const photos = [...document.querySelectorAll('.field-grid .photo img, .tile .photo img')];
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
  const foot = document.querySelector('.footer-waves');
  if (!main || !foot) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'creek';
  cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  // Colors matched to the waves in the footer
  const C = { bed: '#EEF4F6', bed2: '#E3ECF0', pebble: '#D2DEE4', edge: '#BFE2F2', body: '#8CCBE6', deep: '#6AB7DD' };
  const W = 120, HALF = 22; // canvas width, half-width of the water
  let dpr = 1, pts = [], cum = [], total = 0, heads = [], pebbles = [], parts = [], drops = [], rings = [];
  let reach = 0, active = false, time = 0, last = performance.now(), splashTimer = 0, crestY = 0;

  function layout() {
    active = window.innerWidth >= 1300;
    cv.style.display = active ? 'block' : 'none';
    if (!active) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const mr = main.getBoundingClientRect();
    cv.style.left = (mr.left - 44 - W / 2) + 'px';
    cv.width = W * dpr; cv.height = window.innerHeight * dpr;
    cv.style.width = W + 'px'; cv.style.height = window.innerHeight + 'px';
    const top = mr.top + window.scrollY;
    const fr = foot.getBoundingClientRect();
    const endY = fr.top + window.scrollY + fr.height * 0.9; // runs down behind the waves
    crestY = fr.top + window.scrollY + fr.height * 0.42;
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
  function newPart(init) { return { s: init ? Math.random() * Math.max(reach, 1) : Math.random() * 40, u: Math.random() * 2 - 1, v: 70 + Math.random() * 110, l: 10 + Math.random() * 26, a: 0.25 + Math.random() * 0.5 }; }

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
        ctx.setLineDash([3, 19, 1, 13, 7, 25]); ctx.lineDashOffset = -time * 46; ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        trace(i0, wB, HALF - 7); ctx.stroke(); ctx.lineDashOffset = -time * 38 + 9; trace(i0, wB, -(HALF - 7)); ctx.stroke();
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
      // Rounded front edge, still flowing
      if (reach < total - 2) {
        const r = HALF - 2 + (reduce ? 0 : Math.sin(time * 5) * 1.2);
        ctx.fillStyle = C.edge; ctx.beginPath(); ctx.ellipse(f.x, f.y, r + 2, r * 0.75 + 2, Math.atan2(f.ty, f.tx), 0, 6.283); ctx.fill();
        ctx.fillStyle = C.body; ctx.beginPath(); ctx.ellipse(f.x, f.y, r - 3, r * 0.75 - 3, Math.atan2(f.ty, f.tx), 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x, f.y, r - 6, r * 0.75 - 6, Math.atan2(f.ty, f.tx), 0.2, 1.6); ctx.stroke();
      }
    }

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
  if (reduce) window.addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
  requestAnimationFrame(frame);
})();
