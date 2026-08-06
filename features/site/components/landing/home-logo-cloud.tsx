import Image from 'next/image'

import { MeasureBox } from '@/features/site/components/landing/home-grid'

type EngineLogo = {
  name: string
  src: string
}

const ENGINE_LOGOS: EngineLogo[] = [
  { name: 'ChatGPT', src: '/logos/chatgpt.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
  { name: 'Copilot', src: '/logos/copilot.svg' },
  { name: 'Google AI', src: '/logos/google.svg' },
]

export function HomeLogoCloud(): JSX.Element {
  return (
    <section className="border-border border-t" aria-label="Supported AI engines">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
        <p className="text-muted-foreground text-center text-[13px] font-medium">
          Tracking your brand across every major AI engine
        </p>
        <MeasureBox className="mx-auto mt-6 w-fit">
          <ul className="bg-card ring-border flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-lg px-6 py-3.5 shadow-sm ring-1 shadow-black/5 sm:gap-x-10 sm:px-8">
            {ENGINE_LOGOS.map(logo => (
              <li
                key={logo.name}
                className="flex items-center gap-2 opacity-65 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
                <span className="text-foreground/80 text-sm font-semibold">{logo.name}</span>
              </li>
            ))}
          </ul>
        </MeasureBox>
      </div>
    </section>
  )
}
