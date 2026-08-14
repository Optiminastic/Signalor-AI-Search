import { Resend } from 'resend'

import { env } from '@/lib/env'
import { createLogger } from '@/lib/logger'

const log = createLogger('email')

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

/**
 * Send a one-time-code email via Resend.
 * Falls back to logging the code in development when Resend isn't configured.
 */
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const from = env.FROM_EMAIL

  if (!resend || !from) {
    log.info({ to, otp }, 'Email OTP (Resend not configured — dev log)')
    return
  }

  try {
    await resend.emails.send({
      from: `SignalorAI <${from}>`,
      to,
      subject: 'Your SignalorAI verification code',
      text: `Your SignalorAI verification code is ${otp}. It expires in 10 minutes.`,
    })
  } catch (error) {
    log.error({ error }, 'Resend send failed')
    throw new Error('Failed to send verification email.')
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://signalor.ai'

/** What each role may do, in the invitee's terms rather than the schema's. */
const ROLE_LINE: Record<string, string> = {
  admin: 'You can manage brand settings, integrations and team members.',
  member: 'You can view reports and work through actions assigned to you.',
}

function inviteHtml(invitedBy: string, roleLine: string): string {
  const dashboardUrl = `${SITE_URL}/dashboard`
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560"
      style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;">
      <tr><td style="padding:32px 36px;">
        <h1 style="margin:0;font-size:20px;line-height:1.3;color:#111;">You now have access to SignalorAI</h1>
        <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#444;">
          <strong>${invitedBy}</strong> added you to their SignalorAI team.
        </p>
        <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#444;">${roleLine}</p>
        <p style="margin:24px 0 0;">
          <a href="${dashboardUrl}"
             style="display:inline-block;background:#e04a3d;color:#ffffff;text-decoration:none;
                    font-size:15px;font-weight:600;padding:12px 24px;border-radius:6px;">Open SignalorAI</a>
        </p>
        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#777;">
          Sign in with this email address and their brands appear in your brand switcher.
          If you weren't expecting this, you can ignore this email.
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}

/**
 * Send the post-first-analysis welcome email.
 *
 * Was its own SendGrid POST inside the route handler; the caller still owns the
 * (long, table-based) HTML, this owns delivery. Returns false rather than
 * throwing so the route can answer 502 without a stack trace.
 */
export async function sendWelcomeEmail(to: string, html: string): Promise<boolean> {
  const from = env.FROM_EMAIL
  if (!resend || !from) {
    log.info({ to }, 'Welcome email (Resend not configured — dev log)')
    return false
  }
  try {
    await resend.emails.send({
      from: `SignalorAI <${from}>`,
      to,
      subject: 'Welcome to SignalorAI, your AI visibility report is ready',
      html,
    })
    return true
  } catch (error) {
    log.error({ error, to }, 'Welcome email failed')
    return false
  }
}

/**
 * Tell someone they have been added to a team.
 *
 * Goes through Resend, the same transport as the OTP above — the one path in
 * this codebase that is demonstrably delivering mail today. The backend's invite
 * endpoint sends nothing at all, so before this an invitee only learned they had
 * access if the admin told them by hand.
 *
 * Never throws: the membership is already committed server-side by the time this
 * runs, so a mail failure must not read back as a failed invite.
 */
export async function sendTeamInviteEmail(
  to: string,
  invitedBy: string,
  role: string,
): Promise<boolean> {
  const from = env.FROM_EMAIL
  const roleLine = ROLE_LINE[role] ?? ROLE_LINE.member

  if (!resend || !from) {
    log.info({ to, invitedBy, role }, 'Team invite email (Resend not configured — dev log)')
    return false
  }

  try {
    await resend.emails.send({
      from: `SignalorAI <${from}>`,
      to,
      subject: `${invitedBy} added you to their SignalorAI team`,
      text: `${invitedBy} added you to their SignalorAI team.\n\n${roleLine}\n\nSign in with this email address to get in:\n${SITE_URL}/dashboard\n\n— The SignalorAI Team`,
      html: inviteHtml(invitedBy, roleLine),
    })
    return true
  } catch (error) {
    log.error({ error, to }, 'Team invite email failed')
    return false
  }
}
