import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth'

// Generate a standalone index.html file (matching the original portfolio template)
// that contains the user-edited content. The CRM downloads this and the user
// can drop it back into their static portfolio repo.

const CSS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet" />`

function escapeHtml(s: string) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Allow simple inline tags like <strong> and <em> through. Strip everything else.
function safeRich(s: string) {
  const escaped = escapeHtml(s)
  // Unescape only the whitelisted inline tags we explicitly allow.
  return escaped
    .replace(/&lt;(\/?)(strong|em|br|span|code|b|i)&gt;/g, '<$1$2>')
}

function buildHtml(c: Record<string, string>, data: {
  marquee: { text: string }[]
  projects: {
    tag: string; year: string; title: string; description: string; liveUrl: string;
    techs: { name: string }[]
  }[]
  stats: { count: number; suffix: string; label: string }[]
  stack: { title: string; items: { name: string }[] }[]
  socials: { label: string; url: string }[]
}) {
  const year = new Date().getFullYear()
  const marqueeTrack = [...data.marquee, ...data.marquee]
    .map((m) => `<span>${escapeHtml(m.text)}</span><span>·</span>`)
    .join('\n        ')

  const projectCards = data.projects.map((p) => `
        <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
        <article class="card tilt reveal" style="--d:.05s">
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

  const statBlocks = data.stats.map((s) => `
          <div class="stat reveal" style="--d:.05s">
            <span class="stat__num" data-count="${s.count}">0</span><span class="stat__suffix">${escapeHtml(s.suffix)}</span>
            <span class="stat__label">${escapeHtml(s.label)}</span>
          </div>`).join('\n')

  const stackGroups = data.stack.map((g) => `
        <div class="stack__group reveal">
          <h4>${escapeHtml(g.title)}</h4>
          <ul>
            ${g.items.map((i) => `<li>${escapeHtml(i.name)}</li>`).join('')}
          </ul>
        </div>`).join('\n')

  const socialItems = data.socials.map((s) => {
    const isExternal = /^https?:\/\//.test(s.url)
    const target = isExternal ? ' target="_blank"' : ''
    return `        <li><a href="${escapeHtml(s.url)}"${target} data-magnetic>${escapeHtml(s.label)}</a></li>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(c.seoDescription ?? '')}" />
  <title>${escapeHtml(c.seoTitle ?? '')}</title>

  ${CSS_LINK}

  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="grain" aria-hidden="true"></div>
  <div class="scroll-progress" aria-hidden="true"><span></span></div>
  <div class="cursor" aria-hidden="true"><div class="cursor__dot"></div></div>

  <header class="nav" id="nav">
    <a href="#top" class="nav__brand" data-magnetic>
      <span class="nav__mark">${escapeHtml(c.brandMark ?? '')}</span>
      <span class="nav__brandtext">${escapeHtml(c.brandName ?? '')}</span>
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
          <span class="dot"></span> ${escapeHtml(c.heroEyebrow ?? '')}
        </p>
        <h1 class="hero__title">
          <span class="hero__line reveal" style="--d:.05s">${escapeHtml(c.heroLine1 ?? '')}</span>
          <span class="hero__line reveal" style="--d:.18s">
            <em>${escapeHtml(c.heroLine2Em ?? '')}</em> ${escapeHtml(c.heroLine2Text ?? '')}
          </span>
          <span class="hero__line reveal" style="--d:.31s">${escapeHtml(c.heroLine3Pre ?? '')} <em>${escapeHtml(c.heroLine3Em ?? '')}</em></span>
        </h1>
        <p class="hero__lede reveal" style="--d:.5s">${safeRich(c.heroLede ?? '')}</p>
        <div class="hero__actions reveal" style="--d:.64s">
          <a href="#work" class="btn btn--primary" data-magnetic>
            ${escapeHtml(c.heroPrimaryBtn ?? '')} <span class="btn__arrow">→</span>
          </a>
          <a href="#contact" class="btn btn--ghost" data-magnetic>${escapeHtml(c.heroSecondaryBtn ?? '')}</a>
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
        <span class="section-head__index">${escapeHtml(c.workSectionIndex ?? '')}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.workSectionTitle ?? '')}</h2>
        <p class="section-head__sub reveal" style="--d:.1s">${escapeHtml(c.workSectionSub ?? '')}</p>
      </header>

      <div class="work__grid">
${projectCards}
      </div>
    </section>

    <section class="about" id="about">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.aboutSectionIndex ?? '')}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.aboutSectionTitle ?? '')}</h2>
      </header>
      <div class="about__body">
        <p class="about__lede reveal">${safeRich(c.aboutLede ?? '')}</p>
        <div class="about__cols">
          <p class="reveal" style="--d:.1s">${escapeHtml(c.aboutPara1 ?? '')}</p>
          <p class="reveal" style="--d:.2s">${escapeHtml(c.aboutPara2 ?? '')}</p>
        </div>

        <div class="about__stats">
${statBlocks}
        </div>
      </div>
    </section>

    <section class="stack" id="stack">
      <header class="section-head">
        <span class="section-head__index">${escapeHtml(c.stackSectionIndex ?? '')}</span>
        <h2 class="section-head__title reveal">${escapeHtml(c.stackSectionTitle ?? '')}</h2>
        <p class="section-head__sub reveal" style="--d:.1s">${escapeHtml(c.stackSectionSub ?? '')}</p>
      </header>

      <div class="stack__grid">
${stackGroups}
      </div>
    </section>

    <section class="contact" id="contact">
      <p class="contact__eyebrow reveal">${escapeHtml(c.contactEyebrow ?? '')}</p>
      <h2 class="contact__title">
        <a href="mailto:${escapeHtml(c.contactEmail ?? '')}" class="contact__email" data-magnetic>
          ${escapeHtml(c.contactEmail ?? '')}
        </a>
      </h2>
      <p class="contact__sub reveal">${escapeHtml(c.contactSub ?? '')}</p>
      <ul class="contact__socials">
${socialItems}
      </ul>
    </section>
  </main>

  <footer class="footer">
    <span>© ${year} ${escapeHtml(c.footerName ?? '')}</span>
    <span class="footer__meta">${escapeHtml(c.footerMeta ?? '')}</span>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
`
}

export async function GET() {
  // ─── Auth gate: only a logged-in CRM user can export. ───
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(jwt)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [config, marquee, projects, stats, stack, socials] = await Promise.all([
    db.siteConfig.findUnique({ where: { id: 'singleton' } }),
    db.marqueeItem.findMany({ orderBy: { order: 'asc' } }),
    db.project.findMany({
      orderBy: { order: 'asc' },
      include: { techs: { orderBy: { order: 'asc' } } },
    }),
    db.stat.findMany({ orderBy: { order: 'asc' } }),
    db.stackGroup.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    }),
    db.social.findMany({ orderBy: { order: 'asc' } }),
  ])

  const html = buildHtml(
    (config as unknown as Record<string, string>) ?? {},
    {
      marquee: marquee.map((m) => ({ text: m.text })),
      projects: projects.map((p) => ({
        tag: p.tag, year: p.year, title: p.title,
        description: p.description, liveUrl: p.liveUrl,
        techs: p.techs.map((t) => ({ name: t.name })),
      })),
      stats: stats.map((s) => ({ count: s.count, suffix: s.suffix, label: s.label })),
      stack: stack.map((g) => ({
        title: g.title,
        items: g.items.map((i) => ({ name: i.name })),
      })),
      socials: socials.map((s) => ({ label: s.label, url: s.url })),
    },
  )

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="index.html"',
    },
  })
}
