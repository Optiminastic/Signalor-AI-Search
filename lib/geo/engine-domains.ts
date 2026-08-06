/**
 * The one map between AI engines and the domains they own.
 *
 * Lives in `lib/` rather than a feature because two features need it and
 * features may not import each other: `features/outreach` turns an engine key
 * into a favicon domain, and `features/catalyst` runs it backwards to decide
 * whether a GA4 referral came from an AI answer engine.
 */

export const ENGINE_DOMAINS: Record<string, string> = {
  chatgpt: 'chatgpt.com',
  gpt: 'chatgpt.com',
  claude: 'claude.ai',
  perplexity: 'perplexity.ai',
  gemini: 'gemini.google.com',
  google: 'google.com',
  bing: 'bing.com',
  copilot: 'copilot.microsoft.com',
  deepseek: 'deepseek.com',
  grok: 'x.ai',
  llama: 'meta.ai',
  metallama: 'meta.ai',
}

/**
 * Domains longest-first, so a subdomain always beats the parent it sits under.
 *
 * Without this ordering `gemini.google.com` matches `google.com` first and an
 * AI referral is misreported as plain search — the single most consequential
 * misclassification this map can make.
 */
const BY_SPECIFICITY: { domain: string; engine: string }[] = Object.entries(ENGINE_DOMAINS)
  .map(([engine, domain]) => ({ engine, domain }))
  .sort((a, b) => b.domain.length - a.domain.length)

/** GA4 reports sources with no scheme, sometimes with `www.` or a trailing path. */
function normalizeHost(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace(/^www\./, '')
}

/**
 * The engine key for a referrer host, or null when it isn't an AI engine.
 *
 * Matches the host itself or any subdomain of it, so `chat.chatgpt.com` still
 * resolves while `notchatgpt.com` does not.
 */
export function engineFromHost(raw: string): string | null {
  const host = normalizeHost(raw)
  if (!host) return null
  const hit = BY_SPECIFICITY.find(({ domain }) => host === domain || host.endsWith(`.${domain}`))
  return hit ? hit.engine : null
}
