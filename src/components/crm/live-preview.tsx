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

function buildPreviewHtml(d: PortfolioData): string {
  const c = d.config
  const marqueeTrack = [...d.marquee, ...d.marquee]
    .map((m) => `<span>${escapeHtml(m.text)}</span><span>·</span>`)
    .join('\n        ')

  const projectCards = d.projects.map((p, i) => `
        <article class="card tilt" style="--d:.0${(i + 1) % 9}s">
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
        </article>`).join('\n')

  const statBlocks = d.stats.map((s, i) => `
          <div class="stat" style="--d:.0${(i + 1) % 9}s">
            <span class="stat__num">${escapeHtml(String(s.count))}</span><span class="stat__suffix">${escapeHtml(s.suffix)}</span>
            <span class="stat__label">${escapeHtml(s.label)}</span>
          </div>`).join('\n')

  const stackGroups = d.stack.map((g) => `
        <div class="stack__group">
          <h4>${escapeHtml(g.title)}</h4>
          <ul>
            ${g.items.map((it) => `<li>${escapeHtml(it.name)}</li>`).join('')}
          </ul>
        </div>`).join('\n')

  const socialItems = d.socials.map((s) => {
    const isExternal = /^https?:\/\//.test(s.url)
    const target = isExternal ? ' target="_blank"' : ''
    return `        <li><a href="${escapeHtml(s.url)}"${target}>${escapeHtml(s.label)}</a></li>`
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

/* Preview-only tweaks: disable 3D canvas / grain / cursor / progress,
   and render .reveal elements in their final state so the editor
   reflects exactly what the user will see. */
.grain, .scroll-progress, .cursor, .hero__scene { display: none !important; }
.reveal { opacity: 1 !important; transform: none !important; }
.hero { min-height: auto; padding: 120px 0 80px; }
.hero__veil { display: none; }
body { background: var(--bg); }

/* Scrollbar styling for the iframe body */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg-2); }
::-webkit-scrollbar-thumb { background: var(--ink-mute); border-radius: 4px; }
</style>
</head>
<body>
  <header class="nav is-scrolled" id="nav">
    <a href="#top" class="nav__brand">
      <span class="nav__mark">${escapeHtml(c.brandMark)}</span>
      <span class="nav__brandtext">${escapeHtml(c.brandName)}</span>
    </a>
    <nav class="nav__links" aria-label="Primary">
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#stack">Stack</a>
      <a href="#contact" class="nav__cta">Get in touch</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero" id="hero">
      <div class="hero__inner">
        <p class="hero__eyebrow">
          <span class="dot"></span> ${escapeHtml(c.heroEyebrow)}
        </p>
        <h1 class="hero__title">
          <span class="hero__line">${escapeHtml(c.heroLine1)}</span>
          <span class="hero__line">
            <em>${escapeHtml(c.heroLine2Em)}</em> ${escapeHtml(c.heroLine2Text)}
          </span>
          <span class="hero__line">${escapeHtml(c.heroLine3Pre)} <em>${escapeHtml(c.heroLine3Em)}</em></span>
        </h1>
        <p class="hero__lede">${safeRich(c.heroLede)}</p>
        <div class="hero__actions">
          <a href="#work" class="btn btn--primary">
            ${escapeHtml(c.heroPrimaryBtn)} <span class="btn__arrow">→</span>
          </a>
          <a href="#contact" class="btn btn--ghost">${escapeHtml(c.heroSecondaryBtn)}</a>
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
        <h2 class="section-head__title">${escapeHtml(c.workSectionTitle)}</h2>
        <p class="section-head__sub">${escapeHtml(c.workSectionSub)}</p>
      </header>

      <div class="work__grid">
${projectCards}
      </div>
    </section>

    <section class="about" id="about">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.aboutSectionIndex)}</span>
        <h2 class="section-head__title">${escapeHtml(c.aboutSectionTitle)}</h2>
      </header>
      <div class="about__body">
        <p class="about__lede">${safeRich(c.aboutLede)}</p>
        <div class="about__cols">
          <p>${escapeHtml(c.aboutPara1)}</p>
          <p>${escapeHtml(c.aboutPara2)}</p>
        </div>

        <div class="about__stats">
${statBlocks}
        </div>
      </div>
    </section>

    <section class="stack" id="stack">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.stackSectionIndex)}</span>
        <h2 class="section-head__title">${escapeHtml(c.stackSectionTitle)}</h2>
        <p class="section-head__sub">${escapeHtml(c.stackSectionSub)}</p>
      </header>

      <div class="stack__grid">
${stackGroups}
      </div>
    </section>

    <section class="contact" id="contact">
      <p class="contact__eyebrow">${escapeHtml(c.contactEyebrow)}</p>
      <h2 class="contact__title">
        <a href="mailto:${escapeHtml(c.contactEmail)}" class="contact__email">
          ${escapeHtml(c.contactEmail)}
        </a>
      </h2>
      <p class="contact__sub">${escapeHtml(c.contactSub)}</p>
      <ul class="contact__socials">
${socialItems}
      </ul>
    </section>
  </main>

  <footer class="footer">
    <span>© ${year} ${escapeHtml(c.footerName)}</span>
    <span class="footer__meta">${escapeHtml(c.footerMeta)}</span>
  </footer>
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
          sandbox="allow-same-origin allow-popups"
        />
      </div>
    </div>
  )
}
