import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Shape of the full portfolio document returned to the CRM client.
export type PortfolioData = {
  config: Record<string, string>
  marquee: { id: string; text: string; order: number }[]
  projects: {
    id: string
    tag: string
    year: string
    title: string
    description: string
    liveUrl: string
    order: number
    techs: { id: string; name: string; order: number }[]
  }[]
  stats: { id: string; count: number; suffix: string; label: string; order: number }[]
  stack: {
    id: string
    title: string
    order: number
    items: { id: string; name: string; order: number }[]
  }[]
  socials: { id: string; label: string; url: string; order: number }[]
}

export async function GET() {
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

  return NextResponse.json({
    config: config ?? {},
    marquee,
    projects,
    stats,
    stack,
    socials,
  } satisfies PortfolioData)
}

// ───────────────── PUT (replace entire portfolio) ─────────────────

type ProjectTechInput = { id?: string; name: string; order: number }
type ProjectInput = {
  id?: string
  tag: string
  year: string
  title: string
  description: string
  liveUrl: string
  order: number
  techs: ProjectTechInput[]
}
type StatInput = { id?: string; count: number; suffix: string; label: string; order: number }
type StackItemInput = { id?: string; name: string; order: number }
type StackGroupInput = {
  id?: string
  title: string
  order: number
  items: StackItemInput[]
}
type SocialInput = { id?: string; label: string; url: string; order: number }
type MarqueeInput = { id?: string; text: string; order: number }

type Body = {
  config: Record<string, string>
  marquee: MarqueeInput[]
  projects: ProjectInput[]
  stats: StatInput[]
  stack: StackGroupInput[]
  socials: SocialInput[]
}

const CONFIG_KEYS = new Set([
  'id', 'brandMark', 'brandName', 'seoTitle', 'seoDescription',
  'heroEyebrow', 'heroLine1', 'heroLine2Em', 'heroLine2Text',
  'heroLine3Pre', 'heroLine3Em', 'heroLede', 'heroPrimaryBtn', 'heroSecondaryBtn',
  'workSectionIndex', 'workSectionTitle', 'workSectionSub',
  'aboutSectionIndex', 'aboutSectionTitle', 'aboutLede', 'aboutPara1', 'aboutPara2',
  'stackSectionIndex', 'stackSectionTitle', 'stackSectionSub',
  'contactEyebrow', 'contactEmail', 'contactSub',
  'footerName', 'footerMeta',
])

export async function PUT(req: Request) {
  const body = (await req.json()) as Body

  await db.$transaction(async (tx) => {
    // --- SiteConfig (singleton) ---
    const configKeys = Object.keys(body.config ?? {})
    if (configKeys.length > 0) {
      const updateData: Record<string, string> = {}
      for (const k of configKeys) {
        if (CONFIG_KEYS.has(k)) updateData[k] = String(body.config[k] ?? '')
      }
      await tx.siteConfig.upsert({
        where: { id: 'singleton' },
        update: updateData,
        create: { id: 'singleton', ...updateData },
      })
    }

    // --- Marquee ---
    await tx.marqueeItem.deleteMany({})
    for (const m of body.marquee ?? []) {
      await tx.marqueeItem.create({ data: { text: m.text, order: m.order } })
    }

    // --- Projects ---
    await tx.projectTech.deleteMany({})
    await tx.project.deleteMany({})
    for (const p of body.projects ?? []) {
      await tx.project.create({
        data: {
          tag: p.tag,
          year: p.year,
          title: p.title,
          description: p.description,
          liveUrl: p.liveUrl,
          order: p.order,
          techs: {
            create: p.techs.map((t) => ({ name: t.name, order: t.order })),
          },
        },
      })
    }

    // --- Stats ---
    await tx.stat.deleteMany({})
    for (const s of body.stats ?? []) {
      await tx.stat.create({
        data: { count: s.count, suffix: s.suffix, label: s.label, order: s.order },
      })
    }

    // --- Stack ---
    await tx.stackItem.deleteMany({})
    await tx.stackGroup.deleteMany({})
    for (const g of body.stack ?? []) {
      await tx.stackGroup.create({
        data: {
          title: g.title,
          order: g.order,
          items: {
            create: g.items.map((i) => ({ name: i.name, order: i.order })),
          },
        },
      })
    }

    // --- Socials ---
    await tx.social.deleteMany({})
    for (const s of body.socials ?? []) {
      await tx.social.create({
        data: { label: s.label, url: s.url, order: s.order },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
