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
  /** Agent mode (ranking-be apps.growth_agent), keyed on the org slug from the URL. */
  agentMode: {
    all: (orgSlug: string) => ['agent-mode', orgSlug] as const,
    program: (orgSlug: string) => ['agent-mode', orgSlug, 'program'] as const,
    chats: (orgSlug: string) => ['agent-mode', orgSlug, 'chats'] as const,
    chat: (orgSlug: string, chatId: string) => ['agent-mode', orgSlug, 'chats', chatId] as const,
    approvals: (orgSlug: string) => ['agent-mode', orgSlug, 'approvals'] as const,
    planActions: (orgSlug: string) => ['agent-mode', orgSlug, 'plan-actions'] as const,
    activity: (orgSlug: string) => ['agent-mode', orgSlug, 'activity'] as const,
    finders: (orgSlug: string) => ['agent-mode', orgSlug, 'finders'] as const,
    indexing: (orgSlug: string) => ['agent-mode', orgSlug, 'indexing'] as const,
    satelliteRanks: (orgSlug: string) => ['agent-mode', orgSlug, 'satellite-ranks'] as const,
    social: (orgSlug: string) => ['agent-mode', orgSlug, 'social'] as const,
    action: (orgSlug: string, actionId: string) =>
      ['agent-mode', orgSlug, 'actions', actionId] as const,
  },
  backlinks: {
    auto: (slug: string) => ['backlinks', 'auto', slug] as const,
    schedule: (slug: string) => ['backlinks', 'schedule', slug] as const,
  },
} as const
