'use client'

import { FileText } from '@/features/site/components/icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/site/components/ui/card'
import type { InvoiceItem } from '@/features/site/lib/api/payments'
import { cn } from '@/features/site/lib/utils'
import { formatDate, formatMoney } from '@/lib/format'

interface BillingInvoicesCardProps {
  invoices: InvoiceItem[] | undefined
  loading: boolean
}

function invoiceAmount(inv: InvoiceItem): string {
  if (inv.amount == null) return '—'
  return formatMoney(inv.amount, (inv.currency || 'gbp').toUpperCase())
}

export function BillingInvoicesCard({ invoices, loading }: BillingInvoicesCardProps): JSX.Element {
  return (
    <Card className="glass-card border-border/70">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="text-primary h-4 w-4" />
          <CardTitle>Invoices</CardTitle>
        </div>
        <CardDescription>Your payment history.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading invoices…</p>
        ) : !invoices || invoices.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invoices yet.</p>
        ) : (
          <ul className="divide-border/60 divide-y">
            {invoices.map(inv => (
              <li key={inv.payment_id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {inv.created_at ? formatDate(inv.created_at) : 'Pending'}
                  </p>
                  <p className="text-muted-foreground truncate text-[11px]">{inv.payment_id}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                      inv.status === 'succeeded'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {inv.status ?? 'unknown'}
                  </span>
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {invoiceAmount(inv)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
