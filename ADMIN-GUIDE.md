# Portfolio CRM — Admin Guide

This guide explains how to log in, change your password, and lock down your
portfolio + CRM after deploying to Vercel.

---

## 1. Where everything lives

| URL | Who can visit | What it does |
|-----|---------------|--------------|
| `/` | Anyone | Public portfolio with all animations. Reads content from the database. |
| `/?admin` | Only you (password required) | CRM editor. Saves changes to the database, which the public portfolio reads from. |
| `/api/portfolio` (GET) | Anyone | Returns the portfolio content as JSON (used by crawlers and the CRM). |
| `/api/portfolio` (PUT) | Authenticated only | Saves CRM edits. |
| `/api/export-html` (GET) | Authenticated only | Downloads a standalone `index.html` for your static repo. |
| `/api/auth/login` | Anyone | Verifies credentials, sets session cookie. |
| `/api/auth/logout` | Authenticated | Clears session cookie. |
| `/api/auth/change-password` | Authenticated | Changes your password. |
| `/sitemap.xml` | Anyone | Dynamic sitemap for SEO. |
| `/robots.txt` | Anyone | Crawl rules for SEO. |
| `/manifest.json` | Anyone | PWA manifest. |

---

## 2. Logging in for the first time

After deploying to Vercel:

1. Visit `https://YOUR-VERCEL-DOMAIN.vercel.app/?admin`
2. Sign in with the credentials from your env vars:
   - **Username:** `biki` (or whatever you set as `CRM_ADMIN_USERNAME`)
   - **Password:** `BikiPortfolio2026!` (or whatever you set as `CRM_ADMIN_PASSWORD`)

On the very first successful login, the system **copies these credentials
into the database as a scrypt hash**. After that, the database is the source
of truth — changing the env vars will NOT change your password (see §3).

---

## 3. How to change your password (3 ways)

### ✅ Way 1 (recommended): from inside the CRM

1. Sign in at `/?admin`
2. Click **Security** in the sidebar
3. Enter your current password + new password + confirm
4. Click **Update password**

Done. Takes effect immediately. You stay signed in (your existing session
cookie is still valid until it expires or you sign out).

The new password must be at least 10 characters with at least one letter and
one number.

### Way 2: via Vercel env vars (only works if the DB admin row is deleted)

Use this if you forgot your password and can't sign in.

1. Open your project on Vercel → **Settings → Environment Variables**
2. Update `CRM_ADMIN_PASSWORD` to your new password
3. **Delete the `AdminUser` row** in your database (so the next login
   re-seeds from env). On Vercel, run this from your local machine:

   ```bash
   # Install the Prisma CLI if you don't have it
   npx prisma studio
   # ...or, with direct DB access:
   sqlite3 db/custom.db "DELETE FROM AdminUser WHERE id='singleton';"
   ```

   If you're using Vercel Postgres instead of SQLite, run:
   ```sql
   DELETE FROM "AdminUser" WHERE id = 'singleton';
   ```

4. Trigger a redeploy (Vercel → Deployments → Redeploy)
5. Sign in with the new password

### Way 3: direct database edit (advanced)

If you have direct DB access (e.g., via `prisma studio`):

1. Generate a new scrypt hash for your desired password:

   ```bash
   node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const h=c.scryptSync('YOUR_NEW_PASSWORD',s,64).toString('hex');console.log(s+':'+h)"
   ```

2. Update the `AdminUser` row:

   ```sql
   UPDATE AdminUser SET passwordHash = 'salt:hash_from_step_1' WHERE id = 'singleton';
   ```

3. Sign in with the new password.

---

## 4. Security features already in place

### Authentication
- ✅ Passwords stored as **scrypt hashes** (per-user salt, 64-byte key length)
  in the database — never in plaintext, never in `.env` after first run.
- ✅ **Rate limiting**: max 5 failed login attempts per IP per 15 minutes.
  After the limit, the API returns `429 Too Many Requests` with a `Retry-After`
  header. Successful login clears the IP's failure history.
- ✅ **Session cookie**: `httpOnly` (no JS access), `SameSite=Strict` (blocks
  CSRF via cross-site requests), `Secure` in production (HTTPS only), 7-day TTL,
  signed with `CRM_SESSION_SECRET` (HS256 JWT).
- ✅ **Constant-time password comparison** (`crypto.timingSafeEqual`) to prevent
  timing attacks.

### Authorization
- ✅ All write endpoints (`PUT /api/portfolio`, `GET /api/export-html`,
  `POST /api/auth/change-password`) check the session cookie and return `401`
  if missing/invalid.
