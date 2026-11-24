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
      <Check className="text-success mx-auto h-5 w-5" strokeWidth={2.5} aria-label="Yes" />
    ) : (
      <X className="text-muted-foreground/40 mx-auto h-5 w-5" strokeWidth={2} aria-label="No" />
    )
  }
  return <span className="text-foreground text-sm">{value}</span>
}

export function PromptTrackingComparisonTable(): JSX.Element {
  return (
    <section
      id="comparison"
      className="bg-background scroll-mt-20"
      aria-labelledby="comparison-heading"
    >
      <div
        aria-hidden
        className="relative left-1/2 w-screen -translate-x-1/2 border-t border-black/6"
      />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-16 lg:px-12 lg:pt-16 lg:pb-20">
        <div className="mb-10">
          <h2
            id="comparison-heading"
            className="text-foreground text-3xl leading-tight font-bold tracking-tight sm:text-4xl"
          >
            How Signalor compares to brand monitoring tools
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed lg:text-lg">
            Traditional brand monitoring tools track web mentions. Signalor tracks AI-generated
            answers where 60% of search traffic now lands.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border border-black/10 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-black/10">
                  <th className="text-foreground px-6 py-4 text-left text-sm font-semibold">
                    Feature
                  </th>
                  <th className="bg-primary/5 text-foreground border-l border-black/10 px-6 py-4 text-center text-sm font-semibold">
                    Signalor
                  </th>
                  <th className="text-muted-foreground border-l border-black/10 px-6 py-4 text-center text-sm font-semibold">
                    Ahrefs Alerts
                  </th>
                  <th className="text-muted-foreground border-l border-black/10 px-6 py-4 text-center text-sm font-semibold">
                    Semrush Brand Monitoring
                  </th>
                  <th className="text-muted-foreground border-l border-black/10 px-6 py-4 text-center text-sm font-semibold">
                    Mention
                  </th>
                  <th className="text-muted-foreground border-l border-black/10 px-6 py-4 text-center text-sm font-semibold">
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
                    <td className="bg-background text-foreground px-6 py-4 text-sm font-medium">
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
            <div key={row.feature} className="bg-card rounded-lg border border-black/10 p-5">
              <h3 className="text-foreground mb-4 text-base font-semibold">{row.feature}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-primary-ink text-sm font-medium">Signalor</span>
                  <CellValue value={row.signalor} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-muted-foreground text-sm">Ahrefs Alerts</span>
                  <CellValue value={row.ahrefs} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-muted-foreground text-sm">Semrush Brand Monitoring</span>
                  <CellValue value={row.semrush} />
                </div>
                <div className="flex items-center justify-between border-b border-black/6 pb-3">
                  <span className="text-muted-foreground text-sm">Mention</span>
                  <CellValue value={row.mention} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Meltwater</span>
                  <CellValue value={row.meltwater} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-6 text-sm">
          * Traditional brand monitoring tools track web mentions; Signalor tracks AI-generated
          answers where 60% of search traffic now lands.
        </p>

        <div className="mt-8">
          <Link
            href="/sign-up"
            className="bg-primary-strong text-primary-foreground hover:bg-primary-strong/90 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-colors"
          >
            Start tracking AI mentions
          </Link>
        </div>
      </div>
    </section>
  )
}
