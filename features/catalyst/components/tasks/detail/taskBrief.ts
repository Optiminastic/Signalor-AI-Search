import { formatEffort } from '@/features/catalyst/tasks-data'
import { GEO_PILLARS } from '@/hooks/usePillars'
import type { TaskDetail } from '@/hooks/useTaskDetail'

/** Max fix-guide characters carried into a URL-prefilled prompt. */
const GUIDE_URL_LIMIT = 1200

function pillarLabel(pillar: string): string {
  return GEO_PILLARS.find(p => String(p.key) === `${pillar}_score`)?.label ?? pillar
}

function metaLines(task: TaskDetail, siteUrl: string): string {
  const lines = [
    siteUrl && `- Site: ${siteUrl}`,
    task.pillar && `- GEO pillar: ${pillarLabel(task.pillar)}`,
    `- Priority: ${task.priority}`,
    task.measuredLift != null && `- Measured GEO-score lift: +${task.measuredLift} points`,
    `- Estimated effort: ${formatEffort(task.effort)}`,
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * The full task as an LLM-ready Markdown brief — what "Copy task" puts on the
 * clipboard. Includes everything: context, why it matters, and the fix guide.
 */
export function buildTaskBrief(task: TaskDetail, siteUrl: string): string {
  const sections = [
    `# GEO task: ${task.title}`,
    metaLines(task, siteUrl),
    task.description && `## Why it matters\n${task.description}`,
    task.actionGuide && `## How to fix\n${task.actionGuide}`,
    '## What I need from you\nGive me a concrete implementation plan for my site, then produce the exact content or code to apply. Ask me for any missing specifics (page URLs, brand facts, tech stack) before assuming.',
  ]
  return sections.filter(Boolean).join('\n\n')
}

/**
 * A tighter version of the brief for URL-prefilled chats (ChatGPT / Claude),
 * where very long query strings get truncated by the browser or the app.
 */
export function buildTaskPrompt(task: TaskDetail, siteUrl: string): string {
  const guide =
    task.actionGuide.length > GUIDE_URL_LIMIT
      ? `${task.actionGuide.slice(0, GUIDE_URL_LIMIT)}\n[guide truncated]`
      : task.actionGuide
  const sections = [
    `Help me complete this GEO (Generative Engine Optimization) task on my website.`,
    `Task: ${task.title}`,
    metaLines(task, siteUrl),
    task.description && `Why it matters: ${task.description}`,
    guide && `Fix instructions:\n${guide}`,
    'Walk me through implementing this step by step, and write the exact content or code I should apply. Ask about anything you need to know about my site first.',
  ]
  return sections.filter(Boolean).join('\n\n')
}
