import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div
      // cat-card-edge: BoardUI's 1px light top-line in dark mode (see globals.css).
      className={`cat-card-edge flex flex-col rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] p-3 ${className}`}
    >
      {children}
    </div>
  )
}
