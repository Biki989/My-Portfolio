# Project Worklog — Portfolio CRM

This is the shared multi-agent worklog for the Portfolio CRM build.
All agents append (never overwrite) to this file.

---
Task ID: 1
Agent: main (Super Z)
Task: Build a complete CRM tool for the user's portfolio (My-Portfolio-main.zip) so they can edit every piece of content and export back to HTML.

Work Log:
- Extracted the uploaded portfolio zip and analyzed index.html, style.css, README.md and portfolio_info.md.
- Catalogued every editable surface: hero (3 title lines + lede + 2 buttons), marquee strip, projects (CRUD with tech-stack chips), about (lede + 2 paragraphs + 4 stats), stack (4 groups with items), contact (eyebrow + email + sub + socials), branding/SEO, footer.
- Replaced the default Prisma schema with portfolio models: SiteConfig (singleton), Project + ProjectTech, Stat, StackGroup + StackItem, Social, MarqueeItem.
- Ran `bun run db:push` and seeded the database with the original portfolio content via scripts/seed.ts.
- Built API routes:
  - GET /api/portfolio — returns the full document in one request.
  - PUT /api/portfolio — atomically replaces the full document inside a transaction.
  - GET /api/export-html — generates a standalone index.html that drops into the user's static portfolio repo (same structure as the original index.html, just with the user-edited content).
- Built the CRM UI:
  - Top bar: dirty/clean badge, Revert, Export HTML, Save buttons.
  - Left sidebar: 7 nav items (Hero, Marquee, Projects, About, Stack, Contact, Branding & SEO).
  - Middle editor panel: one editor file per section, all wired to a single Zustand store (src/lib/portfolio-store.ts) that mutates in-memory state; the live preview reflects edits instantly.
  - Right preview panel: an iframe rendering the actual portfolio with the original style.css injected; desktop/mobile width toggle; show/hide toggle.
- Persisted all generation scripts under /home/z/my-project/scripts/ (seed.ts, gen-preview-css.ts).
- Verified end-to-end with Agent Browser:
  - CRM loads with seeded Biki Kalita data.
  - All 7 editor sections render and are interactive.
  - Typing in any field updates the live preview immediately.
  - Save persists to SQLite; reload shows the saved data.
  - Revert discards local edits.
  - Export HTML endpoint returns a valid 9.8KB standalone index.html.
  - Lint passes with no errors.

Stage Summary:
- Deliverable: a working Portfolio CRM at / (Next.js 16, port 3000).
- Database: SQLite at db/custom.db, fully seeded with Biki's current portfolio.
- Export: GET /api/export-html produces a downloadable index.html that matches the original template structure 1:1.
- Files created: prisma/schema.prisma (rewritten), scripts/seed.ts, scripts/gen-preview-css.ts, src/lib/portfolio-types.ts, src/lib/portfolio-store.ts, src/lib/preview-css.ts, src/app/api/portfolio/route.ts, src/app/api/export-html/route.ts, src/components/crm/{crm-dashboard,live-preview,hero-editor,marquee-editor,projects-editor,about-editor,stack-editor,contact-editor,branding-editor}.tsx, src/app/page.tsx (rewritten).
