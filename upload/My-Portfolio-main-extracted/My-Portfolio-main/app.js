/* ============================================================
   Alex Rivera — Portfolio interactions
   - Three.js 3D animated hero background (glassy shapes + particles)
   - Scroll-reveal (IntersectionObserver)
   - Magnetic buttons + tilt cards
   - Animated stat counters
   - Custom cursor
   ============================================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ========================================================
     1. HERO 3D BACKGROUND (Three.js)
     A soft, light-themed scene: floating glassy geometric shapes
     (wireframe + translucent), a drifting particle field, gentle
     auto-rotation, and pointer-driven parallax. Designed to sit
     behind light hero text without competing with it.
     ======================================================== */
  function initScene() {
    const canvas = document.getElementById("rain");
    if (!canvas || prefersReducedMotion || typeof THREE === "undefined") return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0); // transparent so CSS bg shows through
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // --- Scene & camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xE9EBEF, 9, 24); // fade shapes into the cool gray bg

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    // --- Lighting (cool, technical) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x1D4ED8, 0.55); // cobalt rim
    rim.position.set(-6, -3, 4);
    scene.add(rim);

    // --- Floating geometric shapes ---
    const group = new THREE.Group();
    scene.add(group);

    // Cool, technical palette: cobalt + ink + slate, no warm tones
    const palette = [0x1D4ED8, 0x0E1116, 0x60A5FA, 0x3D4350, 0x717784];
    const geos = [
      new THREE.IcosahedronGeometry(1.3, 0),
      new THREE.TorusGeometry(0.95, 0.32, 16, 60),
      new THREE.TorusKnotGeometry(0.7, 0.24, 90, 16),
      new THREE.OctahedronGeometry(1.15, 0),
      new THREE.SphereGeometry(1.05, 32, 32),
      new THREE.DodecahedronGeometry(1.1, 0),
    ];

    const shapes = [];
    const COUNT = geos.length;
    for (let i = 0; i < COUNT; i++) {
      const color = palette[i % palette.length];

      // Translucent "glass" body
      const fill = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.14,
        roughness: 0.4,
        metalness: 0.1,
        flatShading: geos[i].type === "IcosahedronGeometry" || geos[i].type === "OctahedronGeometry",
      });
      // Crisp wireframe overlay for definition
      const wire = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
      });

      const mesh = new THREE.Mesh(geos[i], fill);
      mesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(geos[i]), wire));

      // Distribute around the scene on a loose ring
      const angle = (i / COUNT) * Math.PI * 2;
      const radius = 4.2 + (i % 2) * 1.6;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.55 + (i % 2 ? 0.8 : -0.8),
        (i % 3) - 1 // slight z spread
      );
      const s = 0.7 + (i % 3) * 0.18;
      mesh.scale.setScalar(s);

      mesh.userData = {
        spin: {
          x: (Math.random() - 0.5) * 0.004,
          y: (Math.random() - 0.5) * 0.006,
          z: (Math.random() - 0.5) * 0.003,
        },
        floatPhase: Math.random() * Math.PI * 2,
        floatAmp: 0.25 + Math.random() * 0.35,
        baseY: mesh.position.y,
      };
      group.add(mesh);
      shapes.push(mesh);
    }

    // --- Particle field (soft floating dust) ---
    const PCOUNT = 220;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 26;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x0E1116,
      size: 0.045,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // --- Pointer parallax ---
    const target = { x: 0, y: 0 };
    const curr = { x: 0, y: 0 };
    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        target.x = (e.clientX / window.innerWidth - 0.5);
        target.y = (e.clientY / window.innerHeight - 0.5);
      });
    }

    // --- Resize ---
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // --- Animation loop ---
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();

      // Smooth parallax follow
      curr.x += (target.x - curr.x) * 0.05;
      curr.y += (target.y - curr.y) * 0.05;
      group.rotation.y = curr.x * 0.6 + t * 0.04;
      group.rotation.x = curr.y * 0.4;
      camera.position.x += (curr.x * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-curr.y * 1.0 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Per-shape spin + float
      for (const m of shapes) {
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

  /* ========================================================
     2. SCROLL REVEAL
     ======================================================== */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ========================================================
     3. SCROLL PROGRESS + NAV STATE
     ======================================================== */
  function initScrollUI() {
    const bar = document.querySelector(".scroll-progress span");
    const nav = document.getElementById("nav");
    function onScroll() {
      const st = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("is-scrolled", st > 30);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ========================================================
     4. MAGNETIC ELEMENTS
     Elements tagged [data-magnetic] drift toward the cursor.
     ======================================================== */
  function initMagnetic() {
    if (prefersReducedMotion || isTouch) return;
    const items = document.querySelectorAll("[data-magnetic]");
    const strength = 0.35;
    items.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ========================================================
     5. TILT CARDS (with pointer-tracked glow)
     ======================================================== */
  function initTilt() {
    if (prefersReducedMotion || isTouch) return;
    const cards = document.querySelectorAll(".tilt");
    cards.forEach((card) => {
      const max = 8; // max degrees
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * (max * 2);
        const rx = -(py - 0.5) * (max * 2);
        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ========================================================
     6. ANIMATED STAT COUNTERS
     ======================================================== */
  function initCounters() {
    const nums = document.querySelectorAll(".stat__num");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      nums.forEach((n) => (n.textContent = n.dataset.count));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const dur = 1600;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            const val = target * eased;
            el.textContent = Number.isInteger(target)
              ? Math.round(val).toString()
              : val.toFixed(1);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ========================================================
     7. CUSTOM CURSOR
     ======================================================== */
  function initCursor() {
    if (prefersReducedMotion || isTouch) return;
    const cursor = document.querySelector(".cursor");
    if (!cursor) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add("is-active");
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    function loop() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    // Grow over interactive elements
    document.querySelectorAll("a, button, .tilt").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ========================================================
     8. MISC — footer year
     ======================================================== */
  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---- boot ---- */
  function init() {
    initScene();
    initReveal();
    initScrollUI();
    initMagnetic();
    initTilt();
    initCounters();
    initCursor();
    initYear();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
