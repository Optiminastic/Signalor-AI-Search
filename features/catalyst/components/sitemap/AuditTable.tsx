import { AuditRow } from '@/features/catalyst/components/sitemap/AuditRow'
import type { AuditRow as Row } from '@/features/catalyst/sitemap-data'

const COLS = [
  'URL',
  'Status',
  'Content',
  'LCP',
  'FCP',
  'TTFB',
  'Server',
  'Resources',
  'Links',
  'AI',
  '',
  'Crawled',
]

export function AuditTable({ rows }: { rows: Row[] }): JSX.Element {
  return (
    <div className="cat-rise cat-card-edge overflow-hidden rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--cat-border)] bg-[var(--cat-hover)]">
              {COLS.map((col, i) => (
                <th
                  key={col || `col-${i}`}
                  className={`py-2.5 text-[11px] font-semibold tracking-wide text-[var(--cat-ink-3)] uppercase ${i === 0 ? 'pr-3 pl-3' : 'px-3'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <AuditRow key={row.path} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
