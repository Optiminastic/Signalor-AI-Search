import Image from 'next/image'
import Link from 'next/link'

import { Sparkle } from '@/features/landing/components/Sparkle'
import { ArrowRight } from '@/lib/icons'

const GLOW = 'radial-gradient(60% 120% at 50% 0%, rgba(224,74,61,0.10), rgba(224,74,61,0) 70%)'

export function FooterCta(): JSX.Element {
  return (
    <div className="relative overflow-hidden border-b border-black/[0.06] bg-[#fbfbfa]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: GLOW }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          {/* Left — copy + CTA */}
          <div className="min-w-0 text-center lg:text-left">
            <p className="text-primary-ink text-[11px] font-semibold tracking-[0.22em] uppercase">
              Get started
            </p>
            <h2 className="mt-4 text-[30px] leading-[1.12] font-bold tracking-tight text-[#141414] sm:text-[42px]">
              Turn <Sparkle size={30} className="text-primary-ink inline-block align-middle" />{' '}
              search into your{' '}
              <span className="text-primary-ink whitespace-nowrap">highest-intent pipeline</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#6b6b6b] lg:mx-0">
              Run a free GEO audit, track citations across models, and ship fixes that move how
              ChatGPT, Perplexity, and Gemini talk about you.
            </p>
            <Link
              href="/sign-up"
              className="auth-cta-btn mt-8 inline-flex h-12 items-center gap-2 rounded-md px-6 text-[15px] font-semibold text-white"
            >
              Get started
              <ArrowRight size={17} strokeWidth={2.2} />
            </Link>
          </div>

          {/* Right — dashboard preview */}
          <div className="relative min-w-0 lg:pl-2">
            <div className="relative rounded-none bg-white/90 p-2 shadow-xl backdrop-blur-[2px] sm:p-3">
              <Image
                src="/carousel1.png"
                alt="SignalorAI dashboard showing AI visibility and GEO scores"
                width={2000}
                height={2000}
                unoptimized
                className="h-auto w-full rounded-none object-contain select-none"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
