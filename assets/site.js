/* FreshSense — shared header/footer components + page-level motion helpers.
   Load order on each page: gsap, ScrollTrigger, (SplitText), lenis, then this file. */
(() => {
  const LOGO = 'FreshSenseLogo-transparent.png';
  const page = location.pathname.split('/').pop() || 'index.html';
  const cur = (f) => (page === f ? ' aria-current="page"' : '');

  /* Light-DOM custom elements: page CSS applies, and the markup stays inspectable. */
  class FsHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <header class="fs-header" id="fs-header">
          <a class="fs-brand" href="index.html" aria-label="FreshSense home">
            <img src="${LOGO}" width="1968" height="422" alt="FreshSense" decoding="async" fetchpriority="high">
          </a>
          <button class="fs-burger" type="button" aria-expanded="false" aria-controls="fs-nav" aria-label="Menu"><i></i><i></i><i></i></button>
          <nav class="fs-nav" id="fs-nav" aria-label="Primary">
            <a href="how-it-works.html"${cur('how-it-works.html')}>How it works</a>
            <a href="roi-calculator.html"${cur('roi-calculator.html')}>Savings</a>
            <a href="index.html#pilot">Results</a>
            <a href="partners.html"${cur('partners.html')}>Partners</a>
            <a class="btn" href="order.html"${cur('order.html')}>Reserve <span class="arr" aria-hidden="true">→</span></a>
          </nav>
        </header>`;
      const bar = this.querySelector('#fs-header');
      const nav = this.querySelector('#fs-nav');
      const burger = this.querySelector('.fs-burger');
      const set = (open) => {
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
      };
      burger.addEventListener('click', () => set(!nav.classList.contains('is-open')));
      nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
      const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  class FsFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer class="fs-footer">
          <div class="wrap">
            <div class="grid">
              <div>
                <a class="fs-brand" href="index.html" aria-label="FreshSense home"><img src="${LOGO}" width="1968" height="422" alt="FreshSense" loading="lazy" decoding="async"></a>
                <p>A camera for the shelf that watches your fridge, so nothing good goes to waste.</p>
              </div>
              <div><h4>Product</h4><ul>
                <li><a href="how-it-works.html">How it works</a></li></ul></div>
              <div><h4>Proof</h4><ul>
                <li><a href="roi-calculator.html">Savings calculator</a></li>
                <li><a href="index.html#pilot">Pilot results</a></li>
                <li><a href="index.html#press">Press</a></li></ul></div>
              <div><h4>Get one</h4><ul>
                <li><a href="order.html">Reserve a device</a></li>
                <li><a href="index.html#waitlist">Join the waitlist</a></li>
                <li><a href="https://apps.apple.com/us/app/freshsense/id6797704838" target="_blank" rel="noopener">Download the app</a></li>
                <li><a href="https://www.instagram.com/freshsense.home/" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="https://www.tiktok.com/@freshsense.home" target="_blank" rel="noopener">TikTok</a></li>
                <li><a href="partners.html">Partners &amp; investors</a></li></ul></div>
              <div><h4>Help &amp; legal</h4><ul>
                <li><a href="support.html">Support</a></li>
                <li><a href="privacy.html">Privacy Policy</a></li>
                <li><a href="terms.html">Terms</a></li>
                <li><a href="mailto:freshsenseai.home@gmail.com">freshsenseai.home@gmail.com</a></li></ul></div>
            </div>
            <div class="legal"><span>© 2026 FreshSense. All rights reserved.</span><span>Allen / Plano, TX</span></div>
          </div>
        </footer>`;
    }
  }
  customElements.define('fs-header', FsHeader);
  customElements.define('fs-footer', FsFooter);

  /* ── motion ── */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  window.FS = { reduce, hasGsap };
  if (!hasGsap || reduce) { root.classList.remove('js'); return; }   // everything stays visible and static
  gsap.registerPlugin(ScrollTrigger);

  // Lenis for wheel/trackpad only (same as the home page); touch keeps native momentum.
  if (window.Lenis && !matchMedia('(pointer: coarse)').matches) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.FS.lenis = lenis;
  }

  // .reveal — transform + opacity only; siblings in one batch get a stagger.
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.09, overwrite: true })
  });
})();
