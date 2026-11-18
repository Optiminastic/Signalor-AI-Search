'use client'

import { useState } from 'react'

import { EditField } from '@/features/catalyst/components/agent-page/approvals/EditField'
import type { ArticleContent } from '@/lib/api/agent-mode-approvals'

interface ArticleEditFormProps {
  article: ArticleContent
  /** Called whenever a field changes, with the full set of edited fields. */
  onFields: (fields: Record<string, string>) => void
}

type FieldName = 'title' | 'meta_description' | 'slug' | 'answer'

interface FieldSpec {
  name: FieldName
  label: string
  /** Limits match the backend's edit rules. */
  maxLength: number
  rows?: number
  hint?: string
}

const FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', maxLength: 150 },
  { name: 'meta_description', label: 'Meta description', maxLength: 160 },
  {
    name: 'slug',
    label: 'URL slug',
    maxLength: 80,
    hint: 'Lowercase letters, digits and single hyphens.',
  },
  { name: 'answer', label: 'Opening answer', maxLength: 1000, rows: 4 },
]

function initialFields(article: ArticleContent): Record<FieldName, string> {
  return {
    title: article.title,
    meta_description: article.metaDescription,
    slug: article.slug,
    answer: article.answer ?? '',
  }
}

/** Title, description, slug and opening answer. Sections and FAQ stay as drafted. */
export function ArticleEditForm({ article, onFields }: ArticleEditFormProps): JSX.Element {
  const [fields, setFields] = useState(() => initialFields(article))
  const update = (name: FieldName, value: string): void => {
    const next = { ...fields, [name]: value }
    setFields(next)
    onFields(next)
  }
  return (
    <div className="flex flex-col gap-3">
      {FIELDS.map(spec => (
        <EditField
          key={spec.name}
          label={spec.label}
          value={fields[spec.name]}
          maxLength={spec.maxLength}
          rows={spec.rows}
          hint={spec.hint}
          onChange={value => update(spec.name, value)}
        />
      ))}
      <p className="text-[11.5px] text-[var(--cat-ink-3)]">
        The article&apos;s sections and FAQ can&apos;t be edited here yet.
      </p>
    </div>
  )
}
