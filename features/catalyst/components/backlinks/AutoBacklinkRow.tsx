import { Chip } from '@/components/base/badges/chip'
import { autoStatusStyle, formatPublished } from '@/features/catalyst/backlinks-data'
import type { AutoBacklink } from '@/lib/api/backlinks'
import { ExternalLink, GripVertical, MoreHorizontal } from '@/lib/icons'

interface AutoBacklinkRowProps {
  row: AutoBacklink
}

/** A single auto-backlink row — matches the Tasks table row chrome. */
export function AutoBacklinkRow({ row }: AutoBacklinkRowProps): JSX.Element {
  const status = autoStatusStyle(row)

  return (
    <tr className="border-t border-[var(--cat-border-soft)] transition-colors hover:bg-[var(--cat-hover)]">
      <TitleCell row={row} />
      <td className="px-3 py-2.5">
        <Chip variant="caption" color={status.color}>
          {status.label}
        </Chip>
      </td>
      <td className="max-w-[180px] px-3 py-2.5">
        {row.brand_url ? (
          <a
            href={row.brand_url}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)] hover:underline"
          >
            {hostOf(row.brand_url)}
          </a>
        ) : (
          <span className="block truncate text-[var(--cat-ink-3)]">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap text-[var(--cat-ink-2)]">
        {formatPublished(row.published_at)}
      </td>
      <LinkCell url={row.url} />
      <td className="px-3 py-2.5 text-right">
        <button
          type="button"
          aria-label="Row actions"
          className="grid h-7 w-7 place-items-center rounded-md text-[var(--cat-ink-3)] transition-colors hover:bg-[var(--cat-border-soft)] hover:text-[var(--cat-ink)]"
        >
          <MoreHorizontal size={16} />
        </button>
      </td>
    </tr>
  )
}

function TitleCell({ row }: { row: AutoBacklink }): JSX.Element {
  return (
    <td className="py-2.5 pr-3 pl-2">
      <span className="flex items-center gap-1.5">
        <GripVertical size={14} className="shrink-0 text-[var(--cat-ink-3)]" />
        <span className="h-[15px] w-[15px] shrink-0 rounded-sm border border-[var(--cat-border)]" />
        <span className="min-w-0">
          <span className="block max-w-[320px] truncate font-semibold text-[var(--cat-ink)]">
            {row.title || row.slug || 'Untitled'}
          </span>
          {row.slug && (
            <span className="block max-w-[320px] truncate text-[12px] text-[var(--cat-ink-3)]">
              /{row.slug}
            </span>
          )}
        </span>
      </span>
    </td>
  )
}

function LinkCell({ url }: { url: string }): JSX.Element {
  return (
    <td className="px-3 py-2.5">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--cat-ink-2)] transition-colors hover:text-[var(--cat-ink)]"
        >
          <ExternalLink size={13} />
          Visit
        </a>
      ) : (
        <span className="text-[12px] text-[var(--cat-ink-3)]">—</span>
      )}
    </td>
  )
}

function hostOf(url: string): string {
  if (!url) return ''
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '')
  }
}
