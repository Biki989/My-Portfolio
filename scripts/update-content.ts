// Update the portfolio content to remove AI-sounding copy and replace
// with authentic, specific, personal text.
// Run with: bun run /home/z/my-project/scripts/update-content.ts

import { db } from '../src/lib/db'

async function main() {
  console.log('✏️  Updating portfolio content…')

  // ─── SiteConfig: replace generic AI copy with authentic text ───
  await db.siteConfig.update({
    where: { id: 'singleton' },
    data: {
      // Hero — remove "Available for select work" (AI cliché) and buzzword title
      heroEyebrow: 'ML Engineer · Assam, India',
      heroLine1: 'I build',
      heroLine2Em: 'machine learning',
      heroLine2Text: 'systems',
      heroLine3Pre: 'that ship to',
      heroLine3Em: 'production.',
      heroLede: "I'm <strong>Biki Kalita</strong> — I turn messy datasets into deployed models and inference APIs. XGBoost, scikit-learn, FastAPI, Docker. End to end.",
      heroPrimaryBtn: 'See my work',
      heroSecondaryBtn: 'Get in touch',

      // Work section — less generic title
      workSectionIndex: '01',
      workSectionTitle: 'Projects',
      workSectionSub: 'Two things I have actually shipped — not tutorial demos.',

      // About — remove "I believe in building practical, production-ready…" (AI cliché)
      aboutSectionIndex: '02',
      aboutSectionTitle: 'About',
      aboutLede: 'Most ML projects die in the notebook. Mine do not.',
      aboutPara1: 'I focus on the boring parts that make models usable: cleaning data, handling class imbalance with SMOTE, picking the right features, and validating honestly. No vanity metrics.',
      aboutPara2: 'Then I wrap the model in a FastAPI or Flask endpoint, containerize it with Docker, and deploy. The goal is an inference API someone can actually call — not a Jupyter cell that runs on my laptop.',

      // Stack — remove "I'm language-agnostic and opinion-curious" (pure AI-speak)
      stackSectionIndex: '03',
      stackSectionTitle: 'Stack',
      stackSectionSub: 'What I reach for when I need to get something done.',

      // Contact — remove "Let's build something" (AI cliché)
      contactEyebrow: 'Open to work',
      contactEmail: 'bikikalitaxtra@gmail.com',
      contactSub: 'Looking for ML engineering or data science roles. Remote or on-site in India.',

      // Footer — remove "Designed & built from scratch · No frameworks" (AI bragging)
      footerName: 'Biki Kalita',
      footerMeta: 'Built with Next.js',
    },
  })
  console.log('✓ SiteConfig updated')

  // ─── Stats: replace fake-sounding ones with real ones ───
  // Remove "100% Data Readiness" (meaningless) and "24/7 Available" (no one is)
  // Replace with concrete, honest numbers.
  await db.stat.deleteMany({})
  const stats = [
    { count: 2, suffix: '', label: 'Projects shipped' },
    { count: 6, suffix: '+', label: 'Months of ML experience' },
    { count: 15, suffix: '+', label: 'Tools I use' },
    { count: 1, suffix: '', label: 'Goal: ship real ML' },
  ]
  for (let i = 0; i < stats.length; i++) {
    await db.stat.create({ data: { ...stats[i], order: i } })
  }
  console.log('✓ Stats updated (removed fake ones)')

  // ─── Projects: make descriptions more specific and less buzzword-y ───
  const projects = await db.project.findMany({ orderBy: { order: 'asc' } })

  if (projects[0]) {
    // Freight Cost Flagging
    await db.project.update({
      where: { id: projects[0].id },
      data: {
        tag: 'Classification',
        year: '2026',
        title: 'Freight Invoice Flagging',
        description: 'XGBoost model that flags suspicious freight invoices before payment. Cuts manual review time by catching the likely-bad ones first. Deployed as a FastAPI endpoint.',
      },
    })
  }

  if (projects[1]) {
    // FWI Fire Prediction
    await db.project.update({
      where: { id: projects[1].id },
      data: {
        tag: 'Regression',
        year: '2026',
        title: 'Fire Weather Index Prediction',
        description: 'Linear regression model that predicts FWI from weather conditions (temp, humidity, rain, wind). Trained on Algerian forest fire data. Deployed via Flask.',
      },
    })
  }
  console.log('✓ Project descriptions updated')

  // ─── Marquee: remove buzzword salad, use concrete skills ───
  await db.marqueeItem.deleteMany({})
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
    await db.marqueeItem.create({ data: { text: marqueeTexts[i], order: i } })
  }
  console.log('✓ Marquee updated')

  console.log('✅ Done. Content is now authentic and specific.')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
