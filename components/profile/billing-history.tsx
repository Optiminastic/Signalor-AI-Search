import { formatDate, formatMoney } from '@/lib/format'
import { Download } from '@/lib/icons'
import type { AccountInvoice } from '@/services/account.service'

import { SectionCard } from './section-card'
import { SectionEmpty, SectionUnavailable } from './section-state'

function InvoiceRow({ invoice }: { invoice: AccountInvoice }): JSX.Element {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[var(--cat-ink)]">{formatDate(invoice.date)}</p>
        <p className="text-xs text-[var(--cat-ink-3)]">{invoice.id}</p>
      </div>
      <span className="rounded-full bg-[#047857]/10 px-2 py-0.5 text-[11px] font-medium text-[#047857] capitalize">
        {invoice.status}
      </span>
      <span className="w-16 text-right text-[13px] font-medium text-[var(--cat-ink)] tabular-nums">
        {formatMoney(invoice.amount, invoice.currency)}
      </span>
      <button
        type="button"
        aria-label="Download invoice"
        className="rounded-md p-1.5 text-[var(--cat-ink-3)] transition hover:bg-[var(--cat-hover)] hover:text-[var(--cat-ink)]"
      >
        <Download className="h-4 w-4" />
      </button>
    </li>
  )
}

/** Past invoices with download actions. */
export function BillingHistory({
  invoices,
  unavailable = false,
}: {
  invoices: AccountInvoice[]
  unavailable?: boolean
}): JSX.Element {
  if (unavailable || invoices.length === 0) {
    return (
      <SectionCard title="Billing history" description="Download your past invoices.">
        {unavailable ? (
          <SectionUnavailable what="billing history" />
        ) : (
          <SectionEmpty message="No invoices yet. They appear here after your first payment." />
        )}
      </SectionCard>
    )
  }
  return (
    <SectionCard title="Billing history" description="Download your past invoices." flush>
      <ul className="divide-y divide-[var(--cat-border-soft)]">
        {invoices.map(inv => (
          <InvoiceRow key={inv.id} invoice={inv} />
        ))}
      </ul>
    </SectionCard>
  )
}
