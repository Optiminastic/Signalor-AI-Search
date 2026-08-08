/**
 * Centralized query keys. Group by feature so cache invalidation has a single source of truth.
 */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  user: {
    me: ['user', 'me'] as const,
    byId: (id: string) => ['user', id] as const,
  },
  catalyst: {
    orgs: (email: string) => ['catalyst', 'orgs', email] as const,
    runs: (orgId: number, email: string) => ['catalyst', 'runs', orgId, email] as const,
    visibility: (slug: string) => ['catalyst', 'visibility', slug] as const,
    competitors: (slug: string) => ['catalyst', 'competitors', slug] as const,
    brandProfile: (orgSlug: string) => ['catalyst', 'brand-profile', orgSlug] as const,
    prompts: (slug: string) => ['catalyst', 'prompts', slug] as const,
    entityResolution: (slug: string | undefined) =>
      ['catalyst', 'entity-resolution', slug] as const,
    promptResult: (slug: string, trackId: number, resultId: number) =>
      ['catalyst', 'prompt-result', slug, trackId, resultId] as const,
    recommendations: (slug: string) => ['catalyst', 'recommendations', slug] as const,
    sitemap: (slug: string) => ['catalyst', 'sitemap', slug] as const,
    backlinks: (slug: string) => ['catalyst', 'backlinks', slug] as const,
    tasks: (email: string) => ['catalyst', 'tasks', email] as const,
    agentPlan: (slug: string) => ['catalyst', 'agent-plan', slug] as const,
    projection: (slug: string) => ['catalyst', 'projection', slug] as const,
    integrations: (email: string, orgId: number) =>
      ['catalyst', 'integrations', email, orgId] as const,
    worldVisibility: (slug: string) => ['catalyst', 'world-visibility', slug] as const,
  },
  runs: {
    byOrg: (orgId: number) => ['runs', 'org', orgId] as const,
    byEmail: (email: string) => ['runs', 'email', email] as const,
  },
  backlinks: {
    auto: (slug: string) => ['backlinks', 'auto', slug] as const,
    schedule: (slug: string) => ['backlinks', 'schedule', slug] as const,
  },
} as const
