import { NextResponse } from 'next/server'
import { createSessionCookie, verifyCredentials, SESSION_COOKIE_NAME } from '@/lib/auth'

// Extract the client's real IP. On Vercel this comes from `x-forwarded-for`;
// in local dev it falls back to `x-real-ip` or the socket address.
function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()
  return 'unknown'
}

export async function POST(req: Request) {
  let body: { username?: string; password?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const username = (body.username ?? '').trim()
  const password = body.password ?? ''
  const ip = getClientIp(req)

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const result = await verifyCredentials(username, password, ip)

  if (!result.ok) {
    if (result.reason === 'rate_limited') {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${Math.ceil((result.retryAfterSeconds ?? 900) / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfterSeconds ?? 900) },
        },
      )
    }
    // Constant-ish delay to slow down brute-force attempts.
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const cookie = await createSessionCookie(result.username)
  const res = NextResponse.json({ ok: true, username: result.username })
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: cookie.value,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: cookie.maxAge,
  })
  return res
}
