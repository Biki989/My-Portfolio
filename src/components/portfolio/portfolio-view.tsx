'use client'

import { useEffect, useRef } from 'react'
import type { PortfolioData } from '@/lib/portfolio-types'
import { PREVIEW_CSS } from '@/lib/preview-css'

// ─────────────────────────────────────────────────────────────────────────
// Public portfolio view — renders the full animated portfolio exactly like
// the original My-Portfolio-main/index.html, but reads content from props
// (which come from the database). Used at the `/` route.
// ─────────────────────────────────────────────────────────────────────────

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

declare global {
  interface Window { THREE: any }
}

export function PortfolioView({ data, nonce }: { data: PortfolioData; nonce?: string }) {
  const c = data.config
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Inject the portfolio CSS once.
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-portfolio-css', 'true')
    style.textContent = PREVIEW_CSS
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Boot all the interactions (Three.js scene, reveal, scroll UI, magnetic,
  // tilt, counters, cursor, year). Same logic as the original app.js.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches

    // --- 1. Three.js hero scene ---
    function initScene(): (() => void) | undefined {
      const canvas = canvasRef.current
      if (!canvas || prefersReducedMotion || typeof window.THREE === 'undefined') return
      const THREE = window.THREE

      const renderer = new THREE.WebGLRenderer({
        canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

      const scene = new THREE.Scene()
      scene.fog = new THREE.Fog(0xE9EBEF, 9, 24)
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
      camera.position.set(0, 0, 11)

      scene.add(new THREE.AmbientLight(0xffffff, 0.85))
      const key = new THREE.DirectionalLight(0xffffff, 0.9)
      key.position.set(5, 6, 8)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0x1D4ED8, 0.55)
      rim.position.set(-6, -3, 4)
      scene.add(rim)

      const group = new THREE.Group()
      scene.add(group)

      const palette = [0x1D4ED8, 0x0E1116, 0x60A5FA, 0x3D4350, 0x717784]
      const geos = [
        new THREE.IcosahedronGeometry(1.3, 0),
        new THREE.TorusGeometry(0.95, 0.32, 16, 60),
        new THREE.TorusKnotGeometry(0.7, 0.24, 90, 16),
        new THREE.OctahedronGeometry(1.15, 0),
        new THREE.SphereGeometry(1.05, 32, 32),
        new THREE.DodecahedronGeometry(1.1, 0),
      ]
      const shapes: any[] = []
      const COUNT = geos.length
      for (let i = 0; i < COUNT; i++) {
        const color = palette[i % palette.length]
        const fill = new THREE.MeshStandardMaterial({
          color, transparent: true, opacity: 0.14, roughness: 0.4, metalness: 0.1,
          flatShading: geos[i].type === 'IcosahedronGeometry' || geos[i].type === 'OctahedronGeometry',
        })
        const wire = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })
        const mesh = new THREE.Mesh(geos[i], fill)
        mesh.add(new THREE.LineSegments(new THREE.WireframeGeometry(geos[i]), wire))
        const angle = (i / COUNT) * Math.PI * 2
        const radius = 4.2 + (i % 2) * 1.6
        mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.55 + (i % 2 ? 0.8 : -0.8),
          (i % 3) - 1,
        )
        const s = 0.7 + (i % 3) * 0.18
        mesh.scale.setScalar(s)
        mesh.userData = {
          spin: {
            x: (Math.random() - 0.5) * 0.004,
            y: (Math.random() - 0.5) * 0.006,
            z: (Math.random() - 0.5) * 0.003,
          },
          floatPhase: Math.random() * Math.PI * 2,
          floatAmp: 0.25 + Math.random() * 0.35,
          baseY: mesh.position.y,
        }
        group.add(mesh)
        shapes.push(mesh)
      }

      const PCOUNT = 220
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(PCOUNT * 3)
      for (let i = 0; i < PCOUNT; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 26
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 16
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 14
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      const pMat = new THREE.PointsMaterial({
        color: 0x0E1116, size: 0.045, transparent: true, opacity: 0.4, sizeAttenuation: true,
      })
      const points = new THREE.Points(pGeo, pMat)
      scene.add(points)

      const target = { x: 0, y: 0 }
      const curr = { x: 0, y: 0 }
      if (!isTouch) {
        const onMove = (e: MouseEvent) => {
          target.x = (e.clientX / window.innerWidth - 0.5)
          target.y = (e.clientY / window.innerHeight - 0.5)
        }
        window.addEventListener('mousemove', onMove)
      }

      function resize() {
        if (!canvas) return
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      window.addEventListener('resize', resize)

      const clock = new THREE.Clock()
      let raf = 0
      function animate() {
        const t = clock.getElapsedTime()
        curr.x += (target.x - curr.x) * 0.05
        curr.y += (target.y - curr.y) * 0.05
        group.rotation.y = curr.x * 0.6 + t * 0.04
        group.rotation.x = curr.y * 0.4
        camera.position.x += (curr.x * 1.5 - camera.position.x) * 0.05
        camera.position.y += (-curr.y * 1.0 - camera.position.y) * 0.05
        camera.lookAt(0, 0, 0)
        for (const m of shapes) {
          m.rotation.x += m.userData.spin.x
          m.rotation.y += m.userData.spin.y
          m.rotation.z += m.userData.spin.z
          m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.floatPhase) * m.userData.floatAmp
        }
        points.rotation.y = t * 0.02
        renderer.render(scene, camera)
        raf = requestAnimationFrame(animate)
      }
      animate()

      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        renderer.dispose()
      }
    }

    // --- 2. Scroll reveal ---
    function initReveal() {
      const els = document.querySelectorAll('.reveal')
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-visible'))
        return
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible')
              io.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      )
      els.forEach((el) => io.observe(el))
    }

    // --- 3. Scroll progress + nav state ---
    function initScrollUI() {
      const bar = document.querySelector('.scroll-progress span') as HTMLElement | null
      const nav = document.getElementById('nav')
      function onScroll() {
        const st = window.scrollY || document.documentElement.scrollTop
        const max = document.documentElement.scrollHeight - window.innerHeight
        if (bar) bar.style.width = (max > 0 ? (st / max) * 100 : 0) + '%'
        if (nav) nav.classList.toggle('is-scrolled', st > 30)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    // --- 4. Magnetic ---
    function initMagnetic() {
      if (prefersReducedMotion || isTouch) return
      const items = document.querySelectorAll('[data-magnetic]')
      const strength = 0.35
      items.forEach((el) => {
        el.addEventListener('mousemove', (e: Event) => {
          const ev = e as MouseEvent
          const r = el.getBoundingClientRect()
          const x = ev.clientX - (r.left + r.width / 2)
          const y = ev.clientY - (r.top + r.height / 2)
          ;(el as HTMLElement).style.transform = `translate(${x * strength}px, ${y * strength}px)`
        })
        el.addEventListener('mouseleave', () => {
          ;(el as HTMLElement).style.transform = ''
        })
      })
    }

    // --- 5. Tilt ---
    function initTilt() {
      if (prefersReducedMotion || isTouch) return
      const cards = document.querySelectorAll('.tilt')
      cards.forEach((card) => {
        const max = 8
        card.addEventListener('mousemove', (e: Event) => {
          const ev = e as MouseEvent
          const r = card.getBoundingClientRect()
          const px = (ev.clientX - r.left) / r.width
          const py = (ev.clientY - r.top) / r.height
          const ry = (px - 0.5) * (max * 2)
          const rx = -(py - 0.5) * (max * 2)
          ;(card as HTMLElement).style.transform =
            `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
          ;(card as HTMLElement).style.setProperty('--mx', px * 100 + '%')
          ;(card as HTMLElement).style.setProperty('--my', py * 100 + '%')
        })
        card.addEventListener('mouseleave', () => {
          ;(card as HTMLElement).style.transform = ''
        })
      })
    }

    // --- 6. Stat counters ---
    function initCounters() {
      const nums = document.querySelectorAll('.stat__num')
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        nums.forEach((n) => (n.textContent = (n as HTMLElement).dataset.count))
        return
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            const el = e.target as HTMLElement
            const target = parseFloat(el.dataset.count || '0')
            const dur = 1600
            const start = performance.now()
            function tick(now: number) {
              const p = Math.min((now - start) / dur, 1)
              const eased = 1 - Math.pow(1 - p, 3)
              const val = target * eased
              el.textContent = Number.isInteger(target)
                ? Math.round(val).toString()
                : val.toFixed(1)
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
            io.unobserve(el)
          })
        },
        { threshold: 0.5 },
      )
      nums.forEach((n) => io.observe(n))
    }

    // --- 7. Custom cursor ---
    function initCursor() {
      if (prefersReducedMotion || isTouch) return
      const cursor = document.querySelector('.cursor') as HTMLElement | null
      if (!cursor) return
      let mx = 0, my = 0, cx = 0, cy = 0
      const onMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY
        cursor.classList.add('is-active')
      }
      window.addEventListener('mousemove', onMove)
      document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'))
      let raf = 0
      function loop() {
        cx += (mx - cx) * 0.2
        cy += (my - cy) * 0.2
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`
        raf = requestAnimationFrame(loop)
      }
      loop()
      document.querySelectorAll('a, button, .tilt').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'))
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'))
      })
    }

    // Boot everything once Three.js is available.
    function boot(): (() => void) | undefined {
      const cleanup = initScene()
      initReveal()
      initScrollUI()
      initMagnetic()
      initTilt()
      initCounters()
      initCursor()
      return cleanup
    }

    let cleanup: (() => void) | undefined
    if (typeof window.THREE !== 'undefined') {
      cleanup = boot()
    } else {
      // Wait for the CDN script to load.
      const check = setInterval(() => {
        if (typeof window.THREE !== 'undefined') {
          clearInterval(check)
          cleanup = boot()
        }
      }, 50)
      setTimeout(() => clearInterval(check), 5000) // give up after 5s
    }

    return () => {
      cleanup?.()
    }
  }, [])

  const year = new Date().getFullYear()
  const marqueeTrack = [...data.marquee, ...data.marquee]
    .map((m) => `<span>${escapeHtml(m.text)}</span><span>·</span>`)
    .join('\n        ')

  return (
    <>
      {/* Load Three.js from CDN (same as the original portfolio) */}
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        async
      ></script>

      {/* Grain + scroll progress + custom cursor overlays */}
      <div className="grain" aria-hidden="true"></div>
      <div className="scroll-progress" aria-hidden="true"><span></span></div>
      <div className="cursor" aria-hidden="true"><div className="cursor__dot"></div></div>

      {/* ───────────── NAV ───────────── */}
      <header className="nav" id="nav">
        <a href="#top" className="nav__brand" data-magnetic>
          <span className="nav__mark">{c.brandMark}</span>
          <span className="nav__brandtext">{c.brandName}</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          <a href="#work" data-magnetic>Work</a>
          <a href="#about" data-magnetic>About</a>
          <a href="#stack" data-magnetic>Stack</a>
          <a href="#contact" className="nav__cta" data-magnetic>Get in touch</a>
        </nav>
      </header>

      <main id="top">
        {/* ───────────── HERO ───────────── */}
        <section className="hero" id="hero">
          <canvas className="hero__scene" ref={canvasRef} aria-hidden="true"></canvas>
          <div className="hero__veil" aria-hidden="true"></div>

          <div className="hero__inner">
            <p className="hero__eyebrow reveal">
              <span className="dot"></span> {c.heroEyebrow}
            </p>
            <h1 className="hero__title">
              <span className="hero__line reveal" style={{ ['--d' as any]: '.05s' }}>{c.heroLine1}</span>
              <span className="hero__line reveal" style={{ ['--d' as any]: '.18s' }}>
                <em>{c.heroLine2Em}</em> {c.heroLine2Text}
              </span>
              <span className="hero__line reveal" style={{ ['--d' as any]: '.31s' }}>
                {c.heroLine3Pre} <em>{c.heroLine3Em}</em>
              </span>
            </h1>
            <p
              className="hero__lede reveal"
              style={{ ['--d' as any]: '.5s' }}
              dangerouslySetInnerHTML={{ __html: safeRich(c.heroLede) }}
            />
            <div className="hero__actions reveal" style={{ ['--d' as any]: '.64s' }}>
              <a href="#work" className="btn btn--primary" data-magnetic>
                {c.heroPrimaryBtn} <span className="btn__arrow">→</span>
              </a>
              <a href="#contact" className="btn btn--ghost" data-magnetic>{c.heroSecondaryBtn}</a>
            </div>
          </div>

          <a href="#work" className="hero__scroll reveal" style={{ ['--d' as any]: '.85s' }} aria-label="Scroll to work">
            <span>Scroll</span>
            <span className="hero__scrollline"></span>
          </a>
        </section>

        {/* ───────────── MARQUEE ───────────── */}
        <section className="marquee" aria-hidden="true">
          <div className="marquee__track" dangerouslySetInnerHTML={{ __html: marqueeTrack }} />
        </section>

        {/* ───────────── WORK ───────────── */}
        <section className="work" id="work">
          <header className="section-head">
            <span className="section-head__index">{c.workSectionIndex}</span>
            <h2 className="section-head__title reveal">{c.workSectionTitle}</h2>
            <p className="section-head__sub reveal" style={{ ['--d' as any]: '.1s' }}>{c.workSectionSub}</p>
          </header>

          <div className="work__grid">
            {data.projects.map((p, i) => (
              <a
                key={p.id}
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article
                  className="card tilt reveal"
                  style={{ ['--d' as any]: `.${String(i * 5 + 5).padStart(2, '0')}s` }}
                >
                  <div className="card__glow"></div>
                  <div className="card__top">
                    <span className="card__tag">{p.tag}</span>
                    <span className="card__year">{p.year}</span>
                  </div>
                  <h3 className="card__title">{p.title}</h3>
                  <p className="card__desc">{p.description}</p>
                  <div className="card__meta">
                    {p.techs.map((t) => <span key={t.id}>{t.name}</span>)}
                  </div>
                  <div className="card__shine"></div>
                </article>
              </a>
            ))}
          </div>
        </section>

        {/* ───────────── ABOUT ───────────── */}
        <section className="about" id="about">
          <header className="section-head">
            <span className="section-head__index">{c.aboutSectionIndex}</span>
            <h2 className="section-head__title reveal">{c.aboutSectionTitle}</h2>
          </header>
          <div className="about__body">
            <p
              className="about__lede reveal"
              dangerouslySetInnerHTML={{ __html: safeRich(c.aboutLede) }}
            />
            <div className="about__cols">
              <p className="reveal" style={{ ['--d' as any]: '.1s' }}>{c.aboutPara1}</p>
              <p className="reveal" style={{ ['--d' as any]: '.2s' }}>{c.aboutPara2}</p>
            </div>

            <div className="about__stats">
              {data.stats.map((s, i) => (
                <div
                  key={s.id}
                  className="stat reveal"
                  style={{ ['--d' as any]: `.${String(i * 5 + 5).padStart(2, '0')}s` }}
                >
                  <span className="stat__num" data-count={s.count}>0</span>
                  <span className="stat__suffix">{s.suffix}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── STACK ───────────── */}
        <section className="stack" id="stack">
          <header className="section-head">
            <span className="section-head__index">{c.stackSectionIndex}</span>
            <h2 className="section-head__title reveal">{c.stackSectionTitle}</h2>
            <p className="section-head__sub reveal" style={{ ['--d' as any]: '.1s' }}>{c.stackSectionSub}</p>
          </header>

          <div className="stack__grid">
            {data.stack.map((g, i) => (
              <div
                key={g.id}
                className="stack__group reveal"
                style={{ ['--d' as any]: `.${String(i * 5 + 5).padStart(2, '0')}s` }}
              >
                <h4>{g.title}</h4>
                <ul>
                  {g.items.map((it) => <li key={it.id}>{it.name}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────── CONTACT ───────────── */}
        <section className="contact" id="contact">
          <p className="contact__eyebrow reveal">{c.contactEyebrow}</p>
          <h2 className="contact__title">
            <a href={`mailto:${c.contactEmail}`} className="contact__email" data-magnetic>
              {c.contactEmail}
            </a>
          </h2>
          <p className="contact__sub reveal">{c.contactSub}</p>
          <ul className="contact__socials">
            {data.socials.map((s) => {
              const isExternal = /^https?:\/\//.test(s.url)
              return (
                <li key={s.id}>
                  <a
                    href={s.url}
                    {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    data-magnetic
                  >
                    {s.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <span>© {year} {c.footerName}</span>
        <span className="footer__meta">{c.footerMeta}</span>
      </footer>
    </>
  )
}
