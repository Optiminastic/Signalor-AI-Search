import Image from 'next/image'
import Link from 'next/link'

import { AnnouncementBar } from '@/features/landing/components/AnnouncementBar'
import { Sparkle } from '@/features/landing/components/Sparkle'
import { ArrowRight } from '@/lib/icons'

function HeroCtas(): JSX.Element {
  return (
    <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
      <Link
        href="/sign-up"
        className="auth-cta-btn inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md px-6 text-[15px] font-semibold text-white sm:w-auto"
      >
        Get started
        <ArrowRight size={17} strokeWidth={2.4} />
      </Link>
      <Link
        href="/pricing"
        className="inline-flex h-11 w-full items-center justify-center rounded-md border border-black/12 bg-white/70 px-6 text-[15px] font-semibold text-[#3f3f46] shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur transition-colors hover:bg-white hover:text-[#171717] sm:w-auto"
      >
        See pricing
      </Link>
    </div>
  )
}

export function Hero(): JSX.Element {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-14 text-center sm:pt-24">
      <AnnouncementBar className="mb-6" />

      <h1 className="mx-auto max-w-3xl text-[40px] leading-[1.05] font-semibold tracking-tight text-[#141414] sm:text-[60px]">
        The{' '}
        <span className="text-primary relative whitespace-nowrap">
          growth
          <span
            aria-hidden
            className="border-primary/45 absolute right-0 -bottom-1 left-0 border-b-[3px] border-dashed"
          />
        </span>{' '}
        engine for your AI Search
        <Sparkle size={30} className="text-primary mx-1 inline-block align-middle sm:size-[42px]" />
        visibility
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#6b6b6b] sm:text-lg">
        Track and optimize visibility in ChatGPT, Gemini and other AI Search engines to drive
        traffic to your website that converts.
      </p>

      <HeroCtas />

      <p className="mt-5 text-[13px] font-medium text-[#8a8a8a]">
        No credit card required · 50 free prompts · Setup in 2 minutes
      </p>

      <Image
        src="/hero-compass.png"
        alt="Illustration of a hand gripping a compass"
        width={667}
        height={572}
        priority
        className="mt-8 h-auto w-full max-w-[440px] select-none sm:mt-10 sm:max-w-[540px]"
      />
    </section>
  )
}
