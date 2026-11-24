'use client'

import { useState } from 'react'

import { Check, Copy } from '@/lib/icons'

interface Segment {
  type: 'step' | 'text' | 'code' | 'bullet'
  text: string
}

/** Split the backend's free-text action guide into renderable segments:
 *  "STEP n" headings, code/markup lines (grouped into one block), bullets, prose. */
function parseGuide(action: string): Segment[] {
  const segments: Segment[] = []
  for (const raw of action.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const isCode = /^</.test(line) || /^\s{2,}/.test(raw)
    const prev = segments[segments.length - 1]
    if (/^step\s*\d+/i.test(line)) segments.push({ type: 'step', text: line })
    else if (isCode && prev?.type === 'code') prev.text += `\n${raw.trimEnd()}`
    else if (isCode) segments.push({ type: 'code', text: raw.trimEnd() })
    else if (/^[-•*]\s/.test(line)) segments.push({ type: 'bullet', text: line.slice(2) })
    else segments.push({ type: 'text', text: line })
  }
  return segments
}

function StepHeading({ text }: { text: string }): JSX.Element {
  const match = text.match(/^step\s*(\d+)\s*[—–-]?\s*(.*)$/i)
  return (
    <p className="mt-3 flex items-center gap-2 first:mt-0">
      <span className="text-primary-ink grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[rgba(224,74,61,0.1)] text-[11px] font-bold tabular-nums">
        {match?.[1] ?? '•'}
      </span>
      <span className="text-[13px] font-semibold text-[var(--cat-ink)]">{match?.[2] || text}</span>
    </p>
  )
}

function CodeBlock({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  const copy = (): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-[var(--cat-border)] bg-[var(--cat-content)] p-3 pr-10 font-mono text-[11.5px] leading-relaxed whitespace-pre text-[var(--cat-ink-2)]">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        title="Copy snippet"
        className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        {copied ? <Check size={13} className="text-[#2FBE7E]" /> : <Copy size={13} />}
      </button>
    </div>
  )
}

function SegmentBlock({ segment }: { segment: Segment }): JSX.Element {
  if (segment.type === 'step') return <StepHeading text={segment.text} />
  if (segment.type === 'code') return <CodeBlock text={segment.text} />
  if (segment.type === 'bullet') {
    return (
      <p className="flex gap-2 pl-1 text-[13px] leading-relaxed text-[var(--cat-ink-2)]">
        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#e04a3d]" />
        {segment.text}
      </p>
    )
  }
  return <p className="text-[13px] leading-relaxed text-[var(--cat-ink-2)]">{segment.text}</p>
}

/** Step-by-step "how to fix it" content (rendered inside a TaskSection accordion),
 *  parsed from the source recommendation's free-text action guide. */
export function TaskFixGuideBody({ guide }: { guide: string }): JSX.Element {
  const segments = parseGuide(guide)
  return (
    <div className="flex flex-col gap-2">
      {segments.map((segment, i) => (
        <SegmentBlock key={i} segment={segment} />
      ))}
    </div>
  )
}
