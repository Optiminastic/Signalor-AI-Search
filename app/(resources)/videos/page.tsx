import type { Metadata } from 'next'

import { MarketingShell } from '@/features/landing/components/MarketingShell'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Product walkthroughs and short explainers for SignalorAI. Videos are coming soon.',
}

export default function VideosPage(): JSX.Element {
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-4xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[13px] font-semibold tracking-wider text-[#e04a3d] uppercase">Videos</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#171717] md:text-5xl">
          Videos coming soon
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#52525b]">
          Product walkthroughs and short explainers are in the works. When they're ready we'll
          publish them here, with full transcripts, so you can follow along at your own pace.
          In the meantime, run a free audit to see how AI engines describe your brand today.
        </p>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="text-[17px] font-semibold text-[#171717]">What's coming</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#52525b]">
              The Product tour, Dashboard deep dives, Integrations, and Office hours recordings
              will each be published with embedded videos and full transcripts.
            </p>
          </section>
          <section>
            <h2 className="text-[17px] font-semibold text-[#171717]">Until then</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#52525b]">
              Read the docs and guides for written walkthroughs of the analyzer, Visibility, Prompt
              Tracking, Competitors, and the Sitemap audit.
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  )
}
