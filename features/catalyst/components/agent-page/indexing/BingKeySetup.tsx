import { SECONDARY_BUTTON } from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { BingKeyCheck, BingState } from '@/lib/api/agent-mode-indexing'

interface BingKeySetupProps {
  bing: BingState
  keyCheck: BingKeyCheck | null
  verifying: boolean
  onVerify: () => void
}

const CODE =
  'rounded bg-[var(--cat-hover)] px-1.5 py-0.5 font-mono text-[11.5px] break-all text-[var(--cat-ink)]'

/** One-time setup: the site hosts a small key file so Bing trusts submissions for it. */
export function BingKeySetup({
  bing,
  keyCheck,
  verifying,
  onVerify,
}: BingKeySetupProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-[var(--cat-hover)]/50 p-3 text-[12px] text-[var(--cat-ink-2)]">
      <p className="font-medium text-[var(--cat-ink)]">
        One-time setup: add a key file to your site
      </p>
      <p>
        Create <span className={CODE}>{bing.keyFileUrl || `/${bing.key}.txt`}</span> containing only{' '}
        <span className={CODE}>{bing.key}</span>
      </p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={verifying} onClick={onVerify} className={SECONDARY_BUTTON}>
          {verifying ? 'Checking…' : 'Check key file'}
        </button>
        {keyCheck && (
          <span role="status" className={keyCheck.verified ? 'text-emerald-700' : 'text-[#e04a3d]'}>
            {keyCheck.verified ? 'Key file found. Bing will accept your pages.' : keyCheck.message}
          </span>
        )}
      </div>
    </div>
  )
}
