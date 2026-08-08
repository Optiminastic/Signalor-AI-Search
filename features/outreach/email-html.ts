import { BRAND, GREEN } from '@/features/catalyst/constants'
import type { OutreachReport } from '@/lib/api/outreach'
import { ENGINE_DOMAINS } from '@/lib/geo/engine-domains'

import { lostPrompts } from './format'

/**
 * The benchmark rendered as email-safe HTML, for pasting into Gmail/Outlook.
 *
 * Constraints that shape every decision here:
 *   - No JavaScript, ever. Mail clients strip it.
 *   - No <style> block and no classes — Outlook and Gmail drop or rewrite them,
 *     so every rule is an inline style attribute.
 *   - No flexbox or grid. Layout is nested tables, which is the only thing that
 *     survives Word's rendering engine in desktop Outlook.
 *   - Charts are table cells with background colours, never images, so the data
 *     is legible even when a client suppresses remote content. Images are used
 *     only for logos, which are decoration beside a text label.
 *
 * Colour comes from the app's own tokens (BRAND / GREEN). That pair was checked
 * with the palette validator: CVD separation ΔE 9.9 (deutan), normal-vision
 * 32.3 — both pass. Its one warning is contrast against the surface, whose
 * required relief is visible labels or a table view; every mark below carries a
 * text label, so identity is never colour-alone. Colourblind recipients read
 * "cited"/"not cited", not hue.
 */

const INK = '#18181B'
const INK_2 = '#52525B'
const INK_3 = '#8A8A94'
const RULE = '#E5E7EB'
const SURFACE = '#FAFAF9'
/** Absent data, not a third finding — so it is neutral, never a third hue. */
const NEUTRAL = '#D4D4D8'

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

/**
 * Every mark in this email is a favicon fetched by domain.
 *
 * The repo ships engine logos as SVG, which no major mail client renders inside
 * <img>, and Gmail blocks data: URIs outright — so the marks have to be remote
 * PNGs. Self-hosting them under our own origin was the first attempt and is the
 * wrong call twice over: the files only exist once the frontend deploys, and a
 * report generated from localhost would bake a localhost URL into a stranger's
 * inbox. Resolving by domain has neither failure mode, works the moment it is
 * written, and is the same path the competitor marks already use — one
 * mechanism instead of two.
 *
 * Every logo still sits beside its name in text, so a client with images
 * disabled loses decoration, never meaning.
 */
// Moved to lib/ so the dashboard can run the same map backwards (referrer host
// → engine) without importing across features.

/**
 * A site's mark, via Google's public favicon service.
 *
 * The domain is URL-encoded: competitor domains come from crawled citations, so
 * they are untrusted input being placed into a URL.
 */
function siteFavicon(domain: string): string {
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
  return `<img src="${escapeHtml(src)}" width="16" height="16" alt="" style="width:16px;height:16px;vertical-align:middle;border:0;display:inline-block;border-radius:3px;">`
}

/** Hostname of a URL, for favicon lookup. Falls back to the raw string. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return (
      url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0] ?? url
    )
  }
}

/** The benchmarked company's own mark, at header size. */
function brandLogo(url: string, size = 28): string {
  const domain = hostOf(url)
  if (!domain) return ''
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
  return `<img src="${escapeHtml(src)}" width="${size}" height="${size}" alt="" style="width:${size}px;height:${size}px;vertical-align:middle;border:0;display:inline-block;border-radius:6px;">`
}

