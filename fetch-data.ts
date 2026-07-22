import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const db = new PrismaClient({ adapter })

async function main() {
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

  const data = {
    config: config ?? {},
    marquee,
    projects,
    stats,
    stack,
    socials,
  }

  console.log(JSON.stringify(data, null, 2))
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
