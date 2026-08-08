interface BacklinksMessageProps {
  title: string
  detail?: string
}

/** A centered status card used for loading / error / no-run states. */
export function BacklinksMessage({ title, detail }: BacklinksMessageProps): JSX.Element {
  return (
    <div className="cat-rise cat-card-edge flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--cat-card-border)] bg-[var(--cat-card)] px-6 py-14 text-center">
      <p className="text-[14px] font-medium text-[var(--cat-ink)]">{title}</p>
      {detail && <p className="text-[13px] text-[var(--cat-ink-3)]">{detail}</p>}
    </div>
  )
}