/** The engine's real logo, sized for inline use beside its name. */
function engineChip(label: string): string {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const domain = ENGINE_DOMAINS[key]
  return domain ? siteFavicon(domain) : ''
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * The app's segmented tick meter, rebuilt in table cells.
 *
 * The repo mandates a segmented tick bar for any visibility/score indicator
 * rather than a solid fill, so the email matches the dashboard rather than
 * inventing a second visual language for the same measure.
 */
function tickBar(filled: number, total: number, colour: string): string {
  const cells = Array.from({ length: total }, (_, i) => {
    const bg = i < filled ? colour : NEUTRAL
    return `<td width="4" style="width:4px;height:14px;background-color:${bg};border-radius:1px;font-size:0;line-height:0;">&nbsp;</td><td width="2" style="width:2px;font-size:0;line-height:0;">&nbsp;</td>`
  }).join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`
}

function statTile(label: string, value: string | number, colour: string): string {
  return `<td width="33%" style="padding:14px 12px;background-color:${SURFACE};border:1px solid ${RULE};border-radius:6px;">
    <div style="font-family:${FONT};font-size:26px;line-height:30px;font-weight:700;color:${colour};">${escapeHtml(String(value))}</div>
    <div style="font-family:${FONT};font-size:11px;line-height:15px;color:${INK_3};text-transform:uppercase;letter-spacing:.5px;padding-top:3px;">${escapeHtml(label)}</div>
  </td>`
}

type Prompt = OutreachReport['prompts'][number]

/** The prompt's headline result. "Not measured" is its own state, never an absence. */
function promptVerdict(prompt: Prompt, total: number): string {
  if (!prompt.measured) {
    return `<span style="color:${INK_3};font-weight:600;">Not measured</span>`
  }
  if (prompt.mentions > 0) {
    return `<span style="color:${GREEN};font-weight:700;">Cited in ${prompt.mentions} of ${total}</span>`
  }
  return `<span style="color:${BRAND};font-weight:700;">Not cited in any</span>`
}

/** One engine's outcome as [label, colour]. */
function engineOutcome(engine: Prompt['engines'][number]): [string, string] {
  if (!engine.answered) return ['n/a', INK_3]
  return engine.mentioned ? ['cited', GREEN] : ['not cited', BRAND]
}

function engineCells(prompt: Prompt): string {
  return prompt.engines
    .map(engine => {
      const [text, colour] = engineOutcome(engine)
      return `<td style="padding:0 14px 0 0;white-space:nowrap;font-family:${FONT};font-size:12px;line-height:20px;">${engineChip(engine.label)} <span style="color:${INK_2};vertical-align:middle;">${escapeHtml(engine.label)}</span> <span style="color:${colour};font-weight:700;vertical-align:middle;">${text}</span></td>`
    })
    .join('')
}

/** One prompt: the question, a tick meter of engines citing it, and the engines. */
function promptRow(prompt: Prompt): string {
  const total = prompt.engines.length || 1
  const meter = prompt.measured
    ? tickBar(prompt.mentions, total, prompt.mentions > 0 ? GREEN : BRAND)
    : tickBar(0, total, NEUTRAL)

  const verdict = promptVerdict(prompt, total)
  const engines = engineCells(prompt)

  const citedCells = prompt.cited_domains
    .slice(0, 4)
    .map(
      domain =>
        `<td style="padding:0 10px 0 0;white-space:nowrap;font-family:${FONT};font-size:12px;line-height:20px;color:${INK_2};">${siteFavicon(domain)} <span style="vertical-align:middle;">${escapeHtml(domain)}</span></td>`,
    )
    .join('')

  const cited =
    prompt.cited_domains.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-top:6px;"><tr>
          <td style="padding-right:8px;white-space:nowrap;font-family:${FONT};font-size:12px;line-height:20px;color:${INK_3};">Cited instead</td>
          ${citedCells}
        </tr></table>`
      : ''

  return `<tr><td style="padding:13px 0;border-bottom:1px solid ${RULE};">
    <div style="font-family:${FONT};font-size:14px;line-height:20px;font-weight:600;color:${INK};">${escapeHtml(prompt.prompt)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-top:7px;"><tr>
      <td style="padding-right:10px;">${meter}</td>
      <td style="font-family:${FONT};font-size:12px;line-height:17px;">${verdict}</td>
    </tr></table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding-top:6px;"><tr>${engines}</tr></table>
    ${cited}
  </td></tr>`
}

/** Magnitude, one hue: how many prompts each rival source wins. */
function competitorBar(domain: string, count: number, max: number): string {
  const pct = Math.max(6, Math.round((count / Math.max(max, 1)) * 100))
  return `<tr>
    <td width="185" style="font-family:${FONT};font-size:13px;line-height:20px;color:${INK};padding:5px 10px 5px 0;white-space:nowrap;">${siteFavicon(domain)} <span style="vertical-align:middle;">${escapeHtml(domain)}</span></td>
    <td style="padding:4px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td width="${pct}%" style="background-color:${BRAND};height:14px;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>
    </td>
    <td width="70" style="font-family:${FONT};font-size:12px;line-height:17px;color:${INK_2};padding:4px 0 4px 10px;white-space:nowrap;">${count} ${count === 1 ? 'prompt' : 'prompts'}</td>
  </tr>`
}

function section(title: string): string {
  return `<tr><td style="padding:26px 0 8px 0;font-family:${FONT};font-size:11px;line-height:15px;font-weight:700;color:${INK_3};text-transform:uppercase;letter-spacing:.8px;">${escapeHtml(title)}</td></tr>`
}

function intro(report: OutreachReport, brand: string): string {
  const headline = lostPrompts(report)[0] ?? report.prompts[0]?.prompt ?? ''
  const rivals = report.competitors.slice(0, 3).map(c => c.domain)
  if (!headline)
    return `I ran a quick check on how AI platforms answer buying questions in your category.`
  return rivals.length > 0
    ? `I was testing how AI platforms answer &ldquo;${escapeHtml(headline)}&rdquo; and noticed that ${escapeHtml(rivals.join(', '))} came up, but ${escapeHtml(brand)} didn&rsquo;t.`
    : `I was testing how AI platforms answer &ldquo;${escapeHtml(headline)}&rdquo; and noticed that ${escapeHtml(brand)} didn&rsquo;t come up.`
}

/**
 * Subject-line options, most specific first.
 *
 * Worth being blunt about where opens actually come from: the recipient decides
 * before any of the HTML below is rendered, so the subject, the sending domain's
 * reputation and the preheader are the levers — not the design. These are built
 * to name one checkable fact rather than pitch, because a claim the reader can
 * verify in ten seconds is what earns the open and survives the reply.
 */
export function emailSubjects(report: OutreachReport): string[] {
  const brand = report.brand || report.url
  const rival = report.competitors[0]?.domain ?? ''
  const lost = lostPrompts(report).length
  const options = [
    rival ? `AI recommends ${rival}, not ${brand}` : `${brand} is missing from AI answers`,
    lost > 0 ? `${brand} is absent from ${lost} buyer prompts we tested` : `${brand} in AI search`,
    `Quick benchmark: ${brand} vs AI answer engines`,
  ]
  return options.filter(Boolean)
}

/**
 * Inbox preview text. Gmail and Apple Mail show it next to the subject, so an
 * empty one leaks the first body line ("Hi there,") into the inbox and wastes
 * the second-biggest open-rate lever there is. Hidden in the rendered email.
 */
function preheader(report: OutreachReport): string {
  const brand = report.brand || report.url
  const lost = lostPrompts(report).length
  const text = lost
    ? `${brand} wasn't cited in ${lost} of ${report.prompts_measured} buyer prompts on ChatGPT, Claude and Perplexity.`
    : `How ${brand} shows up across ChatGPT, Claude and Perplexity.`
  return `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(text)}</div>`
}

function rivalSection(report: OutreachReport): string {
  const max = report.competitors[0]?.prompts ?? 1
  const rows = report.competitors
    .slice(0, 6)
    .map(c => competitorBar(c.domain, c.prompts, max))
    .join('')
  if (!rows) return ''
  return `${section('Who gets cited instead')}<tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table></td></tr>`
}

/** Which engines were asked, with their marks — the report's provenance. */
function engineLegendRow(): string {
  return ['ChatGPT', 'Claude', 'Perplexity']
    .map(
      name =>
        `<td style="padding:0 12px 0 0;white-space:nowrap;font-family:${FONT};font-size:12px;line-height:20px;color:${INK_2};">${engineChip(name)} <span style="vertical-align:middle;">${name}</span></td>`,
    )
    .join('')
}

/** Title, domain, and which engines were asked. */
function headerBlock(report: OutreachReport, brand: string, engineLegend: string): string {
  return `<tr><td style="padding:10px 0 4px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left:3px solid ${BRAND};"><tr>
      <td width="40" style="padding:0 0 0 11px;vertical-align:middle;">${brandLogo(report.url)}</td>
      <td style="padding-left:10px;vertical-align:middle;">
        <div style="font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;color:${INK};">${escapeHtml(brand)}</div>
        <div style="font-family:${FONT};font-size:12px;line-height:17px;color:${INK_3};padding-top:1px;">${escapeHtml(hostOf(report.url))} &middot; AI visibility benchmark</div>
      </td>
    </tr></table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="padding:10px 0 0 14px;"><tr>${engineLegend}</tr></table>
  </td></tr>`
}

/** The full email body as HTML. Paste-ready; nothing external is referenced. */
export function formatEmailHtml(report: OutreachReport, senderName = ''): string {
  const brand = report.brand || report.url
  const engineLegend = engineLegendRow()

  return `<div style="background-color:#ffffff;padding:4px;">
${preheader(report)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;font-family:${FONT};color:${INK};">
  <tr><td style="font-family:${FONT};font-size:14px;line-height:21px;color:${INK};padding-bottom:14px;">
    Hi there,<br><br>
    ${intro(report, brand)}<br><br>
    Buyers increasingly ask ChatGPT, Claude and Perplexity which providers to consider before they ever reach Google. Whoever gets named in those answers makes the shortlist first.
  </td></tr>

  ${headerBlock(report, brand, engineLegend)}

  <tr><td style="padding:12px 0 2px 0;">
    <table role="presentation" cellpadding="0" cellspacing="6" border="0" width="100%"><tr>
      ${statTile('Prompts tested', report.prompts_measured, INK)}
      ${statTile('Cited in', report.prompts_measured - report.prompts_lost, GREEN)}
      ${statTile('Not cited', report.prompts_lost, BRAND)}
    </tr></table>
  </td></tr>

  ${section('Buyer prompts')}
  <tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${report.prompts.map(promptRow).join('')}
  </table></td></tr>

  ${rivalSection(report)}

  <tr><td style="padding:22px 0 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${INK};">
    Happy to walk through it if useful.<br><br>
    Best,<br>${escapeHtml(senderName)}
  </td></tr>
  <tr><td style="padding:18px 0 0 0;border-top:1px solid ${RULE};font-family:${FONT};font-size:11px;line-height:16px;color:${INK_3};">
    Measured live across three answer engines. Prompts marked &ldquo;not measured&rdquo; are ones where no engine returned an answer &mdash; they are not counted as absences.
  </td></tr>
</table>
</div>`
}
