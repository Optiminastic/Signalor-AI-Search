import { z } from 'zod'

import { apiGet, apiPost } from './client'

/**
 * GitHub App — org-scoped connect used in onboarding. Installing the app lets
 * SignalorAI open fix PRs (schema, llms.txt, robots, canonical) on the connected
 * Next.js repo. See ranking-be `apps.github_agent`.
 */

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export const githubOrgStatusSchema = z.object({
  configured: z.boolean().optional().default(false),
  connected: z.boolean().optional().default(false),
  repo_full_name: z.string().optional().default(''),
  /** Every repo the install granted — the user picks which one fixes target. */
  repositories: z.array(z.string()).optional().default([]),
  /** Pinned to this repo, so an install callback can't move it. */
  repo_locked: z.boolean().optional().default(false),
  /** The install granted several repos and none clearly matched the brand's
   *  domain, so nothing is targeted until the user chooses. */
  needs_repo_choice: z.boolean().optional().default(false),
  /** Why the current repo was chosen, in words. */
  repo_reason: z.string().optional().default(''),
})
export type GithubOrgStatus = z.infer<typeof githubOrgStatusSchema>

/** Query params for the brand-scoped GitHub endpoints. */
function orgParams(email: string, orgId?: number): Record<string, string | undefined> {
  return { email: normalizeEmail(email), org_id: orgId ? String(orgId) : undefined }
}

/** GET /api/github/status/?email=&org_id= → whether this brand's GitHub App is
 *  connected. Without `org_id` the backend answers for the account's first brand,
 *  so every brand reports the same state. */
export async function getOrgGithubStatus(email: string, orgId?: number): Promise<GithubOrgStatus> {
  return githubOrgStatusSchema.parse(
    await apiGet<unknown>('/api/github/status/', { params: orgParams(email, orgId) }),
  )
}

/** GET /api/github/install-url/?email=&org_id= → the GitHub App installation URL. */
export async function getOrgGithubInstallUrl(email: string, orgId?: number): Promise<string> {
  const data = await apiGet<unknown>('/api/github/install-url/', {
    params: orgParams(email, orgId),
  })
  return z.object({ install_url: z.string() }).parse(data).install_url
}

/** POST /api/github/disconnect/?email=&org_id= → unlink this brand's GitHub App
 *  installation (deactivates it) so the user can reconnect a different repo. */
export async function disconnectOrgGithub(email: string, orgId?: number): Promise<void> {
  await apiPost<unknown>('/api/github/disconnect/', undefined, {
    params: orgParams(email, orgId),
  })
}

/** POST /api/github/select-repo/ → choose which granted repo fixes target (used
 *  when the App was installed on "all repositories" and we can't guess). */
export async function selectOrgGithubRepo(
  email: string,
  repoFullName: string,
  orgId?: number,
): Promise<void> {
  await apiPost<unknown>('/api/github/select-repo/', {
    email: normalizeEmail(email),
    repo_full_name: repoFullName,
    org_id: orgId,
  })
}

// ─── Run-scoped GitHub Auto-Fix (opens one fix PR per finding on the repo) ─────

export const githubJobSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'running', 'open', 'merged', 'closed', 'failed']),
  finding_codes: z.array(z.string()).default([]),
  pr_number: z.number().nullable(),
  pr_url: z.string().optional().default(''),
  files_changed: z.array(z.object({ path: z.string(), summary: z.string() })).default([]),
  reasoning: z.string().optional().default(''),
  error_message: z.string().optional().default(''),
  score_before: z.number().nullable(),
  score_after: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type GithubJob = z.infer<typeof githubJobSchema>

export const githubRunStatusSchema = z.object({
  configured: z.boolean().optional().default(false),
  connected: z.boolean().optional().default(false),
  repo_full_name: z.string().optional().default(''),
  repositories: z.array(z.string()).default([]),
  supported_findings: z.record(z.string(), z.string()).default({}),
  fixability: z
    .record(z.string(), z.object({ fixable: z.boolean(), reason: z.string() }))
    .default({}),
  jobs: z.array(githubJobSchema).default([]),
})
export type GithubRunStatus = z.infer<typeof githubRunStatusSchema>

const fixJobStubSchema = z.object({
  finding_code: z.string(),
  job_id: z.number(),
  status: z.string(),
})
export type GithubFixJobStub = z.infer<typeof fixJobStubSchema>

function runBase(slug: string): string {
  return `/api/github/runs/s/${slug}`
}

/** GET run GitHub status: connection, per-finding fixability, and fix jobs. */
export async function getGithubStatus(slug: string): Promise<GithubRunStatus> {
  return githubRunStatusSchema.parse(await apiGet<unknown>(`${runBase(slug)}/status/`))
}

/** GET the App install URL scoped to this run (carries the slug back on callback). */
export async function getGithubInstallUrl(slug: string): Promise<string> {
  const data = await apiGet<unknown>(`${runBase(slug)}/install-url/`)
  return z.object({ install_url: z.string() }).parse(data).install_url
}

/** POST to open one fix PR per finding code. Returns the created job stubs. */
export async function requestGithubFix(
  slug: string,
  findingCodes: string[],
): Promise<GithubFixJobStub[]> {
  const data = await apiPost<unknown>(`${runBase(slug)}/fix/`, { finding_codes: findingCodes })
  return z.object({ jobs: z.array(fixJobStubSchema) }).parse(data).jobs
}

/** GET all fix jobs for the run (poll for PR/merge state + score delta). */
export async function getGithubJobs(slug: string): Promise<GithubJob[]> {
  const data = await apiGet<unknown>(`${runBase(slug)}/jobs/`)
  return z.object({ jobs: z.array(githubJobSchema) }).parse(data).jobs
}

/**
 * The newest fix job whose `finding_codes` include `findingCode`, or null.
 * This is the durable link between a task/recommendation and its GitHub fix job:
 * no job id is stored on the task, so the finding code is the join. Matching this
 * way (rather than a session-remembered job id) is what lets the fix state and PR
 * resume after a page refresh.
 */
export function latestJobForFinding(jobs: GithubJob[], findingCode: string): GithubJob | null {
  if (!findingCode) return null
  let best: GithubJob | null = null
  for (const job of jobs) {
    if (job.finding_codes.includes(findingCode) && (!best || job.id > best.id)) best = job
  }
  return best
}

/** True while a job is still being worked (so pollers keep polling). */
export function isJobInFlight(job: GithubJob | null | undefined): boolean {
  return job?.status === 'pending' || job?.status === 'running'
}

// Signals that a fix failed because of the GitHub *connection* (the App was
// uninstalled, its repo access revoked, or its token can't be minted) rather than
// the agent's work — so the fix is the ground-truth health check for the install.
const INTEGRATION_ERROR_PATTERNS = [
  /installation token/i,
  /installation access token/i,
  /mint\b/i,
  /not found/i,
  /\b40[13]\b/, // 401 unauthorized / 403 forbidden / 404 not found
  /not installed|uninstalled|suspended|revoked/i,
  /bad credentials/i,
  /app.*not.*authoriz/i,
]

/** Whether a fix job's error is an integration/auth problem (needs a reconnect)
 *  rather than an agent failure — used to guide the user before they retry. */
export function isGithubIntegrationError(message: string | null | undefined): boolean {
  if (!message) return false
  return INTEGRATION_ERROR_PATTERNS.some(pattern => pattern.test(message))
}
