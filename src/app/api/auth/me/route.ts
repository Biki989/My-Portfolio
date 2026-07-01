import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(jwt)
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({
    authenticated: true,
    username: session.username,
  })
}
