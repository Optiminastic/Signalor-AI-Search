import { formatWhen } from '@/features/catalyst/agent-approvals'
import { NEG } from '@/features/catalyst/constants'
import type { SendAttempts } from '@/lib/api/agent-mode-approvals'

interface SendAttemptsNoteProps {
  attempts: SendAttempts
}

/** Says when sending keeps failing: when it will be tried again, or that it stopped. */
export function SendAttemptsNote({ attempts }: SendAttemptsNoteProps): JSX.Element | null {
  if (attempts.blocked) {
    return (
      <p role="alert" className="text-[12px] font-medium" style={{ color: NEG }}>
        Sending stopped after {attempts.failures} failed tries in a row. Nothing was sent. It
        won&apos;t be tried again until Signalor support unblocks it.
      </p>
    )
  }
  if (attempts.failures > 0) {
    const when = attempts.retryAfter ? ` after ${formatWhen(attempts.retryAfter)}` : ''
    return (
      <p className="text-[12px] text-[var(--cat-ink-2)]">
        {attempts.failures === 1
          ? 'The last try to send this failed before anything went out.'
          : `The last ${attempts.failures} tries failed before anything went out.`}{' '}
        It will be tried again{when}.
      </p>
    )
  }
  return null
}
