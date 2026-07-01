'use client'

import { useMemo } from 'react'
import { usePortfolio } from '@/lib/portfolio-store'
import type { PortfolioData } from '@/lib/portfolio-types'

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

// The preview iframe loads the SAME external CSS (/portfolio.css) and JS
// (/portfolio.js) as the live public portfolio — so the CRM preview shows
// exactly what visitors see. Both are loaded via absolute URLs because
// srcDoc iframes have no base URL, so relative URLs don't resolve.

function buildPreviewHtml(d: PortfolioData, origin: string): string {
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(c.seoTitle || 'Portfolio preview')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="${escapeHtml(origin)}/portfolio.css" />
<style>
/* Preview-only tweaks: just scrollbar styling */
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
    <span>© <span id="year"></span> ${escapeHtml(c.footerName)}</span>
    <span class="footer__meta">${escapeHtml(c.footerMeta)}</span>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="${escapeHtml(origin)}/portfolio.js"></script>
</body>
</html>`
}

export function LivePreview({
  width = 'desktop',
  origin,
}: {
  width?: 'desktop' | 'mobile'
  origin: string
}) {
  const data = usePortfolio((s) => s.data)
  const html = useMemo(() => buildPreviewHtml(data, origin), [data, origin])

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
