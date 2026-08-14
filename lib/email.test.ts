import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The invite email must carry three facts: who added you, what you may do, and
 * how to get in. It ships through Resend — the same transport as the sign-in
 * OTP, and the one path proven to deliver in production — rather than the
 * backend's SendGrid helpers.
 */

const send = vi.fn()

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))
vi.mock('@/lib/env', () => ({
  env: { RESEND_API_KEY: 'test-key', FROM_EMAIL: 'no-reply@signalor.ai' },
}))
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}))

const { sendTeamInviteEmail } = await import('./email')

describe('sendTeamInviteEmail', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ id: 'sent' })
  })

  it('names the inviter in the subject and both bodies', async () => {
    expect(await sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'member')).toBe(true)
    const [payload] = send.mock.calls[0]
    expect(payload.to).toBe('mate@acme.com')
    expect(payload.subject).toContain('owner@acme.com')
    expect(payload.text).toContain('owner@acme.com')
    expect(payload.html).toContain('owner@acme.com')
  })

  it('gives every recipient a way in', async () => {
    await sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'member')
    const [payload] = send.mock.calls[0]
    expect(payload.text).toContain('/dashboard')
    expect(payload.html).toContain('/dashboard')
  })

  it('describes the role that was actually granted', async () => {
    await sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'admin')
    expect(send.mock.calls[0][0].text).toContain('manage brand settings')

    send.mockClear()
    await sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'member')
    expect(send.mock.calls[0][0].text).toContain('assigned to you')
  })

  it('falls back to member wording for an unknown role', async () => {
    await sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'wizard')
    expect(send.mock.calls[0][0].text).toContain('assigned to you')
  })

  // The membership is already committed server-side when this runs, so a
  // throwing send would surface as a failed invite the admin retries into a 409.
  it('reports failure instead of throwing when Resend errors', async () => {
    send.mockRejectedValue(new Error('resend down'))
    await expect(sendTeamInviteEmail('mate@acme.com', 'owner@acme.com', 'member')).resolves.toBe(
      false,
    )
  })
})
