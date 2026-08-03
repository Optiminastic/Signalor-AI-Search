/** Format an ISO date as e.g. "Aug 3, 2026" (fixed locale to avoid SSR drift). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Format an ISO date as e.g. "3 Aug" for dense table cells. Em-dash when
 *  absent or unparseable, so a bad value never renders "Invalid Date". */
export function formatShortDate(iso: string): string {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '\u2014'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

/** Format a money amount, e.g. formatMoney(79, 'USD') → "$79". */
export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}
