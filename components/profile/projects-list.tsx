import { formatDate } from '@/lib/format'
import { Plus } from '@/lib/icons'
import type { AccountProject } from '@/services/account.service'

import { DeleteProjectButton } from './delete-project-button'
import { SectionCard } from './section-card'

function ProjectRow({ project }: { project: AccountProject }): JSX.Element {
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--cat-hover)] text-[13px] font-semibold text-[var(--cat-ink)] uppercase">
        {project.name[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--cat-ink)]">{project.name}</p>
        <p className="truncate text-xs text-[var(--cat-ink-3)]">{project.url}</p>
      </div>
      <span className="hidden shrink-0 text-xs text-[var(--cat-ink-3)] sm:inline">
        Added {formatDate(project.createdAt)}
      </span>
      <DeleteProjectButton id={project.id} name={project.name} />
    </li>
  )
}

interface ProjectsListProps {
  projects: AccountProject[]
  /** Undefined means unlimited. */
  max?: number
}

/** The user's projects/organizations with an add action. */
export function ProjectsList({ projects, max }: ProjectsListProps): JSX.Element {
  // `max` is undefined for uncapped accounts — no denominator, and the add
  // button must never be disabled against a limit that doesn't exist.
  const atCapacity = max !== undefined && projects.length >= max
  const usageLabel =
    max === undefined
      ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`
      : `${projects.length} of ${max} used`
  const addButton = (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--cat-border)] bg-[var(--cat-card)] px-3 text-[13px] font-medium text-[var(--cat-ink)] transition hover:bg-[var(--cat-hover)] disabled:opacity-50"
      disabled={atCapacity}
    >
      <Plus className="h-3.5 w-3.5" />
      New
    </button>
  )
  return (
    <SectionCard title="Projects" description={usageLabel} action={addButton} flush>
      <ul className="divide-y divide-[var(--cat-border-soft)]">
        {projects.map(p => (
          <ProjectRow key={p.id} project={p} />
        ))}
      </ul>
    </SectionCard>
  )
}
