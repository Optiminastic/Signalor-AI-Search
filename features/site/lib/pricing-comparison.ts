/**
 * The full plan comparison the homepage has been promising.
 *
 * `home-pricing.tsx` links "Full plan comparison →" to /pricing, which until now
 * had no table at all. This is that table's content.
 *
 * Every value here is derived from the plan definitions already in the codebase
 * (`PLANS` / `AGENCY_PLANS` in the pricing page) — nothing is invented. Where a
 * capability genuinely isn't defined for a tier the cell is `false`, which
 * renders as an em dash rather than an optimistic tick.
 *
 * Column keys mirror the plan cards above so the two can never disagree.
 */

/** Column keys. Brand and agency views have different column sets. */
export type BrandPlanId = 'starter' | 'enterprise'
export type AgencyPlanId = 'agency-brand-10' | 'agency-account' | 'agency-brand-25'

/** A cell is either a capability flag, a concrete value, or a logo cluster. */
export type CellValue = boolean | string | 'models'

export interface ComparisonRow {
  label: string
  /** Optional clarifier under the row label. */
  hint?: string
  values: Record<string, CellValue>
}

export interface ComparisonSection {
  title: string
  /**
   * `models` sections render the tracked AI engine logos in every plan cell
   * instead of a tick (mirrors the reference pricing table).
   */
  kind?: 'models'
  rows: ComparisonRow[]
}

/** Column order for the brand (individual) view. */
export const BRAND_COLUMNS: { id: BrandPlanId; label: string }[] = [
  { id: 'starter', label: 'Self-Serve' },
  { id: 'enterprise', label: 'Enterprise' },
]

// Order mirrors the agency cards above the table: the buyable plan leads.
export const AGENCY_COLUMNS: { id: AgencyPlanId; label: string }[] = [
  { id: 'agency-brand-10', label: 'Per Brand · 10' },
  { id: 'agency-account', label: 'Agency Account' },
  { id: 'agency-brand-25', label: 'Per Brand · 25' },
]

/** The AI engines every plan tracks, shown as logos in the table. */
export const TRACKED_MODEL_LOGOS = [
  { name: 'ChatGPT', src: '/logos/chatgpt.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
  { name: 'Copilot', src: '/logos/copilot.svg' },
] as const

export const BRAND_COMPARISON: ComparisonSection[] = [
  {
    title: 'Available models',
    kind: 'models',
    rows: [
      {
        label: 'AI engines tracked',
        hint: 'Every plan watches your brand across all engines',
        values: { starter: 'models', enterprise: 'models' },
      },
    ],
  },
  {
    title: 'Tracking & coverage',
    rows: [
      {
        label: 'Tracked prompts',
        hint: 'Prompts we ask AI engines on your behalf',
        values: { starter: '10', enterprise: 'Custom' },
      },
      {
        label: 'Brands / domains',
        values: { starter: '1', enterprise: 'Multiple' },
      },
      {
        label: 'GEO score & audit',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'AI visibility score',
        hint: 'How often engines mention you, tracked over time',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'Prompt ranking across engines',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'Competitor visibility tracking',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'Choose which engines you track',
        values: { starter: false, enterprise: true },
      },
    ],
  },
  {
    title: 'Fixes & guidance',
    rows: [
      {
        label: 'Prioritised fix list',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'Recommendations & guidance',
        values: { starter: true, enterprise: true },
      },
      {
        label: 'Priority recommendations',
        values: { starter: false, enterprise: true },
      },
      {
        label: 'Guidance on fixes & actions',
        values: { starter: false, enterprise: true },
      },
    ],
  },
  {
    title: 'Support',
    rows: [
      {
        label: 'Daily agency-style support',
        hint: 'Our team works your list with you',
        values: { starter: false, enterprise: true },
      },
      {
        label: 'Dedicated support',
        values: { starter: false, enterprise: true },
      },
      {
        label: 'Custom reporting cadence',
        values: { starter: false, enterprise: true },
      },
      {
        label: 'Preferred currency & billing terms',
        values: { starter: false, enterprise: true },
      },
    ],
  },
]

export const AGENCY_COMPARISON: ComparisonSection[] = [
  {
    title: 'Available models',
    kind: 'models',
    rows: [
      {
        label: 'AI engines tracked',
        hint: 'Every plan watches your brand across all engines',
        values: {
          'agency-account': 'models',
          'agency-brand-10': 'models',
          'agency-brand-25': 'models',
        },
      },
    ],
  },
  {
    title: 'Workspace',
    rows: [
      {
        label: 'One workspace for all clients',
        values: { 'agency-account': true, 'agency-brand-10': false, 'agency-brand-25': false },
      },
      {
        label: 'Add & manage multiple client brands',
        values: { 'agency-account': true, 'agency-brand-10': false, 'agency-brand-25': false },
      },
      {
        label: 'Consolidated visibility across clients',
        values: { 'agency-account': true, 'agency-brand-10': false, 'agency-brand-25': false },
      },
      {
        label: 'Agency discount',
        hint: 'Applied to every brand you onboard',
        values: {
          'agency-account': '15% off brands',
          'agency-brand-10': '15% applied',
          'agency-brand-25': '15% applied',
        },
      },
    ],
  },
  {
    title: 'Per client brand',
    rows: [
      {
        label: 'Tracked prompts',
        values: { 'agency-account': '—', 'agency-brand-10': '10', 'agency-brand-25': '25' },
      },
      {
        label: 'AI visibility score & prompt ranking',
        values: { 'agency-account': false, 'agency-brand-10': true, 'agency-brand-25': true },
      },
      {
        label: 'Competitor visibility tracking',
        values: { 'agency-account': false, 'agency-brand-10': true, 'agency-brand-25': true },
      },
      {
        label: 'Recommendations & guidance',
        values: { 'agency-account': false, 'agency-brand-10': false, 'agency-brand-25': true },
      },
    ],
  },
]
