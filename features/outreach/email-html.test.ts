import { describe, expect, it } from 'vitest'

import type { OutreachReport } from '@/lib/api/outreach'

import { escapeHtml, formatEmailHtml } from './email-html'

function prompt(over: Partial<OutreachReport['prompts'][number]> = {}) {
  return {
    prompt: 'best MGA platforms',
    intent: 'Information',
    prompt_type: 'Organic',
    engines: [
      { label: 'ChatGPT', mentioned: false, answered: true },
      { label: 'Claude', mentioned: false, answered: true },
    ],
    mentions: 0,
    measured: true,
    cited_domains: [],
    ...over,
  }
}

function report(over: Partial<OutreachReport> = {}): OutreachReport {
  return {
    url: 'https://acme.com',
    brand: 'Acme',
    industry: 'saas',
    prompts: [prompt()],
    prompts_total: 1,
    prompts_measured: 1,
    prompts_lost: 1,
    competitors: [{ domain: 'rival.com', prompts: 2 }],
    opportunities: ['Publish a comparison page.'],
    ...over,
  }
}

describe('formatEmailHtml', () => {
  it('avoids the constructs mail clients strip', () => {
    const html = formatEmailHtml(report())

    expect(html).not.toContain('<script')
    expect(html).not.toContain('<style')
    // No client renders SVG in mail, and Gmail blocks data: URIs outright.
    expect(html).not.toContain('.svg')
    expect(html).not.toContain('data:image')
    expect(html).not.toContain('display:flex')
    expect(html).not.toContain('display:grid')
  })

  it('resolves every mark by domain, never from our own origin', () => {
    const html = formatEmailHtml(report({ prompts: [prompt({ cited_domains: ['rival.com'] })] }))

    // Self-hosted assets 404 until the frontend deploys, and a report built on
    // localhost would bake a localhost URL into a stranger's inbox.
    expect(html).not.toContain('signalor.ai/logos')
    expect(html).not.toMatch(/src="\/|src="http:\/\/localhost/)

    expect(html).toContain('domain=chatgpt.com')
    expect(html).toContain('domain=claude.ai')
    expect(html).toContain('domain=rival.com')
  })

  it('gives every image an alt and explicit dimensions', () => {
    const html = formatEmailHtml(report())
    const images = html.match(/<img[^>]*>/g) ?? []

    expect(images.length).toBeGreaterThan(0)
    for (const img of images) {
      // Outlook reserves no space for an image without width/height, so the
      // layout collapses while images load or when they are suppressed.
      expect(img).toContain('alt=')
      expect(img).toMatch(/width="\d+"/)
      expect(img).toMatch(/height="\d+"/)
    }
  })

  it("leads with the benchmarked company's own mark", () => {
    const html = formatEmailHtml(report({ url: 'https://www.acme.com/pricing' }))

    // www stripped, path dropped — the favicon service keys on the bare host.
    expect(html).toContain('domain=acme.com&amp;sz=128')
  })

  it('url-encodes competitor domains into the favicon URL', () => {
    const html = formatEmailHtml(report({ competitors: [{ domain: 'a b&c.com', prompts: 1 }] }))

    expect(html).toContain('domain=a%20b%26c.com')
  })

  it('labels every status in text, never colour alone', () => {
    const html = formatEmailHtml(
      report({
        prompts: [
          prompt({ mentions: 2, engines: [{ label: 'ChatGPT', mentioned: true, answered: true }] }),
        ],
      }),
    )

    expect(html).toContain('cited')
    expect(html).toContain('Acme')
  })

  it('reports an unmeasured prompt as not measured rather than an absence', () => {
    const html = formatEmailHtml(
      report({
        prompts: [
          prompt({
            measured: false,
            mentions: 0,
            engines: [{ label: 'ChatGPT', mentioned: false, answered: false }],
          }),
        ],
      }),
    )

    expect(html).toContain('Not measured')
    expect(html).not.toContain('Not cited in any')
  })

  it('escapes prompt text so a quote cannot break out of the markup', () => {
    const html = formatEmailHtml(
      report({ prompts: [prompt({ prompt: '<img src=x onerror="alert(1)">' })] }),
    )

    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x')
    expect(html).not.toContain('onerror="alert(1)"')
  })

  it('escapes competitor domains and opportunity text too', () => {
    const html = formatEmailHtml(
      report({
        competitors: [{ domain: '<b>evil.com</b>', prompts: 1 }],
        opportunities: ['<script>x</script>'],
      }),
    )

    expect(html).not.toContain('<b>evil.com</b>')
    expect(html).not.toContain('<script>x</script>')
  })

  it('scales the competitor bars against the largest value', () => {
    const html = formatEmailHtml(
      report({
        competitors: [
          { domain: 'big.com', prompts: 4 },
          { domain: 'small.com', prompts: 1 },
        ],
      }),
    )

    // Leader fills the track; the smaller one keeps a visible minimum width.
    expect(html).toContain('width="100%"')
    expect(html).toContain('width="25%"')
  })

  it('omits sections that have no data instead of printing empty headings', () => {
    const html = formatEmailHtml(report({ competitors: [], opportunities: [] }))

    expect(html).not.toContain('Who gets cited instead')
    expect(html).not.toContain('What would move it')
  })

  it('survives a report with no prompts at all', () => {
    expect(() =>
      formatEmailHtml(
        report({ prompts: [], prompts_total: 0, prompts_measured: 0, prompts_lost: 0 }),
      ),
    ).not.toThrow()
  })
})

describe('escapeHtml', () => {
  it('escapes the five markup-significant characters', () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
  })
})
