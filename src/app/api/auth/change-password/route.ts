import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  changePassword,
  verifySession,
  SESSION_COOKIE_NAME,
} from '@/lib/auth'

export async function POST(req: Request) {
  // ─── Auth gate ───
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySession(jwt)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const currentPassword = body.currentPassword ?? ''
  const newPassword = body.newPassword ?? ''

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'Current password and new password are required.' },
      { status: 400 },
    )
  }

  const result = await changePassword(currentPassword, newPassword)

  if (!result.ok) {
    if (result.reason === 'wrong_current_password') {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 },
      )
    }
    if (result.reason === 'weak_password') {
      return NextResponse.json(
        {
          error:
            'New password must be at least 10 characters and contain at least one letter and one number.',
        },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Could not change password.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
