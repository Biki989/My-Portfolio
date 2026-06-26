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

---
Task ID: 2
Agent: main (Super Z)
Task: Restructure into two sites (public portfolio + auth-gated CRM), add all original animations to both the public portfolio and the CRM live preview, and ensure CRM edits propagate to the live portfolio.

Work Log:
- Read the original app.js to catalog every animation: Three.js 3D hero scene (6 floating glassy shapes + 220-particle field + pointer parallax), scroll-reveal (IntersectionObserver), scroll progress bar, nav scrolled state, magnetic buttons ([data-magnetic]), tilt cards (.tilt with pointer-tracked glow), animated stat counters (easeOutCubic), custom cursor.
- Installed three and jose (for JWT) via bun.
- Added auth library src/lib/auth.ts: jose-based JWT in an httpOnly cookie, 7-day TTL, constant-time credential check against env vars (CRM_ADMIN_USERNAME, CRM_ADMIN_PASSWORD, CRM_SESSION_SECRET).
- Wrote .env with default credentials (username: biki, password: BikiPortfolio2026!) and a 32-hex-char session secret.
- Added three auth API routes:
  - POST /api/auth/login — verifies creds, sets httpOnly cookie
  - POST /api/auth/logout — clears cookie
  - GET  /api/auth/me — returns {authenticated, username, credentialsConfigured}
- Gated the write endpoints behind the session cookie:
  - PUT /api/portfolio → 401 if not logged in
  - GET /api/export-html → 401 if not logged in
  - GET /api/portfolio remains public (CRM needs to read; visitors don't but no harm)
- Built PortfolioView component (src/components/portfolio/portfolio-view.tsx) — a faithful React port of the original index.html + app.js. Boots Three.js scene, scroll reveal, scroll progress, magnetic, tilt, stat counters, custom cursor. Reads content from props (server-fetched from DB).
- Built CrmLogin component (src/components/crm/crm-login.tsx) — clean centered login card with username/password, toast feedback, "Back to portfolio" link.
- Upgraded the CRM live preview iframe to include ALL original animations (Three.js, reveal, scroll, magnetic, tilt, counters, cursor, marquee). The boot JS is inlined as PREVIEW_BOOT_JS in live-preview.tsx.
- Updated CrmDashboard: now accepts {username, dataSeed} props; hydrates the Zustand store from server-rendered data (no loading flash); top bar shows the signed-in username, a "View portfolio" link (opens / in a new tab), and a Sign out button.
- Added `hydrate` action to the portfolio Zustand store for server-side data injection.
- Rewrote src/app/page.tsx as a server component that:
  - exports `generateMetadata` so the public portfolio's <title> and <meta description> come from the DB
  - branches on `?admin` query param: public portfolio (default) vs CRM login/dashboard
  - reads the session cookie server-side; only renders CrmDashboard if authenticated, otherwise CrmLogin
- Cleaned up layout.tsx: removed bg-background from body so the portfolio's own CSS background shows; updated default metadata.

Verification (Agent Browser, end-to-end):
- / loads the public portfolio with all 27 reveal elements, animated 3D hero canvas, marquee animation, scroll progress bar, nav scrolled state, stat counters (12, 2, 100, 24), custom cursor.
- /?admin without a session → CrmLogin page with username/password form.
- Wrong credentials → stays on login page (no redirect).
- Correct credentials (biki / BikiPortfolio2026!) → CRM dashboard loads with all editors populated, live preview iframe runs the Three.js scene.
- Edited hero eyebrow in CRM, hit Save → "Saved to database" toast, "All changes saved" badge.
- Opened / in a new tab → the edited eyebrow text is visible on the public portfolio. Propagation confirmed end-to-end.
- Click Sign out → returns to CrmLogin page.
- curl PUT /api/portfolio without cookie → 401 Unauthorized.
- curl GET /api/export-html without cookie → 401 Unauthorized.
- Lint clean. No runtime errors in dev log.

Stage Summary:
- Two sites now live in one Next.js app:
  - / = public portfolio with all original animations (Three.js 3D hero, scroll reveal, scroll progress, magnetic, tilt, stat counters, custom cursor, marquee).
  - /?admin = password-gated CRM. Default creds: biki / BikiPortfolio2026! (change in .env).
- CRM edits propagate to the public portfolio on the next page load (same SQLite DB).
- All write APIs (PUT /api/portfolio, GET /api/export-html) are auth-gated; the public GET endpoint remains open.
