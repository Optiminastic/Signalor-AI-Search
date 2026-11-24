import { env } from '@/lib/env'
import { createLogger } from '@/lib/logger'

const log = createLogger('email')

/**
 * Send a one-time-code email via SendGrid. Falls back to logging the code in
 * development when SendGrid isn't configured, so the flow stays testable.
 */
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const apiKey = env.SENDGRID_API_KEY
  const from = env.FROM_EMAIL
  if (!apiKey || !from) {
    log.info({ to, otp }, 'Email OTP (SendGrid not configured — dev log)')
    return
  }

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'Signalor' },
      subject: 'Your Signalor verification code',
      content: [
        {
          type: 'text/plain',
          value: `Your Signalor verification code is ${otp}. It expires in 10 minutes.`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    log.error({ status: res.status, body }, 'SendGrid send failed')
    // In development, don't block sign-in when the provider is down or out of
    // credits — log the code so the flow stays testable locally. Production
    // still throws so a failed verification email is never silently swallowed.
    if (env.NODE_ENV !== 'production') {
      log.warn({ to, otp }, 'Email OTP (SendGrid failed — dev fallback log)')
      return
    }
    throw new Error('Failed to send verification email.')
  }
}
