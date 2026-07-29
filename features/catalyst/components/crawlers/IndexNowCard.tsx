'use client'

import { Card } from '@/features/catalyst/components/Card'
import { CardHead } from '@/features/catalyst/components/CardHead'
import { PrimaryButton } from '@/features/catalyst/components/PrimaryButton'
import { GREEN, NEG } from '@/features/catalyst/constants'
import { useIndexNow } from '@/hooks/useGeoIntel'
import type { IndexNowResult, IndexNowSetup } from '@/lib/api/prompts'
import { Loader2, Zap } from '@/lib/icons'

function Setup({ setup }: { setup: IndexNowSetup }): JSX.Element {
  return (
    <div className="mt-2 rounded-sm border border-dashed border-[var(--cat-border)] p-2">
      <p className="text-[11px] font-semibold text-[var(--cat-ink-2)]">
        One-time setup — host this file
      </p>
      <p className="mt-1 text-[11px] break-all text-[var(--cat-ink-3)]">{setup.key_file_url}</p>
      <p className="mt-1 text-[11px] text-[var(--cat-ink-3)]">
        It must return this text and nothing else:
      </p>
      <pre className="mt-1 overflow-auto rounded-sm bg-[var(--cat-hover)] p-1.5 text-[11px] text-[var(--cat-ink-2)]">
        {setup.key_file_contents}
      </pre>
    </div>
  )
}

interface BodyProps {
  setup: IndexNowSetup
  verified: boolean
  submit: () => void
  result: IndexNowResult | undefined
  isSubmitting: boolean
}

function Body({ setup, verified, submit, result, isSubmitting }: BodyProps): JSX.Element {
  let outcome = ''
  if (result) {
    outcome = result.ok ? `${result.submitted} URLs accepted. ${result.message}` : result.message
  }

  return (
    <>
      <p className="mt-2 text-[12px]" style={{ color: verified ? GREEN : NEG }}>
        {verified ? 'Key file verified — ready to submit.' : setup.message}
      </p>
      {!verified && <Setup setup={setup} />}
      <div className="mt-2">
        <PrimaryButton
          icon={isSubmitting ? Loader2 : Zap}
          disabled={isSubmitting || !verified}
          onClick={submit}
        >
          {isSubmitting ? 'Submitting…' : 'Submit pages'}
        </PrimaryButton>
      </div>
      {outcome && <p className="mt-2 text-[12px] text-[var(--cat-ink-2)]">{outcome}</p>}
    </>
  )
}

/**
 * Push changed pages into Bing's index.
 *
 * Every other feature optimises what an engine finds once it looks. This gets it
 * to look: ChatGPT's live search reads Bing, and Bing cannot answer from a page
 * it has not indexed. One submission also reaches Yandex, Seznam and Naver.
 *
 * Submitting is never presented as indexing — a successful call means the engine
 * accepted the request, nothing more.
 */
export function IndexNowCard({ slug }: { slug: string | undefined }): JSX.Element {
  const { setup, isLoading, submit, result, isSubmitting } = useIndexNow(slug)
  const verified = Boolean(setup?.verified)

  return (
    <Card>
      <CardHead title="Bing / IndexNow" />
      <p className="text-[12px] leading-relaxed text-[var(--cat-ink-2)]">
        {setup?.why || 'Push changed pages to Bing, which is the index ChatGPT search reads.'}
      </p>

      {isLoading && (
        <p className="mt-2 text-[12px] text-[var(--cat-ink-3)]">Checking your key file…</p>
      )}

      {setup?.configured && (
        <Body
          setup={setup}
          verified={verified}
          submit={submit}
          result={result}
          isSubmitting={isSubmitting}
        />
      )}
    </Card>
  )
}
