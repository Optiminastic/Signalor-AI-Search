import Image from 'next/image'

/** "Google AI" rather than "Google", so it reads as the AI surface next to
 *  Gemini rather than looking like the same company listed twice. Matches the
 *  label already used by the homepage logo cloud. */
const MODELS = [
  { name: 'ChatGPT', src: '/logos/chatgpt.svg' },
  { name: 'Claude', src: '/logos/claude.svg' },
  { name: 'Gemini', src: '/logos/gemini.svg' },
  { name: 'Perplexity', src: '/logos/perplexity.svg' },
  { name: 'Copilot', src: '/logos/copilot.svg' },
  { name: 'Google AI', src: '/logos/google.svg' },
] as const

/**
 * Which AI models every plan tracks.
 *
 * Wide enough for all six on one line: at `max-w-xl` the sixth wrapped alone
 * and a single centred orphan reads as a layout bug rather than a list. Kept
 * legible too — the old 60% opacity on greyscale looked like a failed image
 * load rather than a deliberately quiet row.
 */
export function PricingEngineStrip(): JSX.Element {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <p className="text-muted-foreground text-[12px]">Every plan tracks all six answer engines</p>
      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        {MODELS.map(model => (
          <li
            key={model.name}
            className="flex items-center gap-1.5 opacity-80 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={model.src}
              alt=""
              width={17}
              height={17}
              className="h-[17px] w-[17px] object-contain"
            />
            <span className="text-foreground/75 text-[13.5px] font-medium">{model.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
