// Seed script — populates the SQLite DB with the default content
// scraped from My-Portfolio-main/index.html
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database…')

  // 1. SiteConfig singleton
  const existing = await db.siteConfig.findUnique({ where: { id: 'singleton' } })
  if (!existing) {
    await db.siteConfig.create({ data: { id: 'singleton' } })
    console.log('✓ SiteConfig created')
  } else {
    console.log('• SiteConfig already exists, skipping')
  }

  // 2. Marquee items
  const marqueeCount = await db.marqueeItem.count()
  if (marqueeCount === 0) {
    const marqueeTexts = [
      'Machine Learning',
      'Predictive Modeling',
      'Data Science',
      'Backend APIs',
      'EDA',
    ]
    for (let i = 0; i < marqueeTexts.length; i++) {
      await db.marqueeItem.create({
        data: { text: marqueeTexts[i], order: i },
      })
    }
    console.log(`✓ ${marqueeTexts.length} marquee items created`)
  }

  // 3. Projects
  const projectCount = await db.project.count()
  if (projectCount === 0) {
    const projects = [
      {
        tag: 'Classification',
        year: '2026',
        title: 'Freight Cost Flagging',
        description:
          'Applying targeted algorithms like XGBoost for invoice checking, designed to solve practical metrics.',
        liveUrl: 'https://invoice-flagging.vercel.app/',
        techs: ['XGBoost', 'Pandas', 'FastAPI'],
      },
      {
        tag: 'Regression',
        year: '2026',
        title: 'FWI Fire Prediction',
        description:
          'Linear regressions for Fire Weather Index (FWI) predictions, deployed seamlessly as inference pipelines.',
        liveUrl: 'https://fwi-prediction-seven.vercel.app/',
        techs: ['Scikit-learn', 'Flask', 'EDA'],
      },
    ]
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i]
      await db.project.create({
        data: {
          tag: p.tag,
          year: p.year,
          title: p.title,
          description: p.description,
          liveUrl: p.liveUrl,
          order: i,
          techs: {
            create: p.techs.map((name, idx) => ({ name, order: idx })),
          },
        },
      })
    }
    console.log(`✓ ${projects.length} projects created`)
  }

  // 4. Stats
  const statCount = await db.stat.count()
  if (statCount === 0) {
    const stats = [
      { count: 12, suffix: '+', label: 'Tech Stack Tools' },
      { count: 2, suffix: '', label: 'Key Domains' },
      { count: 100, suffix: '%', label: 'Data Readiness' },
      { count: 24, suffix: '/7', label: 'Available for work' },
    ]
    for (let i = 0; i < stats.length; i++) {
      await db.stat.create({
        data: { ...stats[i], order: i },
      })
    }
    console.log(`✓ ${stats.length} stats created`)
  }

  // 5. Stack groups
  const stackGroupCount = await db.stackGroup.count()
  if (stackGroupCount === 0) {
    const groups = [
      { title: 'Languages & Data', items: ['Python', 'SQL', 'JavaScript', 'Pandas', 'NumPy'] },
      { title: 'Machine Learning', items: ['Scikit-learn', 'XGBoost', 'Regression', 'Classification', 'EDA'] },
      { title: 'Backend & API', items: ['FastAPI', 'Flask', 'REST APIs', 'Backend', 'Deployment'] },
      { title: 'Tools & UI', items: ['Docker', 'Git', 'Streamlit', 'Tailwind', 'Matplotlib'] },
    ]
    for (let i = 0; i < groups.length; i++) {
      await db.stackGroup.create({
        data: {
          title: groups[i].title,
          order: i,
          items: {
            create: groups[i].items.map((name, idx) => ({ name, order: idx })),
          },
        },
      })
    }
    console.log(`✓ ${groups.length} stack groups created`)
  }

  // 6. Socials
  const socialCount = await db.social.count()
  if (socialCount === 0) {
    const socials = [
      { label: 'GitHub', url: 'https://github.com/Biki989' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/biki-kalita-1b9807394' },
      { label: 'Resume', url: '/Biki-1.2.pdf' },
    ]
    for (let i = 0; i < socials.length; i++) {
      await db.social.create({
        data: { ...socials[i], order: i },
      })
    }
    console.log(`✓ ${socials.length} socials created`)
  }

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
