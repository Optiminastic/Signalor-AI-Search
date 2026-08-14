import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { sendTeamInviteEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface InviteBody {
  to?: unknown
  role?: unknown
}

/**
 * Mail a teammate that they have been added to the caller's team.
 *
 * Session-gated, and the inviter's name is taken from that session rather than
 * the request body. Without both, this is an open relay: anyone could POST an
 * arbitrary recipient and an arbitrary "X added you to their team" line, which
 * is a convincing phishing template signed with our own domain. (The sibling
 * `/api/email/welcome` route does exactly that and should be closed too.)
 *
 * Delivery goes through Resend, the same transport as the sign-in OTP, because
 * that is the path known to be delivering mail in production today.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: req.headers })
  const inviter = session?.user?.email
  if (!inviter) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let body: InviteBody
  try {
    body = (await req.json()) as InviteBody
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : ''
  const role = body.role === 'admin' ? 'admin' : 'member'
  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: 'A valid teammate email is required.' }, { status: 400 })
  }

  const sent = await sendTeamInviteEmail(to, inviter, role)
  if (!sent) {
    // 202, not 5xx: the membership this announces is already committed on the
    // backend, so the caller must not retry the invite itself over a mail fault.
    logger.warn({ to }, 'Team invite email not delivered')
    return NextResponse.json({ sent: false }, { status: 202 })
  }
  return NextResponse.json({ sent: true })
}
