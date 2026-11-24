import Image from 'next/image'

import { ChevronRight } from '@/features/site/components/icons'
import type { BlogAuthor } from '@/features/site/lib/blog-authors'

interface BlogCardFooterProps {
  authors: BlogAuthor[]
}

/**
 * Card footer: author avatars + names on the left, a decorative "Read" affordance
 * on the right. The whole card is already linked via the title overlay, so "Read"
 * is a `span`, not a nested anchor.
 */
export function BlogCardFooter({ authors }: BlogCardFooterProps): React.ReactElement {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-2 pt-4">
      <div className="space-y-2">
        {authors.map(author => (
          <div key={author.name} className="grid grid-cols-[auto_1fr] items-center gap-2">
            <div className="ring-border bg-card ring-foreground/10 flex grid aspect-square size-6 h-5 w-5 shrink-0 place-items-center items-center justify-center overflow-hidden rounded-sm rounded-xs bg-white shadow ring-1">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-primary-ink text-[11px] leading-none font-bold">
                  {author.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-muted-foreground line-clamp-1 text-sm">{author.name}</span>
          </div>
        ))}
      </div>

      <div className="flex h-6 items-center">
        <span className="text-primary-ink group-hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors duration-200">
          Read
          <ChevronRight className="size-3.5 translate-y-px duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  )
}
