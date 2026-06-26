import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Security headers middleware ───
// Applied to every response. On Vercel these are also served at the edge
// before the request hits the origin, so they protect every route including
// static assets.

// Content-Security-Policy:
// - 'self' for everything by default
// - scripts may load from cdnjs.cloudflare.com (Three.js) and use inline (next.js needs it)
// - styles may load from fonts.googleapis.com and use inline
// - fonts may load from fonts.gstatic.com
// - images: self + data: (for inline SVGs in CSS) + https: (for any external)
// - frame-ancestors 'none' → no one can iframe this site (clickjacking protection)
//   NOTE: the CRM's *internal* live-preview iframe is srcDoc (same-origin),
//   which is unaffected by frame-ancestors.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

export function middleware(_req: NextRequest) {
  const res = NextResponse.next()

  // HSTS: force HTTPS for 2 years, include subdomains, opt into browser preload list.
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // Prevent MIME-type sniffing.
  res.headers.set('X-Content-Type-Options', 'nosniff')
  // Prevent clickjacking — nobody can iframe us.
  res.headers.set('X-Frame-Options', 'DENY')
  // Referrer policy: send origin only on same-origin; send just the origin cross-origin.
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Lock down browser features we don't use.
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  // CSP — the big one.
  res.headers.set('Content-Security-Policy', CSP)
  // Don't allow the browser to attach downloaded files to the site's origin.
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  // Cross-origin isolation headers (helps with Spectre-class attacks).
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return res
}

export const config = {
  // Run on every route (including static assets served from /public).
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
