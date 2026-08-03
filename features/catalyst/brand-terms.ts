// Terms to highlight inside an engine's answer, so you can see at a glance
// where the brand actually surfaces in the text.
//
// The two kinds are kept apart on purpose: this codebase treats a cited domain
// (the site is a source) as a stronger signal than a name-drop, and the answer
// text should not blur them.

export type HighlightKind = 'domain' | 'name'

export interface HighlightTerm {
  value: string
  kind: HighlightKind
}

/** Bare host for a URL — no protocol, no `www.`, no path. */
export function hostOf(url: string): string {
  if (!url) return ''
  const stripped = url
    .trim()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/^www\./i, '')
  return stripped.split(/[/?#]/)[0]?.toLowerCase() ?? ''
}

/**
 * The brand's domain (from its own URL, plus any domain the backend already
 * flagged as the brand's own) and its name. Longest first, so "Acme Analytics"
 * wins over "Acme" when both would match.
 */
export function buildBrandTerms(
  brand: { name?: string; url?: string },
  brandDomains: string[] = [],
): HighlightTerm[] {
  const domains = new Set<string>()
  const ownHost = hostOf(brand.url ?? '')
  if (ownHost) domains.add(ownHost)
  for (const domain of brandDomains) {
    const host = hostOf(domain)
    if (host) domains.add(host)
  }

  const terms: HighlightTerm[] = [...domains]
    .filter(Boolean)
    .map(value => ({ value, kind: 'domain' as const }))

  const name = (brand.name ?? '').trim()
  // Skip a one-character name — it would match a letter in every sentence.
  if (name.length > 1) terms.push({ value: name, kind: 'name' })

  return terms.sort((a, b) => b.value.length - a.value.length)
}
