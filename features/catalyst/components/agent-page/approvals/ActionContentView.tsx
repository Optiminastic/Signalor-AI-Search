import {
  MUTED_TEXT,
  PANEL,
  SECTION_TITLE,
} from '@/features/catalyst/components/agent-page/approvals/approval-styles'
import type { ActionContent, ArticleContent, EmailContent } from '@/lib/api/agent-mode-approvals'

interface ActionContentViewProps {
  content: ActionContent | null
}

interface FieldProps {
  label: string
  value: string
}

const BODY =
  'mt-1 max-h-[320px] overflow-y-auto rounded-md border border-[var(--cat-border)] bg-[var(--cat-content)] p-3 font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-[var(--cat-ink)]'

function Field({ label, value }: FieldProps): JSX.Element {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 text-[12.5px]">
      <dt className="text-[var(--cat-ink-3)]">{label}</dt>
      <dd className="min-w-0 break-words text-[var(--cat-ink)]">{value || '(empty)'}</dd>
    </div>
  )
}

function EmailDraft({ email }: { email: EmailContent }): JSX.Element {
  return (
    <>
      <dl className="flex flex-col gap-1.5">
        <Field label="From" value={email.sender || 'Your connected mailbox'} />
        <Field label="To" value={`A published contact at ${email.recipientDomain}`} />
        <Field label="Subject" value={email.subject} />
      </dl>
      <p className={`mt-3 ${SECTION_TITLE}`}>Email body, exactly as it will be sent</p>
      <pre className={BODY}>{email.body}</pre>
    </>
  )
}

function ArticleDraft({ article }: { article: ArticleContent }): JSX.Element {
  return (
    <>
      <dl className="flex flex-col gap-1.5">
        <Field label="Publish to" value={article.platform} />
        <Field label="Title" value={article.title} />
        <Field label="URL slug" value={article.slug} />
        <Field label="Description" value={article.metaDescription} />
      </dl>
      <p className={`mt-3 ${SECTION_TITLE}`}>Article, exactly as it will be published</p>
      <pre className={BODY}>{article.markdown}</pre>
    </>
  )
}

/**
 * The exact stored draft, shown as raw text so nothing is reformatted between
 * what the owner reads and what is sent. A draft that can't be shown can't be
 * approved, and says so.
 */
export function ActionContentView({ content }: ActionContentViewProps): JSX.Element {
  return (
    <section aria-label="Draft" className={`${PANEL} p-3`}>
      {content === null && (
        <p className={MUTED_TEXT}>
          This draft can&apos;t be displayed here, so it can&apos;t be approved from this screen.
        </p>
      )}
      {content?.type === 'email' && <EmailDraft email={content} />}
      {content?.type === 'article' && <ArticleDraft article={content} />}
    </section>
  )
}
