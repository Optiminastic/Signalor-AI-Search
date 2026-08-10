import Link from 'next/link'
import { Check, X } from '@/features/site/components/icons'

type ComparisonRow = {
  feature: string
  signalor: string | boolean
  ahrefs: string | boolean
  semrush: string | boolean
  mention: string | boolean
  meltwater: string | boolean
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'AI engines tracked',
    signalor: 'ChatGPT, Claude, Gemini, Perplexity, AI Overviews',
    ahrefs: 'Web-only',
    semrush: 'Web-only',
    mention: 'Web-only',
    meltwater: 'Web-only',
  },
  {
    feature: 'Prompt library',
    signalor: true,
    ahrefs: false,
    semrush: false,
    mention: false,
    meltwater: false,
  },
  {
    feature: 'GEO scoring',
    signalor: true,
    ahrefs: false,
    semrush: false,
    mention: false,
    meltwater: false,
  },
  {
    feature: 'Citation source breakdown',
    signalor: true,
    ahrefs: false,
    semrush: false,
    mention: false,
    meltwater: false,
  },
  {
    feature: 'Starting price',
    signalor: 'Free audit',
    ahrefs: '$99/mo',
    semrush: '$129.95/mo',
    mention: '$41/mo',
    meltwater: 'Custom',
  },
]

function CellValue({ value }: { value: string | boolean }): JSX.Element {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-success" strokeWidth={2.5} aria-label="Yes" />
    ) : (
      <X className="mx-auto h-5 w-5 text-muted-foreground/40" strokeWidth={2} aria-label="No" />
    )
  }
  return <span className="text-sm text-foreground">{value}</span>
}

export function PromptTrackingComparisonTable(): JSX.Element {
  return (
    <section
      id="comparison"
      className="scroll-mt-20 bg-background"
      aria-labelledby="comparison-heading"
    >
      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-12 lg:pb-20 lg:pt-16">
        <div className="mb-10">
          <h2
            id="comparison-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            How Signalor compares to brand monitoring tools
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            Traditional brand monitoring tools track web mentions. Signalor tracks AI-generated
            answers where 60% of search traffic now lands.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border border-black/10 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="bg-primary/5 border-l border-black/10 px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Signalor
                  </th>
                  <th className="border-l border-black/10 px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
                    Ahrefs Alerts
                  </th>
                  <th className="border-l border-black/10 px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
                    Semrush Brand Monitoring
                  </th>
                  <th className="border-l border-black/10 px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
                    Mention
                  </th>
                  <th className="border-l border-black/10 px-6 py-4 text-center text-sm font-semibold text-muted-foreground">
                    Meltwater
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={idx !== COMPARISON_DATA.length - 1 ? 'border-b border-black/6' : ''}
                  >
                    <td className="bg-background px-6 py-4 text-sm font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="bg-primary/5 border-l border-black/10 px-6 py-4 text-center">
                      <CellValue value={row.signalor} />
                    </td>
                    <td className="bg-background border-l border-black/10 px-6 py-4 text-center">
                      <CellValue value={row.ahrefs} />
                    </td>
                    <td className="bg-background border-l border-black/10 px-6 py-4 text-center">
                      <CellValue value={row.semrush} />
                    </td>
                    <td className="bg-background border-l border-black/10 px-6 py-4 text-center">
                      <CellValue value={row.mention} />
                    </td>
                    <td className="bg-background border-l border-black/10 px-6 py-4 text-center">
                      <CellValue value={row.meltwater} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-6 lg:hidden">
          {COMPARISON_DATA.map(row => (
            <div key={row.feature} className="rounded-lg border border-black/10 bg-card p-5">
              <h3 className="mb-4 text-base font-semibold text-foreground">{row.feature}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-sm font-medium text-primary">Signalor</span>
                  <CellValue value={row.signalor} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-sm text-muted-foreground">Ahrefs Alerts</span>
                  <CellValue value={row.ahrefs} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-sm text-muted-foreground">Semrush Brand Monitoring</span>
                  <CellValue value={row.semrush} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-sm text-muted-foreground">Mention</span>
                  <CellValue value={row.mention} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Meltwater</span>
                  <CellValue value={row.meltwater} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          * Traditional brand monitoring tools track web mentions; Signalor tracks AI-generated
          answers where 60% of search traffic now lands.
        </p>

        <div className="mt-8">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Start tracking AI mentions
          </Link>
        </div>
      </div>
    </section>
  )
}
