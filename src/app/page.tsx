import { cookies } from 'next/headers'
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

// Dynamic <title> and <meta description> driven by the CRM-edited content.
export async function generateMetadata(): Promise<Metadata> {
  const data = await loadPortfolio()
  return {
    title: data.config.seoTitle || 'Biki Kalita · ML Engineer',
    description: data.config.seoDescription || '',
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>
}) {
  const sp = await searchParams
  const isAdminRoute = 'admin' in sp

  // Public portfolio — anyone can see this.
  if (!isAdminRoute) {
    const data = await loadPortfolio()
    return <PortfolioView data={data} />
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
  return <CrmDashboard username={session.username} dataSeed={data} />
}
