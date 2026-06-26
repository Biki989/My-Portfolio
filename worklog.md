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

---
Task ID: 3
Agent: main (Super Z)
Task: Add resume, SEO-optimize for "software engineer / machine learning" searches, add security protocols so only Biki can log in, and document how to change the password.

Work Log:
- Copied the resume PDF to /home/z/my-project/public/Biki-1.2.pdf so the existing /Biki-1.2.pdf link in the contact section works.
- Added two Prisma models for auth: AdminUser (singleton row with scrypt-hashed password) and LoginAttempt (tracks failed attempts per IP for rate limiting). Pushed schema to DB.
- Rewrote src/lib/auth.ts:
  - scrypt password hashing (16-byte salt, 64-byte key, timingSafeEqual comparison)
  - ensureAdminSeeded() — copies .env credentials into DB on first login
  - verifyCredentials(username, password, ip) — enforces 5-attempts-per-15-min rate limit
  - changePassword(current, next) — validates current password, enforces min-10-char + letter + digit policy
- Updated /api/auth/login route: extracts real IP from x-forwarded-for, returns 429 with Retry-After header when rate-limited, sets SameSite=Strict cookie.
- Added /api/auth/change-password route (auth-gated, requires current password).
- Cleaned up /api/auth/me route (removed broken re-export).
- Added src/middleware.ts with comprehensive security headers:
  - HSTS (2 years, includeSubDomains, preload)
  - Content-Security-Policy (allows only self + cdnjs.cloudflare.com for Three.js + Google Fonts)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy (camera, microphone, geolocation, payment all disabled)
  - Cross-Origin-Opener-Policy: same-origin
- Added vercel.json with security headers (backup) + static asset caching for PDF and images.
- Added public/robots.txt (allows crawling, blocks /api/, points to sitemap).
- Added src/app/sitemap.ts (dynamic sitemap with portfolio URL + project anchors + resume PDF).
- Added public/manifest.json (PWA-ready).
- Copied icon.svg and apple-icon.png to /public.
- Updated src/app/layout.tsx with comprehensive SEO metadata:
  - 40+ keywords covering ML Engineer, Software Engineer, Machine Learning, Data Science, etc.
  - Open Graph profile tags
  - Twitter Card tags
  - Robots directives (index, follow, max-image-preview:large)
  - Viewport with theme color
  - Manifest link
- Updated src/app/page.tsx:
  - generateMetadata() uses DB-stored SEO title/description
  - Injects 3 JSON-LD structured data blocks (Person, WebSite, ProfilePage) for rich Google results
- Added "Security" section to the CRM with:
  - Account security overview card (shows username, storage method, rate limit, session, headers)
  - Change password form (current + new + confirm, with show/hide toggles, password policy enforcement)
  - Forgot password card with recovery instructions
- Updated .env with SITE_URL placeholder and clearer comments.
- Wrote ADMIN-GUIDE.md documenting: site map, 3 ways to change password (CRM UI / Vercel env vars / direct DB edit), all security features, SEO optimizations, post-deploy checklist, and quick reference table.

Verification (Agent Browser + curl, end-to-end):
- Resume PDF: curl /Biki-1.2.pdf → 200, 308525 bytes, application/pdf
- Security headers: curl -I / → all 7 headers present (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy)
- JSON-LD: curl / → 3 blocks detected (Person, WebSite, ProfilePage)
- Sitemap: curl /sitemap.xml → valid XML with portfolio URL, project anchors, resume PDF
- Robots.txt: served correctly
- Meta tags: description, 40+ keywords, OG tags, Twitter Card tags all present
- Rate limiting: 5 wrong attempts → 401; 6th attempt → 429 with Retry-After: 900
- Login with correct creds → CRM dashboard loads
- Change password from CRM UI → "Password changed" toast
- Sign out → old password rejected → new password accepted
- Changed password back to original via CRM UI
- Lint clean. No runtime errors.

Stage Summary:
- Resume: served at /Biki-1.2.pdf, linked from the contact section.
- SEO: keyword-rich title, meta description, 40+ keywords, OG/Twitter cards, JSON-LD Person+WebSite+ProfilePage, sitemap.xml, robots.txt, manifest.json.
- Security: scrypt-hashed passwords in DB (not env), 5-attempt/15-min rate limiting with 429+Retry-After, httpOnly+SameSite=Strict+Secure cookies, 7 security headers via middleware AND vercel.json, all write APIs auth-gated.
- Password change: 3 documented ways — CRM UI (recommended), Vercel env vars (if forgot password), direct DB edit (advanced).
- ADMIN-GUIDE.md has the full post-deploy checklist including Google Search Console submission.
