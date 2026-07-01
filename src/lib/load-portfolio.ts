// Reads the portfolio content from the database for server-side rendering.
// Used by both the public PortfolioView and the CRM preview iframe.

import { db } from '@/lib/db'
import { EMPTY_CONFIG, type PortfolioConfig, type PortfolioData } from '@/lib/portfolio-types'

export async function loadPortfolio(): Promise<PortfolioData> {
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

  return {
    config: { ...EMPTY_CONFIG, ...((config ?? {}) as Partial<PortfolioConfig>) },
    marquee,
    projects,
    stats,
    stack,
    socials,
  }
}
