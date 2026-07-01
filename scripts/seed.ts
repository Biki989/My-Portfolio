// Seed script — populates the SQLite DB with the default content
// scraped from My-Portfolio-main/index.html
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { db } from '../src/lib/db'
import { ensureAdminSeeded } from '../src/lib/auth'

async function main() {
  console.log('🌱 Seeding database…')

  // 0. AdminUser (singleton) — password hash seeded from .env on first run.
  await ensureAdminSeeded()
  console.log('✓ Admin user present')

  // 1. SiteConfig singleton
  const existing = await db.siteConfig.findUnique({ where: { id: 'singleton' } })
  if (!existing) {
    await db.siteConfig.create({
      data: {
        id: 'singleton',
        heroEyebrow: 'ML Engineer · Assam, India',
        heroLine1: 'I build',
        heroLine2Em: 'machine learning',
        heroLine2Text: 'systems',
        heroLine3Pre: 'that ship to',
        heroLine3Em: 'production.',
        heroLede: "I'm <strong>Biki Kalita</strong> — I turn messy datasets into deployed models and inference APIs. XGBoost, scikit-learn, FastAPI, Docker. End to end.",
        heroPrimaryBtn: 'See my work',
        heroSecondaryBtn: 'Get in touch',
        workSectionTitle: 'Projects',
        workSectionSub: 'Two things I have actually shipped — not tutorial demos.',
        aboutLede: 'Most ML projects die in the notebook. Mine do not.',
        aboutPara1: 'I focus on the boring parts that make models usable: cleaning data, handling class imbalance with SMOTE, picking the right features, and validating honestly. No vanity metrics.',
        aboutPara2: 'Then I wrap the model in a FastAPI or Flask endpoint, containerize it with Docker, and deploy. The goal is an inference API someone can actually call — not a Jupyter cell that runs on my laptop.',
        stackSectionTitle: 'Stack',
        stackSectionSub: 'What I reach for when I need to get something done.',
        contactEyebrow: 'Open to work',
        contactSub: 'Looking for ML engineering or data science roles. Remote or on-site in India.',
        seoTitle: 'Biki Kalita — ML Engineer',
        seoDescription: 'ML engineer based in Assam, India. I build and deploy machine learning systems — XGBoost, scikit-learn, FastAPI, Docker. Open to work.',
        footerMeta: 'Built with Next.js',
      },
    })
    console.log('✓ SiteConfig created')
  } else {
    console.log('• SiteConfig already exists, skipping')
  }

  // 2. Marquee items
  const marqueeCount = await db.marqueeItem.count()
  if (marqueeCount === 0) {
    const marqueeTexts = [
      'Python',
      'XGBoost',
      'Scikit-learn',
      'FastAPI',
      'Docker',
      'Pandas',
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
        title: 'Freight Invoice Flagging',
        description:
          'XGBoost model that flags suspicious freight invoices before payment. Cuts manual review time by catching the likely-bad ones first. Deployed as a FastAPI endpoint.',
        liveUrl: 'https://invoice-flagging.vercel.app/',
        techs: ['XGBoost', 'Pandas', 'FastAPI'],
      },
      {
        tag: 'Regression',
        year: '2026',
        title: 'Fire Weather Index Prediction',
        description:
          'Linear regression model that predicts FWI from weather conditions (temp, humidity, rain, wind). Trained on Algerian forest fire data. Deployed via Flask.',
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
      { count: 2, suffix: '', label: 'Projects shipped' },
      { count: 6, suffix: '+', label: 'Months of ML experience' },
      { count: 15, suffix: '+', label: 'Tools I use' },
      { count: 1, suffix: '', label: 'Goal: ship real ML' },
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
