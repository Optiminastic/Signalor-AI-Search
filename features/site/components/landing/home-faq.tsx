'use client'

import { useState } from 'react'

import { ChevronDown } from '@/features/site/components/icons'
import { GridCornerHandles, GridHandle } from '@/features/site/components/landing/home-grid'
import { MailLink } from '@/features/site/components/mail-link'
import { cn } from '@/features/site/lib/utils'

type FaqItem = { question: string; answer: string }

interface HomeFaqProps {
  items: FaqItem[]
}

interface FaqRowProps {
  item: FaqItem
  index: number
  isOpen: boolean
  onToggle: () => void
}

function FaqRow({ item, index, isOpen, onToggle }: FaqRowProps): JSX.Element {
  const panelId = `home-faq-panel-${index}`
  const buttonId = `home-faq-trigger-${index}`
  return (
    <li
      className={cn(
        'rounded-lg transition-all duration-200',
        isOpen ? 'bg-card ring-primary/40 shadow-sm ring-1 shadow-black/5' : 'hover:bg-muted/40',
      )}
    >
      <h3 className="text-foreground m-0 text-[15px] leading-snug font-medium">
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
        >
          <span className="min-w-0 pr-2">{item.question}</span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="text-muted-foreground px-4 pr-10 pb-5 text-sm leading-relaxed sm:px-5">
            {item.answer}
          </p>
        </div>
      </div>
    </li>
  )
}

export function HomeFaq({ items }: HomeFaqProps): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20" aria-labelledby="home-faq-heading">
      <div className="border-border relative border-t">
        <GridCornerHandles top />
        <GridHandle className="-top-[3.5px] left-[40%] -ml-[3.5px] hidden lg:block" />
        <div className="lg:divide-border grid lg:grid-cols-[2fr_3fr] lg:divide-x">
          <div className="max-lg:border-border relative max-lg:border-b">
            <div className="px-6 py-14 sm:px-10 lg:sticky lg:top-24 lg:py-20">
              <p className="text-primary text-[12px] font-semibold tracking-[0.18em] uppercase">
                FAQ
              </p>
              <h2
                id="home-faq-heading"
                className="text-foreground mt-3 max-w-sm text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              >
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground mt-4 max-w-sm text-base leading-relaxed text-pretty">
                Can&rsquo;t find what you&rsquo;re looking for?{' '}
                <MailLink
                  user="hello"
                  subject="Question about SignalorAI"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Contact our support team
                </MailLink>
                .
              </p>
            </div>
          </div>
          <div className="px-4 py-10 sm:px-8 lg:py-14">
            <ul className="space-y-1.5">
              {items.map((item, index) => (
                <FaqRow
                  key={item.question}
                  item={item}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
