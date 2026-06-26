import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'
import { PortfolioView } from '@/components/portfolio/portfolio-view'
import { CrmLogin } from '@/components/crm/crm-login'
import { CrmDashboard } from '@/components/crm/crm-dashboard'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth'
import { loadPortfolio } from '@/lib/load-portfolio'

// ─────────────────────────────────────────────────────────────────────────
// Two sites, one Next.js app:
//
//   /            → public portfolio (anyone can visit, all animations live)
//   /?admin      → CRM login (or dashboard if already signed in)
//
// The portfolio reads from the same SQLite database the CRM writes to,
// so any change Biki saves in the CRM shows up on the public portfolio
// on the very next page load.
// ─────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic' // always read fresh DB content

const SITE_URL = (process.env.SITE_URL ?? 'https://biki-portfolio.vercel.app').replace(/\/$/, '')

// Dynamic <title> and <meta description> driven by the CRM-edited content.
// Also builds a keyword-rich title for SEO.
export async function generateMetadata(): Promise<Metadata> {
  const data = await loadPortfolio()
  const c = data.config
  return {
    title: c.seoTitle || 'Biki Kalita — ML Engineer & Software Engineer | Machine Learning, Data Science',
    description:
      c.seoDescription ||
      'ML Engineer and Software Engineer specializing in machine learning, data science, predictive modeling, and production-ready ML APIs.',
    alternates: { canonical: '/' },
    openGraph: {
      title: c.seoTitle || 'Biki Kalita — ML Engineer',
      description:
        c.seoDescription ||
        'Machine Learning engineer building production-ready ML workflows, predictive models, and inference APIs.',
      url: SITE_URL,
      type: 'profile',
      images: [{ url: '/icon.svg', width: 512, height: 512, alt: c.brandName || 'Biki Kalita' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.seoTitle || 'Biki Kalita — ML Engineer',
      description: c.seoDescription || '',
      images: ['/icon.svg'],
    },
  }
}

// Build JSON-LD Person + WebSite structured data so Google can render a
// rich knowledge card for "Biki Kalita ML Engineer".
function buildJsonLd(data: Awaited<ReturnType<typeof loadPortfolio>>) {
  const c = data.config
  const sameAs = data.socials
    .filter((s) => /^https?:\/\//.test(s.url))
    .map((s) => s.url)
  const knowsAbout = [
    ...data.stack.flatMap((g) => g.items.map((i) => i.name)),
    'Machine Learning',
    'Data Science',
    'Predictive Modeling',
    'Software Engineering',
  ]

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.brandName || 'Biki Kalita',
    jobTitle: 'ML Engineer',
    description: c.seoDescription,
    url: SITE_URL,
    email: `mailto:${c.contactEmail}`,
    image: `${SITE_URL}/icon.svg`,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: Array.from(new Set(knowsAbout)).slice(0, 20),
    worksFor: undefined,
    address: undefined,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: c.brandName || 'Biki Kalita — Portfolio',
    description: c.seoDescription,
    author: { '@type': 'Person', name: c.brandName || 'Biki Kalita' },
    inLanguage: 'en',
  }

  const profilePage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: person,
    url: SITE_URL,
  }

  return [person, website, profilePage]
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>
}) {
  const sp = await searchParams
  const isAdminRoute = 'admin' in sp

  // Read the per-request nonce so we can attach it to inline JSON-LD scripts.
  // (Next.js auto-applies the nonce to its own inline scripts because we also
  // read x-nonce in layout.tsx.)
  const nonce = (await headers()).get('x-nonce') ?? undefined

  // Compute the request origin (e.g. https://biki-portfolio.vercel.app) so
  // the CRM's live-preview iframe can load /preview-boot.js via an absolute
  // URL (srcDoc iframes have no base URL, so relative URLs don't resolve).
  const headerList = await headers()
  const proto = headerList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000'
  const origin = `${proto}://${host}`

  // Public portfolio — anyone can see this.
  if (!isAdminRoute) {
    const data = await loadPortfolio()
    const jsonLd = buildJsonLd(data)
    return (
      <>
        {/* JSON-LD structured data for Google rich results */}
        {jsonLd.map((node, i) => (
          <script
            key={i}
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
          />
        ))}
        <PortfolioView data={data} nonce={nonce} />
      </>
    )
  }

  // CRM route — requires a valid session cookie.
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(jwt)

  if (!session) {
    return <CrmLogin />
  }

  // Authenticated CRM dashboard.
  const data = await loadPortfolio()
  return <CrmDashboard username={session.username} dataSeed={data} origin={origin} nonce={nonce} />
}
