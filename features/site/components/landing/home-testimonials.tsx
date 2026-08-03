import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { TESTIMONIALS, type Testimonial } from '@/features/site/lib/landing-testimonials-content'

const [FEATURED, ...SUPPORTING] = TESTIMONIALS

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Renders the quote with its emphasis phrases bolded, Omnia-editorial style. */
function EmphasizedQuote({ testimonial }: { testimonial: Testimonial }): JSX.Element {
  if (testimonial.emphasis.length === 0) {
    return <>{testimonial.quote}</>
  }
  const pattern = new RegExp(`(${testimonial.emphasis.map(escapeRegExp).join('|')})`)
  return (
    <>
      {testimonial.quote.split(pattern).map((part, index) =>
        testimonial.emphasis.includes(part) ? (
          <strong key={index} className="text-foreground font-semibold">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

function Attribution({ testimonial }: { testimonial: Testimonial }): JSX.Element {
  return (
    <figcaption className="flex items-center gap-3">
      <span
        aria-hidden
        className="bg-muted text-foreground ring-border flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ring-1"
      >
        {testimonial.initials}
      </span>
      <div className="min-w-0">
        <p className="text-foreground truncate text-[13px] font-semibold">
          <cite className="not-italic">{testimonial.name}</cite>
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {testimonial.role} · {testimonial.company}
        </p>
      </div>
    </figcaption>
  )
}

/** The lead voice: a big editorial quote with the outcome stat beside it. */
function FeaturedQuote(): JSX.Element {
  return (
    <figure className="grid gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_auto] lg:gap-16 lg:py-16">
      <div>
        <blockquote className="text-muted-foreground max-w-2xl text-xl leading-snug tracking-tight text-pretty sm:text-2xl">
          &ldquo;
          <EmphasizedQuote testimonial={FEATURED} />
          &rdquo;
        </blockquote>
        <div className="mt-8">
          <Attribution testimonial={FEATURED} />
        </div>
      </div>
      {FEATURED.metric ? (
        <div className="border-foreground/15 h-fit max-w-55 border-l-2 pl-5 lg:self-center">
          <p className="text-foreground text-5xl font-semibold tracking-tight tabular-nums">
            {FEATURED.metric.value}
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {FEATURED.metric.label}
          </p>
        </div>
      ) : null}
    </figure>
  )
}

function SupportingQuote({ testimonial }: { testimonial: Testimonial }): JSX.Element {
  return (
    <figure className="flex flex-col gap-6 px-6 py-10 sm:px-10">
      <blockquote className="text-muted-foreground flex-1 text-[15px] leading-relaxed text-pretty">
        &ldquo;
        <EmphasizedQuote testimonial={testimonial} />
        &rdquo;
      </blockquote>
      <Attribution testimonial={testimonial} />
    </figure>
  )
}

/** Asymmetric header: headline left, supporting copy bottom-right. */
function TestimonialsHeader(): JSX.Element {
  return (
    <div className="grid gap-6 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
          In their words
        </p>
        <h2
          id="home-testimonials-heading"
          className="text-foreground mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Teams running weekly GEO sprints
        </h2>
      </div>
      <p className="text-muted-foreground max-w-md text-base leading-relaxed lg:self-end lg:justify-self-end">
        Real outcomes from growth, content, and DTC teams shipping SignalorAI into their existing
        workflow.
      </p>
    </div>
  )
}

export function HomeTestimonials(): JSX.Element {
  return (
    <section aria-labelledby="home-testimonials-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <TestimonialsHeader />
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <FeaturedQuote />
        </div>
        <div className="border-border relative border-t">
          <GridCornerHandles top />
          <GridHandle className="-top-[3.5px] left-1/2 -ml-[3.5px] hidden lg:block" />
          <div className="divide-border grid max-lg:divide-y lg:grid-cols-2 lg:divide-x">
            {SUPPORTING.map(testimonial => (
              <SupportingQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
