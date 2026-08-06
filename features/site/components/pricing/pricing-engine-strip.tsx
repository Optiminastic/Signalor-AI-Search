import Image from 'next/image'

const MODELS = [
  { name: 'ChatGPT', src: '/logos/chatgpt.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
  { name: 'Copilot', src: '/logos/copilot.svg' },
  { name: 'Google', src: '/logos/google.svg' },
] as const

/** Which AI models every plan tracks, shown as icon + name chips. */
export function PricingEngineStrip(): JSX.Element {
  return (
    <div className="mx-auto mt-10 max-w-xl">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        Every plan tracks your brand across these AI models
      </p>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {MODELS.map(model => (
          <li
            key={model.name}
            className="flex items-center gap-1.5 opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={model.src}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain"
            />
            <span className="text-muted-foreground text-sm font-medium">{model.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
