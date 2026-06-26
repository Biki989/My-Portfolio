import { NextResponse } from 'next/server'
import { createSessionCookie, verifyCredentials, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  let body: { username?: string; password?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const username = (body.username ?? '').trim()
  const password = body.password ?? ''

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  if (!verifyCredentials(username, password)) {
    // Small delay to slow down brute-force attempts.
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  const cookie = await createSessionCookie(username)
  const res = NextResponse.json({ ok: true, username })
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: cookie.value,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: cookie.maxAge,
  })
  return res
}
