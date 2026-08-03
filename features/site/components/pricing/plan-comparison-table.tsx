'use client'

import { Check } from '@/features/site/components/icons'
import type { CellValue, ComparisonSection } from '@/features/site/lib/pricing-comparison'
import { cn } from '@/features/site/lib/utils'

interface Column {
  id: string
  label: string
  /** Formatted price for the sticky header, e.g. "₹2,543 /mo" or "Custom". */
  price: string
}

interface PlanComparisonTableProps {
  columns: Column[]
  sections: ComparisonSection[]
  /** Highlighted column — the popular plan, matched to the card above. */
  featuredId?: string
}

/** A tick, an em dash, or a literal value. */
function Cell({ value }: { value: CellValue }): JSX.Element {
  if (value === true) {
    return (
      <>
        <Check className="text-primary mx-auto h-4 w-4" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <span className="text-muted-foreground/50" aria-hidden>
          –
        </span>
        <span className="sr-only">Not included</span>
      </>
    )
  }
  return <span className="text-foreground text-[13px]">{value}</span>
}

/**
 * The side-by-side plan comparison.
 *
 * The cards above answer "which one do I buy"; this answers "what exactly am I
 * getting", which is the question that actually closes a considered purchase.
 * A `false` renders as an em dash rather than being omitted — a missing row
 * reads as an oversight, an explicit dash reads as a decision.
 */
export function PlanComparisonTable({
  columns,
  sections,
  featuredId,
}: PlanComparisonTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">
          Feature comparison across every SignalorAI plan
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border-border w-[34%] border-b px-4 py-4 align-bottom">
              <span className="text-foreground text-[15px] font-semibold">Compare plans</span>
            </th>
            {columns.map(col => (
              <th
                key={col.id}
                scope="col"
                className={cn(
                  'border-border border-b px-4 py-4 text-center align-bottom',
                  col.id === featuredId && 'bg-primary/[0.04]',
                )}
              >
                <span className="text-foreground block text-[13px] font-semibold">{col.label}</span>
                <span className="text-muted-foreground block text-[12px] tabular-nums">
                  {col.price}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {sections.map(section => (
          <tbody key={section.title}>
            <tr>
              <th
                scope="colgroup"
                colSpan={columns.length + 1}
                className="bg-muted text-foreground border-border border-y px-4 py-2.5 text-left text-[12px] font-semibold tracking-wide uppercase"
              >
                {section.title}
              </th>
            </tr>
            {section.rows.map(row => (
              <tr key={row.label} className="border-border/60 border-b last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <span className="text-foreground text-[13px]">{row.label}</span>
                  {row.hint ? (
                    <span className="text-muted-foreground block text-[11px] leading-snug">
                      {row.hint}
                    </span>
                  ) : null}
                </th>
                {columns.map(col => (
                  <td
                    key={col.id}
                    className={cn(
                      'px-4 py-3 text-center',
                      // Tint only the value cells, and only inside a section —
                      // applied to every cell it ran past the final row and read
                      // as a rendering artifact rather than emphasis.
                      col.id === featuredId && 'bg-primary/[0.03]',
                    )}
                  >
                    <Cell value={row.values[col.id] ?? false} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
