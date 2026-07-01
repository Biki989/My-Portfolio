import type { PortfolioData } from '@/lib/portfolio-types'
import Script from 'next/script'

// ─────────────────────────────────────────────────────────────────────────
// Public portfolio view — server component.
//
// Renders the exact same HTML structure as the original My-Portfolio-main/
// index.html, loads the original style.css and app.js as EXTERNAL files
// (/portfolio.css and /portfolio.js), and Three.js from CDN.
//
// No inline styles, no inline scripts → CSP-friendly.
// No React hydration → Three.js renderer is stable (React won't re-render
// the canvas element).
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

export function PortfolioView({ data }: { data: PortfolioData }) {
  const c = data.config

  const marqueeTrack = [...data.marquee, ...data.marquee]
    .map((m) => `<span>${escapeHtml(m.text)}</span><span>·</span>`)
    .join('\n        ')

  return (
    <>
      {/* ─── Fonts ─── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* preload the CSS for faster LCP (Core Web Vitals → SEO) */}
      <link rel="preload" href="/portfolio.css" as="style" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400;1,6..72,500&display=swap"
        rel="stylesheet"
      />

      {/* ─── Original portfolio CSS (external file) ─── */}
      <link rel="stylesheet" href="/portfolio.css" />

      {/* ─── Grain + scroll progress + custom cursor overlays ─── */}
      <div className="grain" aria-hidden="true"></div>
      <div className="scroll-progress" aria-hidden="true"><span></span></div>
      <div className="cursor" aria-hidden="true"><div className="cursor__dot"></div></div>

      {/* ─── NAV ─── */}
      <header className="nav" id="nav">
        <a href="#top" className="nav__brand" data-magnetic aria-label={`${c.brandName} — home`}>
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
        {/* Visually-hidden H1 for SEO — Google weights the H1 heavily for
            name searches. The visible hero title below is an H2. */}
        <h1 className="sr-only">
          Biki Kalita — ML Engineer based in Assam, India
        </h1>

        {/* ─── HERO ─── */}
        <section className="hero" id="hero">
          <canvas className="hero__scene" id="rain" aria-hidden="true"></canvas>
          <div className="hero__veil" aria-hidden="true"></div>

          <div className="hero__inner">
            <p className="hero__eyebrow reveal">
              <span className="dot"></span> {c.heroEyebrow}
            </p>
            <h2 className="hero__title">
              <span className="hero__line reveal" style={{ '--d': '.05s' } as React.CSSProperties}>{c.heroLine1}</span>
              <span className="hero__line reveal" style={{ '--d': '.18s' } as React.CSSProperties}>
                <em>{c.heroLine2Em}</em> {c.heroLine2Text}
              </span>
              <span className="hero__line reveal" style={{ '--d': '.31s' } as React.CSSProperties}>
                {c.heroLine3Pre} <em>{c.heroLine3Em}</em>
              </span>
            </h2>
            <p
              className="hero__lede reveal"
              style={{ '--d': '.5s' } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: safeRich(c.heroLede) }}
            />
            <div className="hero__actions reveal" style={{ '--d': '.64s' } as React.CSSProperties}>
              <a href="#work" className="btn btn--primary" data-magnetic>
                {c.heroPrimaryBtn} <span className="btn__arrow">→</span>
              </a>
              <a href="#contact" className="btn btn--ghost" data-magnetic>{c.heroSecondaryBtn}</a>
            </div>
          </div>
        </section>

        {/* ─── MARQUEE ─── */}
        <section className="marquee" aria-hidden="true">
          <div className="marquee__track" dangerouslySetInnerHTML={{ __html: marqueeTrack }} />
        </section>

        {/* ─── WORK ─── */}
        <section className="work" id="work">
          <header className="section-head">
            <span className="section-head__index">{c.workSectionIndex}</span>
            <h2 className="section-head__title reveal">{c.workSectionTitle}</h2>
            <p className="section-head__sub reveal" style={{ '--d': '.1s' } as React.CSSProperties}>{c.workSectionSub}</p>
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
                  style={{ '--d': `.${String(i * 5 + 5).padStart(2, '0')}s` } as React.CSSProperties}
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

        {/* ─── ABOUT ─── */}
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
              <p className="reveal" style={{ '--d': '.1s' } as React.CSSProperties}>{c.aboutPara1}</p>
              <p className="reveal" style={{ '--d': '.2s' } as React.CSSProperties}>{c.aboutPara2}</p>
            </div>

            <div className="about__stats">
              {data.stats.map((s, i) => (
                <div
                  key={s.id}
                  className="stat reveal"
                  style={{ '--d': `.${String(i * 5 + 5).padStart(2, '0')}s` } as React.CSSProperties}
                >
                  <span className="stat__num" data-count={s.count}>0</span>
                  <span className="stat__suffix">{s.suffix}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STACK ─── */}
        <section className="stack" id="stack">
          <header className="section-head">
            <span className="section-head__index">{c.stackSectionIndex}</span>
            <h2 className="section-head__title reveal">{c.stackSectionTitle}</h2>
            <p className="section-head__sub reveal" style={{ '--d': '.1s' } as React.CSSProperties}>{c.stackSectionSub}</p>
          </header>

          <div className="stack__grid">
            {data.stack.map((g, i) => (
              <div
                key={g.id}
                className="stack__group reveal"
                style={{ '--d': `.${String(i * 5 + 5).padStart(2, '0')}s` } as React.CSSProperties}
              >
                <h4>{g.title}</h4>
                <ul>
                  {g.items.map((it) => <li key={it.id}>{it.name}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section className="contact" id="contact">
          <p className="contact__eyebrow reveal">{c.contactEyebrow}</p>
          <h2 className="contact__title">
            <a href={`mailto:${c.contactEmail}`} className="contact__email" data-magnetic>
              {c.contactEmail}
            </a>
          </h2>
          <p className="contact__sub reveal">{c.contactSub}</p>
          {/* Visually-hidden address with the name — semantic SEO signal
              that helps Google associate the name with this page. */}
          <address className="sr-only">
            Biki Kalita — ML Engineer, Assam, India. Email: {c.contactEmail}
          </address>
          <ul className="contact__socials">
            {data.socials.map((s) => {
              const isExternal = /^https?:\/\//.test(s.url)
              // rel="me" tells Google these profiles belong to the same person
              // (Biki Kalita), which helps build a knowledge panel.
              const rel = isExternal
                ? 'noopener noreferrer me'
                : undefined
              return (
                <li key={s.id}>
                  <a
                    href={s.url}
                    {...(isExternal ? { target: '_blank' } : {})}
                    {...(rel ? { rel } : {})}
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
        <span>© <span id="year"></span> {c.footerName}</span>
        <span className="footer__meta">{c.footerMeta}</span>
      </footer>

      {/* ─── Original portfolio JS (external file) + Three.js ─── */}
      {/* next/script properly handles script injection and execution in
          Next.js (plain <script> tags rendered by server components don't
          execute on the client). THREE loads first via beforeInteractive
          (injected into <head>, blocking), then portfolio.js loads via
          afterInteractive and boots the scene. */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/portfolio.js"
        strategy="afterInteractive"
      />
    </>
  )
}
