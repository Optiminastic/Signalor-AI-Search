import { Fragment } from 'react'

/**
 * Minimal, safe formatting for agent replies and drafts: "## " headings,
 * **bold** and "- " bullets. Builds React elements (never raw HTML), so model
 * output cannot inject markup.
 */
const BOLD = /(\*\*[^*]+\*\*)/g
const BULLET = /^\s*[-*]\s+/
const HEADING = /^#{2,3}\s+/
// The backend's Markdown renderer escapes special characters (e.g. "\*"); show them plainly.
const ESCAPED = /\\([\\`*_{}[\]<>#|])/g

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }

interface AgentRichTextProps {
  text: string
}

function inline(text: string): JSX.Element[] {
  return text.split(BOLD).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-semibold text-[var(--cat-ink)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function toBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const raw of text.split('\n')) {
    const last = blocks[blocks.length - 1]
    if (HEADING.test(raw)) {
      blocks.push({ kind: 'h', text: raw.replace(HEADING, '').replace(ESCAPED, '$1') })
    } else if (BULLET.test(raw)) {
      const item = raw.replace(BULLET, '').replace(ESCAPED, '$1')
      if (last?.kind === 'ul') last.items.push(item)
      else blocks.push({ kind: 'ul', items: [item] })
    } else if (raw.trim()) {
      blocks.push({ kind: 'p', text: raw.trim().replace(ESCAPED, '$1') })
    }
  }
  return blocks
}

function renderBlock(block: Block, key: number): JSX.Element {
  if (block.kind === 'h') {
    return (
      <p key={key} className="pt-1 font-semibold text-[var(--cat-ink)]">
        {inline(block.text)}
      </p>
    )
  }
  if (block.kind === 'p') return <p key={key}>{inline(block.text)}</p>
  return (
    <ul key={key} className="list-disc space-y-1 pl-5">
      {block.items.map((item, i) => (
        <li key={i}>{inline(item)}</li>
      ))}
    </ul>
  )
}

export function AgentRichText({ text }: AgentRichTextProps): JSX.Element {
  return <div className="space-y-2">{toBlocks(text).map(renderBlock)}</div>
}
