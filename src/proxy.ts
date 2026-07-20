import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Security headers middleware (nonce-based CSP, no 'unsafe-inline') ───
// Applied to every response. On Vercel these are also served at the edge
// before the request hits the origin, so they protect every route including
// static assets.

// Generate a cryptographically random nonce for each request.
// The nonce is base64url-safe (A-Za-z0-9) so it's valid in a CSP header.
function generateNonce(): string {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

// Content-Security-Policy template. The nonce placeholder is replaced
// per-request. Note: NO 'unsafe-inline' in script-src — all inline scripts
// must carry the nonce attribute (Next.js auto-applies it to its own
// inline scripts when the nonce is read via headers() in the root layout;
// we add it manually to JSON-LD blocks in page.tsx).
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: https:`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

export function proxy(req: NextRequest) {
  const nonce = generateNonce()

  // Pass the nonce to server components via a request header so layout.tsx
  // and page.tsx can read it with headers().get('x-nonce') and attach it
  // to inline <script> tags. Reading the header in the root layout also
  // tells Next.js to auto-apply the nonce to its own inline scripts
  // (hydration data, runtime config, etc.).
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ─── Security headers ───
  res.headers.set('Content-Security-Policy', buildCsp(nonce))
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  return res
}

export const config = {
  // Run on every route (including static assets served from /public),
  // but skip Next.js internal static/image routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
