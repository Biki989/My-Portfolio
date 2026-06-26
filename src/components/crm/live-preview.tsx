'use client'

import { useMemo } from 'react'
import { usePortfolio } from '@/lib/portfolio-store'
import type { PortfolioData } from '@/lib/portfolio-types'
import { PREVIEW_CSS } from '@/lib/preview-css'

function escapeHtml(s: string) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
function safeRich(s: string) {
  return escapeHtml(s)
    .replace(/&lt;(\/?)(strong|em|br|span|code|b|i)&gt;/g, '<$1$2>')
}

// Inline copy of the original app.js boot logic, with one tweak:
// animations run inside the iframe document so the CRM editor sees the
// exact same motion (3D hero, scroll progress, custom cursor, magnetic,
// tilt, reveal, stat counters, marquee) the live portfolio site does.
const PREVIEW_BOOT_JS = `
(function () {
  "use strict";
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  function initScene() {
    var canvas = document.getElementById("rain");
    if (!canvas || prefersReducedMotion || typeof THREE === "undefined") return;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xE9EBEF, 9, 24);
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 11);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(5, 6, 8); scene.add(key);
    var rim = new THREE.DirectionalLight(0x1D4ED8, 0.55); rim.position.set(-6, -3, 4); scene.add(rim);
    var group = new THREE.Group(); scene.add(group);
    var palette = [0x1D4ED8, 0x0E1116, 0x60A5FA, 0x3D4350, 0x717784];
    var geos = [
      new THREE.IcosahedronGeometry(1.3, 0),
      new THREE.TorusGeometry(0.95, 0.32, 16, 60),
      new THREE.TorusKnotGeometry(0.7, 0.24, 90, 16),
      new THREE.OctahedronGeometry(1.15, 0),
      new THREE.SphereGeometry(1.05, 32, 32),
      new THREE.DodecahedronGeometry(1.1, 0)
    ];
    var shapes = [];
    var COUNT = geos.length;
    for (var i = 0; i < COUNT; i++) {
      var color = palette[i % palette.length];
      var fill = new THREE.MeshStandardMaterial({
        color: color, transparent: true, opacity: 0.14, roughness: 0.4, metalness: 0.1,
        flatShading: geos[i].type === "IcosahedronGeometry" || geos[i].type === "OctahedronGeometry"
      });
      var wire = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.55 });
      var mesh = new THREE.Mesh(geos[i], fill);
      mesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(geos[i]), wire));
      var angle = (i / COUNT) * Math.PI * 2;
      var radius = 4.2 + (i % 2) * 1.6;
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.55 + (i % 2 ? 0.8 : -0.8), (i % 3) - 1);
      var s = 0.7 + (i % 3) * 0.18; mesh.scale.setScalar(s);
      mesh.userData = {
        spin: { x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.006, z: (Math.random() - 0.5) * 0.003 },
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.25 + Math.random() * 0.35,
        baseY: mesh.position.y
      };
      group.add(mesh); shapes.push(mesh);
    }
    var PCOUNT = 220;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(PCOUNT * 3);
    for (var i = 0; i < PCOUNT; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 26;
      pPos[i*3+1] = (Math.random() - 0.5) * 16;
      pPos[i*3+2] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    var pMat = new THREE.PointsMaterial({ color: 0x0E1116, size: 0.045, transparent: true, opacity: 0.4, sizeAttenuation: true });
    var points = new THREE.Points(pGeo, pMat); scene.add(points);
    var target = { x: 0, y: 0 }, curr = { x: 0, y: 0 };
    if (!isTouch) {
      window.addEventListener("mousemove", function (e) {
        target.x = (e.clientX / window.innerWidth - 0.5);
        target.y = (e.clientY / window.innerHeight - 0.5);
      });
    }
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener("resize", resize);
    var clock = new THREE.Clock();
    function animate() {
      var t = clock.getElapsedTime();
      curr.x += (target.x - curr.x) * 0.05; curr.y += (target.y - curr.y) * 0.05;
      group.rotation.y = curr.x * 0.6 + t * 0.04;
      group.rotation.x = curr.y * 0.4;
      camera.position.x += (curr.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-curr.y * 1.0 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      for (var i = 0; i < shapes.length; i++) {
        var m = shapes[i];
        m.rotation.x += m.userData.spin.x;
        m.rotation.y += m.userData.spin.y;
        m.rotation.z += m.userData.spin.z;
        m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.floatPhase) * m.userData.floatAmp;
      }
      points.rotation.y = t * 0.02;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function initScrollUI() {
    var bar = document.querySelector(".scroll-progress span");
    var nav = document.getElementById("nav");
    function onScroll() {
      var st = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("is-scrolled", st > 30);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMagnetic() {
    if (prefersReducedMotion || isTouch) return;
    var items = document.querySelectorAll("[data-magnetic]");
    var strength = 0.35;
    items.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (x * strength) + "px," + (y * strength) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  function initTilt() {
    if (prefersReducedMotion || isTouch) return;
    var cards = document.querySelectorAll(".tilt");
    cards.forEach(function (card) {
      var max = 8;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var ry = (px - 0.5) * (max * 2);
        var rx = -(py - 0.5) * (max * 2);
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  function initCounters() {
    var nums = document.querySelectorAll(".stat__num");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = n.dataset.count; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.dataset.count);
        var dur = 1600;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = Number.isInteger(target) ? Math.round(val).toString() : val.toFixed(1);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function initCursor() {
    if (prefersReducedMotion || isTouch) return;
    var cursor = document.querySelector(".cursor");
    if (!cursor) return;
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; cursor.classList.add("is-active"); });
    document.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); });
    function loop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%, -50%)";
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll("a, button, .tilt").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function boot() {
    initScene();
    initReveal();
    initScrollUI();
    initMagnetic();
    initTilt();
    initCounters();
    initCursor();
    initYear();
  }

  if (typeof THREE !== "undefined") {
    boot();
  } else {
    var check = setInterval(function () {
      if (typeof THREE !== "undefined") { clearInterval(check); boot(); }
    }, 50);
    setTimeout(function () { clearInterval(check); }, 5000);
  }
})();
`

