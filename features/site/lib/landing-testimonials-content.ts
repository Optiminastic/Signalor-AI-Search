// TODO: replace with real customer quotes before production.
// These are plausible mocks shaped from the kind of feedback operators give
// GEO tools, intentionally specific about outcomes (not vague "great product" fluff).

export type Testimonial = {
  quote: string
  /** Exact substrings of `quote` to render bold in the home layout. */
  emphasis: string[]
  name: string
  role: string
  company: string
  initials: string
  tint: 'orange' | 'blue' | 'emerald'
  /** Headline outcome, shown as a stat callout beside the featured quote. */
  metric?: { value: string; label: string }
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We stopped guessing which pages ChatGPT cites. SignalorAI's citation attribution showed us three URLs we'd never have prioritized, one of them now drives 40% of our AI traffic.",
    name: 'Priya M.',
    role: 'Head of Growth',
    company: 'Nimbus Commerce',
    initials: 'PM',
    tint: 'orange',
    emphasis: ["three URLs we'd never have prioritized", '40% of our AI traffic'],
    metric: { value: '40%', label: 'of their AI traffic now comes from one newly cited page' },
  },
  {
    quote:
      'The competitor delta view changed our content roadmap overnight. Instead of chasing SEO volume, we brief writers against the exact rival URLs Perplexity is pulling from.',
    name: 'Daniel K.',
    role: 'Content Lead',
    company: 'Ardent Labs',
    initials: 'DK',
    tint: 'blue',
    emphasis: ['changed our content roadmap overnight'],
  },
  {
    quote:
      'Auto-fix shipping Organization + FAQ schema straight into our Shopify theme saved us a three-week engineering slot. GEO score jumped 14 points in the first recheck.',
    name: 'Sofia R.',
    role: 'DTC Operator',
    company: 'Vault Apparel',
    initials: 'SR',
    tint: 'emerald',
    emphasis: ['GEO score jumped 14 points'],
    metric: { value: '+14', label: 'GEO score points in the first recheck' },
  },
]
