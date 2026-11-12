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

  // A stream that runs down the left side, flows as you scroll, and pours into the footer.
  const main = document.querySelector('main');
  if (!main) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const svg = mk('svg', { class: 'stream', 'aria-hidden': 'true' });
  const defs = mk('defs', {});
  const mask = mk('mask', { id: 'flow-mask', maskUnits: 'userSpaceOnUse' });
  const maskPath = mk('path', { fill: 'none', stroke: '#fff', 'stroke-width': 14, 'stroke-linecap': 'round' });
  mask.appendChild(maskPath); defs.appendChild(mask);
  const bank = mk('path', { class: 'stream-bank' });
  const bed = mk('path', { class: 'stream-bed' });
  const flow = mk('path', { class: 'stream-flow' });
  const shimmer = mk('path', { class: 'stream-shimmer', mask: 'url(#flow-mask)' });
  const marks = mk('g', {});
  const front = mk('circle', { class: 'stream-front', r: 6 });
  const ripples = mk('g', { class: 'stream-ripples' });
  for (let i = 0; i < 3; i++) ripples.appendChild(mk('ellipse', { rx: 10, ry: 3, style: 'animation-delay:' + (i * 0.8) + 's' }));
  svg.append(defs, bank, bed, flow, shimmer, marks, ripples, front);
  main.appendChild(svg);
  let len = 0, stops = [], endY = 0;

  function build() {
    const h = main.offsetHeight;
    const foot = document.querySelector('.footer-wave');
    // Run the stream down into the middle of the footer wave
    const fr = foot ? foot.getBoundingClientRect() : null;
    endY = fr ? (fr.top - main.getBoundingClientRect().top + fr.height * 0.55) : h;
    svg.setAttribute('viewBox', '0 0 60 ' + (endY + 20));
    svg.style.height = (endY + 20) + 'px';
    let d = 'M30 0', y = 0, side = 1;
    while (y < endY) {
      const step = Math.min(260, endY - y);
      const bend = endY - y < 300 ? 8 : 18; // straighten out before the pour
      d += ' C ' + (30 + bend * side) + ' ' + (y + step * 0.33) + ', ' + (30 + bend * side) + ' ' + (y + step * 0.66) + ', 30 ' + (y + step);
      y += step; side = -side;
    }
    [bank, bed, flow, shimmer, maskPath].forEach((p) => p.setAttribute('d', d));
    len = flow.getTotalLength();
    flow.style.strokeDasharray = len;
    maskPath.style.strokeDasharray = len;
    ripples.querySelectorAll('ellipse').forEach((e) => { e.setAttribute('cx', 30); e.setAttribute('cy', endY); });
    marks.innerHTML = '';
    stops = [];
    main.querySelectorAll('h1, h2').forEach((hd) => {
      const top = hd.getBoundingClientRect().top - main.getBoundingClientRect().top + hd.offsetHeight / 2;
      const c = mk('circle', { cx: 30, cy: top, r: 7, class: 'stream-drop' });
      marks.appendChild(c);
      stops.push({ el: c, y: top });
    });
    update();
  }

  function update() {
    const r = main.getBoundingClientRect();
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let reach = Math.max(0, window.innerHeight * 0.6 - r.top);
    if (atBottom) reach = endY;
    reach = Math.min(endY, reach);
    const p = endY ? reach / endY : 0;
    const off = (len * (1 - p)).toFixed(1);
    flow.style.strokeDashoffset = off;
    maskPath.style.strokeDashoffset = off;
    const pt = flow.getPointAtLength(len * p);
    front.setAttribute('cx', pt.x); front.setAttribute('cy', pt.y);
    front.style.opacity = p > 0.01 && p < 0.995 ? 1 : 0;
    stops.forEach((s) => s.el.classList.toggle('wet', s.y <= reach));
    document.body.classList.toggle('stream-arrived', p >= 0.995);
  }

  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  build();
})();