function buildPreviewHtml(d: PortfolioData): string {
  const c = d.config
  const marqueeTrack = [...d.marquee, ...d.marquee]
    .map((m) => `<span>${escapeHtml(m.text)}</span><span>·</span>`)
    .join('\n        ')

  const projectCards = d.projects.map((p, i) => `
        <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
        <article class="card tilt reveal" style="--d:.0${i + 1}s">
          <div class="card__glow"></div>
          <div class="card__top">
            <span class="card__tag">${escapeHtml(p.tag)}</span>
            <span class="card__year">${escapeHtml(p.year)}</span>
          </div>
          <h3 class="card__title">${escapeHtml(p.title)}</h3>
          <p class="card__desc">${escapeHtml(p.description)}</p>
          <div class="card__meta">
            ${p.techs.map((t) => `<span>${escapeHtml(t.name)}</span>`).join('')}
          </div>
          <div class="card__shine"></div>
        </article>
        </a>`).join('\n')

  const statBlocks = d.stats.map((s, i) => `
          <div class="stat reveal" style="--d:.0${i + 1}s">
            <span class="stat__num" data-count="${s.count}">0</span><span class="stat__suffix">${escapeHtml(s.suffix)}</span>
            <span class="stat__label">${escapeHtml(s.label)}</span>
          </div>`).join('\n')

  const stackGroups = d.stack.map((g) => `
        <div class="stack__group reveal">
          <h4>${escapeHtml(g.title)}</h4>
          <ul>
            ${g.items.map((it) => `<li>${escapeHtml(it.name)}</li>`).join('')}
          </ul>
        </div>`).join('\n')

  const socialItems = d.socials.map((s) => {
    const isExternal = /^https?:\/\//.test(s.url)
    const target = isExternal ? ' target="_blank"' : ''
    return `        <li><a href="${escapeHtml(s.url)}"${target} data-magnetic>${escapeHtml(s.label)}</a></li>`
  }).join('\n')

  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(c.seoTitle || 'Portfolio preview')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet" />
<style>
${PREVIEW_CSS}

/* Preview-only tweaks: keep all animations, just allow scrolling inside the iframe */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg-2); }
::-webkit-scrollbar-thumb { background: var(--ink-mute); border-radius: 4px; }
</style>
</head>
<body>
  <div class="grain" aria-hidden="true"></div>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
  <div class="cursor" aria-hidden="true"><div class="cursor__dot"></div></div>

  <header class="nav" id="nav">
    <a href="#top" class="nav__brand" data-magnetic>
      <span class="nav__mark">${escapeHtml(c.brandMark)}</span>
      <span class="nav__brandtext">${escapeHtml(c.brandName)}</span>
    </a>
    <nav class="nav__links" aria-label="Primary">
      <a href="#work" data-magnetic>Work</a>
      <a href="#about" data-magnetic>About</a>
      <a href="#stack" data-magnetic>Stack</a>
      <a href="#contact" class="nav__cta" data-magnetic>Get in touch</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero" id="hero">
      <canvas class="hero__scene" id="rain" aria-hidden="true"></canvas>
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="hero__inner">
        <p class="hero__eyebrow reveal">
          <span class="dot"></span> ${escapeHtml(c.heroEyebrow)}
        </p>
        <h1 class="hero__title">
          <span class="hero__line reveal" style="--d:.05s">${escapeHtml(c.heroLine1)}</span>
          <span class="hero__line reveal" style="--d:.18s">
            <em>${escapeHtml(c.heroLine2Em)}</em> ${escapeHtml(c.heroLine2Text)}
          </span>
          <span class="hero__line reveal" style="--d:.31s">${escapeHtml(c.heroLine3Pre)} <em>${escapeHtml(c.heroLine3Em)}</em></span>
        </h1>
        <p class="hero__lede reveal" style="--d:.5s">${safeRich(c.heroLede)}</p>
        <div class="hero__actions reveal" style="--d:.64s">
          <a href="#work" class="btn btn--primary" data-magnetic>
            ${escapeHtml(c.heroPrimaryBtn)} <span class="btn__arrow">→</span>
          </a>
          <a href="#contact" class="btn btn--ghost" data-magnetic>${escapeHtml(c.heroSecondaryBtn)}</a>
        </div>
      </div>

      <a href="#work" class="hero__scroll reveal" style="--d:.85s" aria-label="Scroll to work">
        <span>Scroll</span>
        <span class="hero__scrollline"></span>
      </a>
    </section>

    <section class="marquee" aria-hidden="true">
      <div class="marquee__track">
        ${marqueeTrack}
      </div>
    </section>

    <section class="work" id="work">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.workSectionIndex)}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.workSectionTitle)}</h2>
        <p class="section-head__sub reveal" style="--d:.1s">${escapeHtml(c.workSectionSub)}</p>
      </header>

      <div class="work__grid">
