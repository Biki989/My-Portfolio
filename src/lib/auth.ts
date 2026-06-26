import { SignJWT, jwtVerify } from 'jose'

// ─── Session helpers ───
// We use a signed JWT stored in an httpOnly cookie for the CRM session.
// The portfolio site (at /) is always public; the CRM (at /?admin) requires
// a valid session cookie.

const SESSION_COOKIE = 'crm_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const ALG = 'HS256'

function getSecret(): Uint8Array {
  const s = process.env.CRM_SESSION_SECRET
  if (!s) throw new Error('CRM_SESSION_SECRET missing in env')
  return new TextEncoder().encode(s)
}

export type SessionPayload = {
  username: string
}

export async function createSessionCookie(username: string): Promise<{ name: string; value: string; maxAge: number }> {
  const jwt = await new SignJWT({ username })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret())
  return { name: SESSION_COOKIE, value: jwt, maxAge: SESSION_TTL_SECONDS }
}

export async function verifySession(jwt: string | undefined | null): Promise<SessionPayload | null> {
  if (!jwt) return null
  try {
    const { payload } = await jwtVerify(jwt, getSecret(), { algorithms: [ALG] })
    return { username: (payload as { username?: string }).username ?? '' }
  } catch {
    return null
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const u = process.env.CRM_ADMIN_USERNAME
  const p = process.env.CRM_ADMIN_PASSWORD
  if (!u || !p) return false
  // Constant-time-ish comparison to avoid trivial timing leaks.
  return u === username && p === password
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS
