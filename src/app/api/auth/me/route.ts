import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCredentials, verifySession, SESSION_COOKIE_NAME } from '@/lib/auth'

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
    // Help the UI show whether the env credentials are still set so the
    // user knows where to look if login suddenly fails after an env change.
    credentialsConfigured: Boolean(
      process.env.CRM_ADMIN_USERNAME && process.env.CRM_ADMIN_PASSWORD,
    ),
  })
}

// Also export a helper for server components to call directly.
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(jwt)
  return Boolean(session)
}

// Re-export so server components can import everything from one place.
export { verifyCredentials }