- ✅ Public read endpoints (`GET /api/portfolio`, `/`) are open — that's how
  the portfolio renders for visitors and how search crawlers see your content.

### HTTP security headers (applied to every response, including static assets)
- ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  (forces HTTPS for 2 years)
- ✅ `Content-Security-Policy` — only allows scripts from `self` and
  `cdnjs.cloudflare.com` (for Three.js); styles from `self` and
  `fonts.googleapis.com`; fonts from `fonts.gstatic.com`; blocks everything
  else.
- ✅ `X-Frame-Options: DENY` — nobody can iframe your site (clickjacking
  protection).
- ✅ `X-Content-Type-Options: nosniff` — browsers can't MIME-sniff.
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- ✅ `Cross-Origin-Opener-Policy: same-origin`

### Network
- ✅ Cookies require HTTPS in production (`Secure` flag).
- ✅ All API routes are server-side — no secrets ever reach the browser.

---

## 5. SEO optimizations included

- ✅ **Keyword-rich `<title>`**: "Biki Kalita — ML Engineer & Software Engineer |
  Machine Learning, Data Science"
- ✅ **Meta description** with target keywords: ML Engineer, Software Engineer,
  Machine Learning, Data Science, predictive modeling, ML APIs.
- ✅ **40+ meta keywords** covering role, skills, stack, and domain terms.
- ✅ **Open Graph tags** (`og:title`, `og:description`, `og:type=profile`,
  `og:image`, `og:url`) — controls how your link looks on Facebook/LinkedIn/Slack.
- ✅ **Twitter Card tags** — controls how your link looks on Twitter/X.
- ✅ **JSON-LD structured data** (`Person`, `WebSite`, `ProfilePage` schemas) —
  lets Google render a rich knowledge card when someone searches your name.
- ✅ **`sitemap.xml`** (dynamic, generated at `/sitemap.xml`) — tells Google
  which pages to index.
- ✅ **`robots.txt`** — allows crawling of the portfolio, blocks `/api/`.
- ✅ **`manifest.json`** — PWA-ready, lets users "Add to home screen".
- ✅ **Canonical URL** to prevent duplicate-content penalties.
- ✅ **Semantic HTML** (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`)
  with proper heading hierarchy (one `<h1>`, multiple `<h2>` per section).
- ✅ **Resume PDF** served from `/Biki-1.2.pdf` with caching headers — Google
  can index it and associate it with your name.

---

## 6. After deploying to Vercel — checklist

1. **Set env vars** in Vercel → Project Settings → Environment Variables:
   - `CRM_ADMIN_USERNAME` = `biki` (or whatever you want)
   - `CRM_ADMIN_PASSWORD` = a strong password (at least 10 chars, 1 letter + 1 digit)
   - `CRM_SESSION_SECRET` = 32+ random hex chars (run `openssl rand -hex 32`)
   - `SITE_URL` = `https://YOUR-VERCEL-DOMAIN.vercel.app` (for absolute URLs in
     sitemap, OG tags, JSON-LD)

2. **Delete the AdminUser row** in the database if you've already seeded locally
   (so Vercel re-seeds from the new env vars on first login).

3. **Submit your sitemap to Google Search Console**:
   - Add your site at https://search.google.com/search-console
   - Verify ownership (Vercel DNS makes this easy)
   - Submit `https://YOUR-VERCEL-DOMAIN.vercel.app/sitemap.xml`

4. **Test your security headers** at https://securityheaders.com — you should
   get an A or A+.

5. **Test your SEO** at https://search.google.com/test/rich-results — paste
   your URL and confirm the Person schema is detected.

6. **Change your password** via the CRM → Security → Change password (Way 1
   above). This makes the env var no longer authoritative — only the DB hash
   is used going forward.

---

## 7. Quick reference

| What | Where |
|------|-------|
| Public portfolio | `/` |
| CRM login | `/?admin` |
| CRM dashboard (after login) | `/?admin` |
| Change password | `/?admin` → Security → Change password |
| Default username | `biki` (from `CRM_ADMIN_USERNAME`) |
| Default password | `BikiPortfolio2026!` (from `CRM_ADMIN_PASSWORD`) — **change this immediately** |
| Session cookie name | `crm_session` |
| Session TTL | 7 days |
| Rate limit | 5 failed attempts / 15 min / IP |
| Password hashing | scrypt, 64-byte key, 16-byte salt |
| JWT algorithm | HS256 |