${projectCards}
      </div>
    </section>

    <section class="about" id="about">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.aboutSectionIndex)}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.aboutSectionTitle)}</h2>
      </header>
      <div class="about__body">
        <p class="about__lede reveal">${safeRich(c.aboutLede)}</p>
        <div class="about__cols">
          <p class="reveal" style="--d:.1s">${escapeHtml(c.aboutPara1)}</p>
          <p class="reveal" style="--d:.2s">${escapeHtml(c.aboutPara2)}</p>
        </div>

        <div class="about__stats">
${statBlocks}
        </div>
      </div>
    </section>

    <section class="stack" id="stack">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.stackSectionIndex)}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.stackSectionTitle)}</h2>
        <p class="section-head__sub reveal" style="--d:.1s">${escapeHtml(c.stackSectionSub)}</p>
      </header>

      <div class="stack__grid">
${stackGroups}
      </div>
    </section>

    <section class="contact" id="contact">
      <p class="contact__eyebrow reveal">${escapeHtml(c.contactEyebrow)}</p>
      <h2 class="contact__title">
        <a href="mailto:${escapeHtml(c.contactEmail)}" class="contact__email" data-magnetic>
          ${escapeHtml(c.contactEmail)}
        </a>
      </h2>
      <p class="contact__sub reveal">${escapeHtml(c.contactSub)}</p>
      <ul class="contact__socials">
${socialItems}
      </ul>
    </section>
  </main>

  <footer class="footer">
    <span>© ${year} ${escapeHtml(c.footerName)}</span>
    <span class="footer__meta">${escapeHtml(c.footerMeta)}</span>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>${PREVIEW_BOOT_JS}</script>
</body>
</html>`
}

export function LivePreview({ width = 'desktop' }: { width?: 'desktop' | 'mobile' }) {
  const data = usePortfolio((s) => s.data)
  const html = useMemo(() => buildPreviewHtml(data), [data])

  const w = width === 'mobile' ? 420 : 1280

  return (
    <div className="h-full w-full overflow-hidden bg-muted/30 flex justify-center">
      <div
        style={{ width: w, height: '100%', maxWidth: '100%' }}
        className="bg-white shadow-2xl transition-all duration-300"
      >
        <iframe
          title="Portfolio preview"
          srcDoc={html}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </div>
    </div>
  )
}
