// Portfolio preview boot script — loaded by the CRM live-preview iframe.
// This is the same logic as the original app.js, ported to vanilla JS
// so it can run inside the srcDoc iframe document.
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
