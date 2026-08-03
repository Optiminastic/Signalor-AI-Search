import { cn } from '@/features/site/lib/utils'

interface HomeSectionHeaderProps {
  eyebrow: string
  headingId: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  /** 'lg' is the oversized treatment used by the anchor sections. */
  size?: 'md' | 'lg'
  /**
   * A phrase inside `title` to mark with the brand highlight. Only applies when
   * `title` is a plain string — there is nothing to search in a node.
   */
  highlight?: string
}

/** Soft brand marker behind a phrase. The one accent the design system allows. */
function Marked({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden
        className="bg-primary/12 absolute inset-x-[-0.15em] bottom-[0.06em] -z-10 h-[0.52em] rounded-[2px]"
      />
      {children}
    </span>
  )
}

/** Split the title around `highlight` so only that phrase carries the marker. */
function renderTitle(title: React.ReactNode, highlight?: string): React.ReactNode {
  if (!highlight || typeof title !== 'string') return title
  const at = title.indexOf(highlight)
  if (at === -1) return title
  return (
    <>
      {title.slice(0, at)}
      <Marked>{highlight}</Marked>
      {title.slice(at + highlight.length)}
    </>
  )
}

export function HomeSectionHeader({
  eyebrow,
  headingId,
  title,
  description,
  align = 'center',
  size = 'md',
  highlight,
}: HomeSectionHeaderProps): JSX.Element {
  const centered = align === 'center'
  const large = size === 'lg'
  return (
    <div
      className={cn(
        large ? 'max-w-3xl' : 'max-w-2xl',
        centered ? 'mx-auto text-center' : 'text-left',
      )}
    >
      <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className={cn(
          'text-foreground font-semibold tracking-tight text-balance',
          large ? 'mt-4 text-4xl sm:text-5xl lg:text-6xl' : 'mt-3 text-3xl sm:text-4xl',
        )}
      >
        {renderTitle(title, highlight)}
      </h2>
      {description ? (
        <p
          className={cn(
            'text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg',
            centered && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
