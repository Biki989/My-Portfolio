import { SignJWT, jwtVerify } from 'jose'
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'

// ─── Session helpers ───
// The portfolio site (at /) is always public; the CRM (at /?admin) requires
// a valid session cookie. Passwords are stored as scrypt hashes in the DB
// (NOT in .env — .env is only used for the initial seed).

const SESSION_COOKIE = 'crm_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
const ALG = 'HS256'

// Rate limiting: max 5 failed attempts per IP per 15-minute window.
const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

function getSecret(): Uint8Array {
  const s = process.env.CRM_SESSION_SECRET
  if (!s) throw new Error('CRM_SESSION_SECRET missing in env')
  return new TextEncoder().encode(s)
}

// ─── Password hashing (scrypt with per-user salt) ───
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const target = Buffer.from(hash, 'hex')
  // Use length-checked timingSafeEqual to avoid throwing on length mismatch.
  if (candidate.length !== target.length) return false
  return timingSafeEqual(candidate, target)
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

// ─── Seeding ───
// On first run, copy the username + password from .env into the DB so the
// user can change them later without touching env vars. After the first run,
// .env is no longer authoritative — the DB is.
export async function ensureAdminSeeded(): Promise<void> {
  const existing = await db.adminUser.findUnique({ where: { id: 'singleton' } })
  if (existing) return
  const username = process.env.CRM_ADMIN_USERNAME || 'admin'
  const password = process.env.CRM_ADMIN_PASSWORD || 'changeme'
  await db.adminUser.create({
    data: {
      id: 'singleton',
      username,
      passwordHash: hashPassword(password),
    },
  })
}

// ─── Credential verification (also enforces rate limit) ───
export type AuthResult =
  | { ok: true; username: string }
  | { ok: false; reason: 'invalid_credentials' | 'rate_limited'; retryAfterSeconds?: number }

export async function verifyCredentials(
  username: string,
  password: string,
  ip: string,
): Promise<AuthResult> {
  await ensureAdminSeeded()

  // ─── Rate limit check ───
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const recentFailures = await db.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: windowStart },
    },
  })
  if (recentFailures >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      ok: false,
      reason: 'rate_limited',
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    }
  }

  // ─── Verify against DB ───
  const admin = await db.adminUser.findUnique({ where: { id: 'singleton' } })
  const usernameMatches = admin?.username === username
  const passwordMatches = admin ? verifyPassword(password, admin.passwordHash) : false
  const success = usernameMatches && passwordMatches

  // Always record the attempt (success or failure) for rate-limit accounting.
  await db.loginAttempt.create({
    data: { ip, success },
  })

  if (!success) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  // On success, clear this IP's failure history so a fresh window starts.
  await db.loginAttempt.deleteMany({
    where: { ip, success: false },
  })

  return { ok: true, username: admin!.username }
}

// ─── Change password (auth-gated, requires current password) ───
export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: 'wrong_current_password' | 'weak_password' | 'no_admin' }

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const admin = await db.adminUser.findUnique({ where: { id: 'singleton' } })
  if (!admin) return { ok: false, reason: 'no_admin' }

  if (!verifyPassword(currentPassword, admin.passwordHash)) {
    return { ok: false, reason: 'wrong_current_password' }
  }

  // Password policy: min 10 chars, at least 1 letter and 1 digit.
  if (newPassword.length < 10 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { ok: false, reason: 'weak_password' }
  }

  await db.adminUser.update({
    where: { id: 'singleton' },
    data: { passwordHash: hashPassword(newPassword) },
  })

  return { ok: true }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS
