/* FreshSense — hero film.
   A scroll-scrubbed image sequence on a canvas: two photoreal AI-generated shots (a kitchen fridge door opening,
   then a push-in on the real FreshSense puck inside the produce drawer) are sliced to WebP frames and played
   by scroll position. Classic script on purpose, so it also runs when index.html is opened straight from disk.
   Public API (driven by the pinned GSAP timeline in index.html): FS3D.setProgress(0..1), FS3D.ready.
   If frames can't load, FS3D never becomes ready and the page keeps its video hero. */
(() => {
  const root = document.documentElement;
  const canvas = document.getElementById('hero-3d');
  const heroBg = document.getElementById('hero-bg');
  const api = (window.FS3D = window.FS3D || {});
  api.ready = false;
  api.setProgress = () => {};
  if (!canvas || !heroBg || !root.classList.contains('hero-anim')) return;

  /* shots, in order. n = number of frames in the folder (f_001.webp …) */
  const CLIPS = [
    { dir: 'hero-film/a/', n: 97 },
    { dir: 'hero-film/b/', n: 97 },
    { dir: 'hero-film/c/', n: 97, rev: true }   // exploded view: the assembling clip, played backwards
  ];
  const XF = 8;                                  // frames where each shot dissolves in over the end of the previous one
  const START = [];                              // where each shot begins on the virtual timeline
  CLIPS.reduce((at, c) => { START.push(at); return at + c.n - XF; }, 0);
  const L = START[CLIPS.length - 1] + CLIPS[CLIPS.length - 1].n;   // length of the virtual timeline, in frames
  const frames = CLIPS.map((c) => new Array(c.n).fill(null));

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingQuality = 'high';
  let cw = 0, ch = 0, p = 0, drawn = -1, dirty = true, raf = 0, visible = true, cur = 0;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const url = (c, i) => CLIPS[c].dir + 'f_' + String(i + 1).padStart(3, '0') + '.webp';

  /* nearest loaded frame to index i in clip c (frames arrive sparse-first, so there is always something close) */
  function nearest(c, i) {
    const a = frames[c], n = a.length;
    i = clamp(Math.round(i), 0, n - 1);
    if (a[i]) return a[i];
    for (let d = 1; d < n; d++) {
      if (i - d >= 0 && a[i - d]) return a[i - d];
      if (i + d < n && a[i + d]) return a[i + d];
    }
    return null;
  }

  function cover(img, alpha) {
    if (!img) return;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function draw() {
    raf = 0;
    if (!cw) return;
    const u = clamp(p) * (L - 1);
    cur = u;
    // start painting from the newest shot that has fully dissolved in; everything before it is hidden anyway
    let first = 0;
    for (let i = CLIPS.length - 1; i > 0; i--) if (u - START[i] >= XF) { first = i; break; }
    dirty = false;
    for (let i = first; i < CLIPS.length; i++) {
      const local = u - START[i];
      if (local < 0) break;
      const c = CLIPS[i];
      const idx = clamp(local, 0, c.n - 1);
      const img = nearest(i, c.rev ? c.n - 1 - idx : idx);
      cover(img, i === first ? 1 : clamp(local / XF));
    }
    ctx.globalAlpha = 1;
  }

  const kick = () => { dirty = true; if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw); };

  function resize() {
    const r = heroBg.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (w === cw && h === ch) return;
    cw = canvas.width = w; ch = canvas.height = h;
    ctx.imageSmoothingQuality = 'high';
    kick();
  }
  new ResizeObserver(resize).observe(heroBg);
  resize();
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) kick(); }, { threshold: 0 }).observe(heroBg);
  document.addEventListener('visibilitychange', kick);

  api.setProgress = (v) => { p = clamp(v); kick(); };

  /* ── loading: first frame of each shot immediately, then a sparse pass, then fill in, four at a time ── */
  const order = CLIPS.map((c, ci) => [ci, c.rev ? c.n - 1 : 0]);
  for (const stride of [12, 6, 3, 1]) {
    CLIPS.forEach((c, ci) => { for (let i = 0; i < c.n; i += stride) if (!order.some(([a, b]) => a === ci && b === i)) order.push([ci, i]); });
    CLIPS.forEach((c, ci) => { if (!order.some(([a, b]) => a === ci && b === c.n - 1)) order.push([ci, c.n - 1]); });
  }
  let next = 0, live = 0, started = false;
  function pump() {
    while (live < 4 && next < order.length) {
      const [c, i] = order[next++];
      if (frames[c][i]) continue;
      live++;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        frames[c][i] = img; live--;
        if (!started && frames[0][0]) { started = true; go(); }
        if (Math.abs(START[c] + (CLIPS[c].rev ? CLIPS[c].n - 1 - i : i) - cur) < 10) kick();
        pump();
      };
      img.onerror = () => { live--; pump(); };
      img.src = url(c, i);
    }
  }
  function go() {
    api.ready = true;
    root.classList.add('fridge3d');
    window.dispatchEvent(new Event('fs:3d-ready'));
    kick();
  }
  pump();
  setTimeout(() => { if (!started) { /* nothing loaded: stay on the video hero */ } }, 8000);
})();
